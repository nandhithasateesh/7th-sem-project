# Normal Mode - Step 1: Login and Registration ✅

## Implementation Complete

### ✅ Features Implemented:

#### 1. **User Registration**
- **Endpoint**: `POST /api/auth/normal/register`
- **Required Fields**:
  - `email` - Valid email address
  - `password` - Minimum 8 characters (must contain uppercase, lowercase, and number)
  - `username` - 3-30 characters (alphanumeric with _ or -)

#### 2. **Password Security**
- ✅ **Passwords are hashed** using bcrypt with 10 salt rounds
- ✅ **Never stored in plain text**
- ✅ Strong password requirements enforced:
  - Minimum 8 characters
  - Must contain uppercase letter
  - Must contain lowercase letter
  - Must contain number

#### 3. **Credential Storage**
- ✅ **Stored in JSON file**: `server/data/users.json`
- ✅ **User data structure**:
```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "username": "johndoe",
  "password": "$2b$10$hashedPasswordString",
  "twoFactorEnabled": false,
  "twoFactorSecret": null,
  "createdAt": "2025-10-16T00:00:00.000Z",
  "lastLogin": "2025-10-16T01:00:00.000Z"
}
```

#### 4. **User Login**
- **Endpoint**: `POST /api/auth/normal/login`
- **Required Fields**:
  - `email`
  - `password`
  - `twoFactorCode` (optional, if 2FA enabled)

#### 5. **Dashboard Access**
- ✅ **JWT Token Authentication**
  - Token generated on successful login/registration
  - Token expires based on `TOKEN_EXPIRY` config
  - Token includes: `userId`, `email`, `mode: 'normal'`
- ✅ **Last login tracking** - Updated on each successful login

---

## Security Features

### ✅ Input Validation
- **Email**: Valid format, normalized
- **Password**: Complexity requirements enforced
- **Username**: Alphanumeric with underscores/hyphens only
- **XSS Protection**: All inputs sanitized

### ✅ Duplicate Prevention
- Email uniqueness enforced
- Username uniqueness enforced
- Returns specific error messages

### ✅ Login Protection
- Failed login attempt tracking
- Account lockout after max attempts (configurable)
- Cooldown period before retry

### ✅ 2FA Support (Optional)
- Users can enable 2FA after registration
- TOTP-based (compatible with Google Authenticator)
- QR code generation for easy setup

---

## API Endpoints

### 1. Register New User
```http
POST /api/auth/normal/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "twoFactorEnabled": false
  }
}
```

**Error Responses**:
- `400` - Email already registered
- `400` - Username already taken
- `400` - Validation failed (invalid email/password/username)
- `500` - Registration failed

---

### 2. Login User
```http
POST /api/auth/normal/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "twoFactorEnabled": false,
    "lastLogin": "2025-10-16T01:00:00.000Z"
  }
}
```

**2FA Required Response (200)**:
```json
{
  "requiresTwoFactor": true,
  "message": "Two-factor authentication required"
}
```

**Error Responses**:
- `401` - Invalid credentials
- `401` - Invalid 2FA code
- `423` - Account locked due to too many failed attempts
- `500` - Login failed

---

### 3. Enable 2FA
```http
POST /api/auth/normal/enable-2fa
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KG..."
}
```

---

