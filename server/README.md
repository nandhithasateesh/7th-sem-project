# StealthLAN Server - Authentication Backend

Node.js + Express backend for StealthLAN authentication system.

## Features

### Normal Mode Authentication
- ✅ Email + password registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Login attempt tracking (max 5 attempts)
- ✅ Account lockout for 5 minutes after failed attempts
- ✅ Optional 2FA with QR code generation
- ✅ Persistent storage in JSON files

### Secure Mode Authentication
- ✅ Temporary session-based authentication
- ✅ Optional ephemeral 2FA (session-only)
- ✅ No permanent data storage
- ✅ Session tokens expire after 24 hours

## Installation

```bash
cd server
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000` and be accessible on LAN at `http://0.0.0.0:5000`

## API Endpoints

### Normal Mode

#### Register
- **POST** `/api/auth/normal/register`
- Body: `{ email, password, username }`
- Returns: JWT token and user data

#### Login
- **POST** `/api/auth/normal/login`
- Body: `{ email, password, twoFactorCode? }`
- Returns: JWT token and user data
- Tracks failed attempts (max 5, then 5-minute lockout)

#### Enable 2FA
- **POST** `/api/auth/normal/enable-2fa`
- Body: `{ userId }`
- Returns: QR code and secret for authenticator app

#### Confirm 2FA
- **POST** `/api/auth/normal/confirm-2fa`
- Body: `{ userId, code }`
- Activates 2FA for the user

### Secure Mode

#### Create Session
- **POST** `/api/auth/secure/create-session`
- Body: `{ username, enable2FA }`
- Returns: Session token and optional 2FA QR code

#### Validate Session
- **POST** `/api/auth/secure/validate-session`
- Body: `{ sessionToken, twoFactorCode? }`
- Returns: Session validation status

#### End Session
- **POST** `/api/auth/secure/end-session`
- Body: `{ sessionToken }`
- Destroys the session

## Data Storage

All data is stored in JSON files in the `data/` directory:

- `users.json` - Normal mode user accounts
- `loginAttempts.json` - Failed login tracking
- `sessions.json` - Secure mode temporary sessions

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed tokens for authentication
3. **Rate Limiting**: 5 failed login attempts = 5-minute lockout
4. **2FA Support**: TOTP-based two-factor authentication
5. **Ephemeral Sessions**: Secure mode data is temporary

## Environment Variables

You can customize the following (optional):

- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - JWT signing secret (change in production!)

## Tech Stack

- Express.js - Web framework
- bcrypt - Password hashing
- jsonwebtoken - JWT authentication
- speakeasy - 2FA/TOTP generation
- qrcode - QR code generation for 2FA
- uuid - Unique ID generation
