import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { config } from '../config/config.js';
import {
  registerValidation,
  loginValidation,
  twoFactorValidation,
  secureSessionValidation,
  validate,
  sanitizeInput
} from '../middleware/validation.js';
import {
  readUsers,
  writeUsers,
  readLoginAttempts,
  writeLoginAttempts,
  addSessionToken,
  validateSessionToken,
  removeSessionToken
} from '../utils/fileHandler.js';
import { deleteMessagesForUser, deleteRoom, getRooms } from '../utils/roomManager.js';

const router = express.Router();

// Normal Mode - Register
router.post('/normal/register', registerValidation, validate, async (req, res) => {
  try {
    // Sanitize inputs
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;
    const username = sanitizeInput(req.body.username);

    // Read existing users
    const users = readUsers();

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username already exists
    const existingUsername = users.find(u => u.username === username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      username,
      password: hashedPassword, // Store hashed password
      twoFactorEnabled: false,
      twoFactorSecret: null,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Add user to database
    users.push(newUser);
    writeUsers(users);

    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, mode: 'normal' },
      config.JWT_SECRET,
      { expiresIn: config.TOKEN_EXPIRY }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        twoFactorEnabled: newUser.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Normal Mode - Login
router.post('/normal/login', loginValidation, validate, async (req, res) => {
  try {
    // Sanitize inputs
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;
    const twoFactorCode = req.body.twoFactorCode;

    // Check login attempts
    const loginAttempts = readLoginAttempts();
    const userAttempts = loginAttempts[email] || { count: 0, lockedUntil: null };

    // Check if account is locked
    if (userAttempts.lockedUntil && new Date(userAttempts.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(userAttempts.lockedUntil) - new Date()) / 1000 / 60);
      return res.status(423).json({
        error: `Account locked. Try again in ${remainingTime} minute(s)`,
        lockedUntil: userAttempts.lockedUntil
      });
    }

    // Find user
    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      // Increment failed attempts
      loginAttempts[email] = {
        count: (userAttempts.count || 0) + 1,
        lockedUntil: null
      };

      if (loginAttempts[email].count >= config.MAX_LOGIN_ATTEMPTS) {
        loginAttempts[email].lockedUntil = new Date(Date.now() + config.LOCKOUT_DURATION).toISOString();
      }

      writeLoginAttempts(loginAttempts);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      loginAttempts[email] = {
        count: (userAttempts.count || 0) + 1,
        lockedUntil: null
      };

      if (loginAttempts[email].count >= config.MAX_LOGIN_ATTEMPTS) {
        loginAttempts[email].lockedUntil = new Date(Date.now() + config.LOCKOUT_DURATION).toISOString();
      }

      writeLoginAttempts(loginAttempts);

      const remainingAttempts = config.MAX_LOGIN_ATTEMPTS - loginAttempts[email].count;
      return res.status(401).json({
        error: 'Invalid credentials',
        remainingAttempts: Math.max(0, remainingAttempts)
      });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    // Reset login attempts on successful login
    delete loginAttempts[email];
    writeLoginAttempts(loginAttempts);

    // Update last login time
    user.lastLogin = new Date().toISOString();
    writeUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, mode: 'normal' },
      config.JWT_SECRET,
      { expiresIn: config.TOKEN_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Normal Mode - Enable 2FA
router.post('/normal/enable-2fa', twoFactorValidation, validate, async (req, res) => {
  try {
    const { userId } = req.body;

    const users = readUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `StealthLAN (${user.email})`,
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (will be confirmed later)
    user.twoFactorSecretTemp = secret.base32;
    writeUsers(users);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: '2FA setup failed' });
  }
});

// Normal Mode - Confirm 2FA
router.post('/normal/confirm-2fa', twoFactorValidation, validate, async (req, res) => {
  try {
    const { userId, code } = req.body;

    const users = readUsers();
    const user = users.find(u => u.id === userId);

    if (!user || !user.twoFactorSecretTemp) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecretTemp,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorSecret = user.twoFactorSecretTemp;
    delete user.twoFactorSecretTemp;
    writeUsers(users);

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA confirmation error:', error);
    res.status(500).json({ error: '2FA confirmation failed' });
  }
});

// Secure Mode - Create Session
router.post('/secure/create-session', secureSessionValidation, validate, async (req, res) => {
  try {
    // Sanitize inputs
    const username = sanitizeInput(req.body.username);
    const enable2FA = Boolean(req.body.enable2FA);

    const sessionId = uuidv4();
    const sessionToken = jwt.sign(
      { sessionId, username, mode: 'secure' },
      config.JWT_SECRET,
      { expiresIn: config.SESSION_EXPIRY }
    );

    let twoFactorData = null;

    // Generate temporary 2FA if requested
    if (enable2FA) {
      const secret = speakeasy.generateSecret({
        name: `StealthLAN Secure (${username})`,
        length: 32
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      twoFactorData = {
        secret: secret.base32,
        qrCode: qrCodeUrl
      };
    }

    // Store session token
    addSessionToken(sessionId, {
      username,
      token: sessionToken,
      twoFactorSecret: enable2FA ? twoFactorData.secret : null,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      sessionToken,
      sessionId,
      username,
      twoFactorData
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Session creation failed' });
  }
});

// Secure Mode - Validate Session
router.post('/secure/validate-session', async (req, res) => {
  try {
    const { sessionToken, twoFactorCode } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    // Verify JWT
    const decoded = jwt.verify(sessionToken, config.JWT_SECRET);
    const session = validateSessionToken(decoded.sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check 2FA if enabled
    if (session.twoFactorSecret) {
      if (!twoFactorCode) {
        return res.status(200).json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: session.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    res.json({
      success: true,
      session: {
        sessionId: decoded.sessionId,
        username: session.username
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Secure Mode - End Session
router.post('/secure/end-session', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    const decoded = jwt.verify(sessionToken, config.JWT_SECRET);
    const sessionId = decoded.sessionId;
    
    // Delete all messages from rooms created by this user in secure mode
    deleteMessagesForUser(sessionId, 'secure');
    
    // Delete all rooms created by this user in secure mode
    const rooms = getRooms('secure');
    rooms.forEach(room => {
      if (room.createdBy === sessionId) {
        deleteRoom(room.id, 'secure');
        console.log(`Deleted secure room on session end: ${room.name} (${room.id})`);
      }
    });
    
    // Remove session token
    removeSessionToken(sessionId);

    res.json({ success: true, message: 'Session ended and all data deleted' });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;