### 4. Confirm 2FA Setup
```http
POST /api/auth/normal/confirm-2fa
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

---

## Password Requirements

### ✅ Minimum Requirements:
- **Length**: At least 8 characters
- **Uppercase**: At least one uppercase letter (A-Z)
- **Lowercase**: At least one lowercase letter (a-z)
- **Number**: At least one digit (0-9)

### ✅ Examples:
- ✅ Valid: `SecurePass123`, `MyP@ssw0rd`, `Test1234`
- ❌ Invalid: `password` (no uppercase/number), `PASSWORD123` (no lowercase), `TestPass` (no number)

---

## Username Requirements

### ✅ Rules:
- **Length**: 3-30 characters
- **Allowed characters**: a-z, A-Z, 0-9, underscore (_), hyphen (-)
- **No spaces** or special characters

### ✅ Examples:
- ✅ Valid: `john_doe`, `user123`, `alice-smith`
- ❌ Invalid: `ab` (too short), `user@123` (special char), `my user` (space)

---

## Email Requirements

### ✅ Rules:
- Must be a valid email format
- Automatically normalized (lowercase)
- Must be unique across all users

### ✅ Examples:
- ✅ Valid: `user@example.com`, `john.doe@company.co.uk`
- ❌ Invalid: `notanemail`, `user@`, `@example.com`

---

## Token Authentication

### How to Use JWT Token:

#### 1. Store token after login/registration:
```javascript
localStorage.setItem('authToken', response.token);
```

#### 2. Send token with requests:
```javascript
fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### 3. Token contains:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "mode": "normal",
  "iat": 1697500000,
  "exp": 1697586400
}
```

---

## Testing the Implementation

### Test 1: Register New User
```bash
curl -X POST http://localhost:5000/api/auth/normal/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123"
  }'
```

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/normal/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test 3: Access Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## File Structure

```
server/
├── routes/
│   └── auth.js              # ✅ Registration & Login endpoints
├── middleware/
│   └── validation.js        # ✅ Input validation rules
├── utils/
│   └── fileHandler.js       # ✅ Read/Write users.json
├── data/
│   └── users.json           # ✅ User database (gitignored)
└── config/
    └── config.js            # Configuration settings
```

---

## Configuration

In `server/config/config.js`:

```javascript
export const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  TOKEN_EXPIRY: '7d',                    // Token valid for 7 days
  MAX_LOGIN_ATTEMPTS: 5,                 // Lock after 5 failed attempts
  LOCKOUT_DURATION: 15 * 60 * 1000,      // 15 minutes lockout
};
```

---

## Security Best Practices Implemented

### ✅ Password Security:
- **Bcrypt hashing** (10 salt rounds)
- **Never logged** or exposed in responses
- **Strong complexity** requirements

### ✅ Input Sanitization:
- **XSS protection** using `xss` library
- **SQL injection prevention** (using JSON storage)
- **Trim whitespace** from all inputs

### ✅ Rate Limiting:
- **Login attempt tracking**
- **Account lockout** on repeated failures
- **Cooldown period** before retry

### ✅ Token Security:
- **JWT signed** with secret key
- **Expiration time** enforced
- **HTTPS recommended** for production

---

## Error Handling

### Registration Errors:
| Error | Status | Message |
|-------|--------|---------|
| Email exists | 400 | "Email already registered" |
| Username taken | 400 | "Username already taken" |
| Invalid email | 400 | "Valid email is required" |
| Weak password | 400 | "Password must be at least 8 characters..." |
| Invalid username | 400 | "Username must be 3-30 characters..." |
| Server error | 500 | "Registration failed" |

### Login Errors:
| Error | Status | Message |
|-------|--------|---------|
| Wrong credentials | 401 | "Invalid credentials" |
| Invalid 2FA | 401 | "Invalid 2FA code" |
| Account locked | 423 | "Account locked. Try again in X minute(s)" |
| Server error | 500 | "Login failed" |

---

## Next Steps

Now that **Step 1** is complete, you can:

1. ✅ Register new users with email/password
2. ✅ Login with credentials
3. ✅ Receive JWT token for authentication
4. ✅ Access dashboard/protected routes

**Ready for Step 2!** Let me know what feature you want to add next to Normal Mode.

---

## Summary

| Feature | Status |
|---------|--------|
| Email/Password Registration | ✅ Complete |
| Password Hashing (bcrypt) | ✅ Complete |
| JSON Storage | ✅ Complete |
| Login with Credentials | ✅ Complete |
| JWT Authentication | ✅ Complete |
| Input Validation | ✅ Complete |
| Duplicate Prevention | ✅ Complete |
| Login Protection | ✅ Complete |
| 2FA Support | ✅ Complete |
| Last Login Tracking | ✅ Complete |

**Status**: ✅ **STEP 1 COMPLETE**

**Last Updated**: Oct 16, 2025
