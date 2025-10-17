import { body, validationResult } from 'express-validator';
import xss from 'xss';

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  return input;
};

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Registration validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .trim()
    .escape()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric with _ or -'),
];

// Login validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('2FA code must be 6 digits'),
];

// 2FA validation rules
export const twoFactorValidation = [
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('code')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code must be 6 digits'),
];

// Secure session validation rules
export const secureSessionValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .trim()
    .escape()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric with _ or -'),
  body('enable2FA')
    .optional()
    .isBoolean()
    .withMessage('enable2FA must be boolean'),
];

// Socket event validation
export const validateSocketData = {
  roomCreate: (data, mode = 'normal') => {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Room name is required');
    } else if (data.name.length < 3 || data.name.length > 50) {
      errors.push('Room name must be 3-50 characters');
    }
    
    if (data.description && data.description.length > 200) {
      errors.push('Description must be less than 200 characters');
    }
    
    // In secure mode, password is mandatory
    if (mode === 'secure' && (!data.password || data.password.trim().length === 0)) {
      errors.push('Password is required for secure mode rooms');
    }
    
    if (data.password && (data.password.length < 4 || data.password.length > 50)) {
      errors.push('Password must be 4-50 characters');
    }
    
    if (data.timeLimit && (isNaN(data.timeLimit) || data.timeLimit < 1 || data.timeLimit > 1440)) {
      errors.push('Time limit must be between 1 and 1440 minutes');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        name: sanitizeInput(data.name),
        description: data.description ? sanitizeInput(data.description) : '',
        password: data.password || null,
        burnAfterReading: Boolean(data.burnAfterReading),
        timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
      }
    };
  },

  roomJoin: (data) => {
    const errors = [];
    
    if (!data.roomId || typeof data.roomId !== 'string') {
      errors.push('Room ID is required');
    }
    
    if (data.password && typeof data.password !== 'string') {
      errors.push('Invalid password format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        roomId: data.roomId,
        password: data.password || '',
      }
    };
  },

  messageSend: (data) => {
    const errors = [];
    
    if (!data.roomId || typeof data.roomId !== 'string') {
      errors.push('Room ID is required');
    }
    
    if (!data.content || typeof data.content !== 'string') {
      errors.push('Message content is required');
    } else if (data.content.length > 5000) {
      errors.push('Message content must be less than 5000 characters');
    }
    
    if (!data.type || !['text', 'audio', 'image', 'video', 'file'].includes(data.type)) {
      errors.push('Invalid message type');
    }
    
    // Validate file URL if present
    if (data.fileUrl && typeof data.fileUrl !== 'string') {
      errors.push('Invalid file URL format');
    }
    
    if (data.fileName && data.fileName.length > 255) {
      errors.push('File name too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        roomId: data.roomId,
        content: sanitizeInput(data.content),
        type: data.type,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName ? sanitizeInput(data.fileName) : null,
      }
    };
  },

  messageReact: (data) => {
    const errors = [];
    
    if (!data.roomId || typeof data.roomId !== 'string') {
      errors.push('Room ID is required');
    }
    
    if (!data.messageId || typeof data.messageId !== 'string') {
      errors.push('Message ID is required');
    }
    
    if (!data.emoji || typeof data.emoji !== 'string' || data.emoji.length > 10) {
      errors.push('Invalid emoji');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        roomId: data.roomId,
        messageId: data.messageId,
        emoji: data.emoji,
      }
    };
  },
};
