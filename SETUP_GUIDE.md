# StealthLAN - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ and npm installed
- Git (optional)

---

## 📦 Installation Steps

### 1. Install Server Dependencies

```bash
cd server
npm install
```

This will install:
- express, cors, bcrypt, jsonwebtoken, uuid
- speakeasy, qrcode (for 2FA)
- socket.io, multer (for real-time chat & file uploads)
- **NEW**: dotenv, express-rate-limit, express-validator, xss

### 2. Create Environment Configuration

```bash
cd server
cp .env.example .env
```

Edit `.env` file and set a **strong JWT secret** (minimum 32 characters):

```env
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-change-this
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

⚠️ **CRITICAL**: Never commit `.env` to version control!

### 3. Install Frontend Dependencies

```bash
cd ..  # Go back to root
npm install
```

### 4. Start the Backend Server

```bash
cd server
npm start
# Or for development with auto-reload:
npm run dev
```

You should see:
```
🚀 StealthLAN server running on http://localhost:5000
📡 Accessible on LAN at http://0.0.0.0:5000
💬 Socket.io ready for real-time chat
🔒 Environment: development
🛡️  CORS allowed origins: http://localhost:3000, http://localhost:5173
```

### 5. Start the Frontend

```bash
# In a new terminal, from project root
npm run dev
```

Frontend will run on `http://localhost:5173` (or 3000)

---

## ✅ What's Been Fixed (P0 Security)

### 1. **Environment Variables**
- ✅ JWT secret moved to `.env`
- ✅ All sensitive configs centralized in `server/config/config.js`
- ✅ Production validation (server won't start with default secret)

### 2. **Input Validation & Sanitization**
- ✅ `express-validator` on all auth routes
- ✅ XSS protection with `xss` library
- ✅ Socket event validation for rooms and messages
- ✅ Password strength requirements (8+ chars, uppercase, lowercase, number)

### 3. **Rate Limiting**
- ✅ General API: 100 requests/15min
- ✅ Auth endpoints: 10 requests/15min
- ✅ Registration: 3 accounts/hour per IP
- ✅ Prevents brute force attacks

### 4. **CORS Security**
- ✅ Restricted to allowed origins only (no more `origin: '*'`)
- ✅ Configurable via environment variables

### 5. **Room Creation Bug FIXED**
- ✅ Now properly assigns `createdBy: socket.userId`
- ✅ Room deletion works correctly

### 6. **Burn-After-Reading Logic FIXED**
- ✅ New `message:read` event handler
- ✅ Messages delete 5 seconds after being read (not fixed timeout)
- ✅ Proper read tracking with `readBy` array

---

## 🎉 New Features Implemented (P1)

### 1. **File Upload System**
- ✅ Full multer-based file handling
- ✅ Supported types:
  - **Images**: JPEG, PNG, GIF, WebP, SVG (max 5MB)
  - **Videos**: MP4, WebM, OGG (max 50MB)
  - **Audio**: MP3, WAV, OGG (max 10MB)
  - **Documents**: PDF, Word, PowerPoint, Excel, TXT (max 10MB)
- ✅ File size validation per category
- ✅ Auto-deletion for secure mode files (1 hour)
- ✅ Upload progress indicator in UI
- ✅ File preview in chat (images, videos, audio players)

**Usage**: Click attachment buttons in chat to upload files

### 2. **Socket Reconnection & Offline Handling**
- ✅ Auto-reconnection (10 attempts)
- ✅ Message queue for offline periods
- ✅ Connection status tracking
- ✅ Visual feedback on reconnection

### 3. **Message Timer Integration**
- ✅ `expiresAt` field properly set on messages
- ✅ Auto-deletion for expired messages
- ✅ Timer countdown in UI (via MessageTimer component)

---

## 🔧 Configuration Options

### Environment Variables (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-min-32-chars
SALT_ROUNDS=10

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=5

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Session
SESSION_EXPIRY=24h
TOKEN_EXPIRY=7d
```

---

## 📁 Project Structure

```
stealthlan/
├── server/
│   ├── config/
│   │   └── config.js              # Centralized configuration
│   ├── middleware/
│   │   ├── validation.js          # Input validation & sanitization
│   │   └── rateLimiter.js         # Rate limiting configs
│   ├── routes/
│   │   ├── auth.js                # Authentication endpoints
│   │   └── upload.js              # File upload endpoints
│   ├── socket/
│   │   └── chatHandler.js         # Socket.io event handlers
│   ├── utils/
│   │   ├── fileHandler.js         # User/session data management
│   │   └── roomManager.js         # Room/message management
│   ├── uploads/                   # Uploaded files (gitignored)
│   ├── data/                      # JSON data storage (gitignored)
│   ├── .env                       # Environment variables (gitignored)
│   ├── .env.example               # Example environment config
│   └── server.js                  # Main server file
├── src/
│   ├── components/
│   │   ├── auth/                  # Login components
│   │   ├── chat/                  # Chat UI components
│   │   ├── settings/              # Settings components
│   │   └── help/                  # Help panel
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── NormalMode.jsx
│   │   └── SecureMode.jsx
│   ├── utils/
│   │   ├── socket.js              # Socket.io client with reconnection
│   │   └── fileUpload.js          # File upload utilities
│   └── App.jsx
└── package.json
```

---

## 🧪 Testing the Features

### Test File Uploads
1. Login to Normal or Secure mode
2. Create/join a room
3. Click attachment icons (📎 🖼️ 🎥)
4. Select a file
5. Watch upload progress
6. File appears in chat with preview

### Test Burn-After-Reading
1. Create a Secure mode room
2. Enable "Burn After Reading"
3. Send a message
4. Message auto-deletes after 5 seconds of being read

### Test Rate Limiting
1. Try logging in with wrong password 10+ times
2. You'll get rate limited after 10 attempts
3. Try registering 4+ accounts quickly
4. You'll get rate limited after 3 registrations

### Test Socket Reconnection
1. Start chatting
2. Stop the server (`Ctrl+C`)
3. Messages get queued
4. Restart server
5. Queued messages send automatically

---

## 🔒 Security Best Practices

### For Production Deployment:

1. **Change JWT Secret**
   - Generate a strong random secret (32+ characters)
   - Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Update SOCKET_URL in frontend to `https://`

3. **Update CORS Origins**
   - Set to your actual domain(s)
   - Remove localhost origins

4. **Set NODE_ENV=production**
   - Server validates JWT secret length
   - Enables production optimizations

5. **Use a Real Database**
   - Replace JSON files with MongoDB/PostgreSQL
   - Better performance and reliability

6. **Add Logging**
   - Install Winston or Morgan
   - Log security events

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is available
- Ensure `.env` file exists with JWT_SECRET
- Run `npm install` in server directory

### File uploads fail
- Check `server/uploads/` directory exists
- Verify file size limits
- Check browser console for errors

### Socket connection fails
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify firewall settings

### "Invalid token" errors
- JWT_SECRET mismatch between sessions
- Clear localStorage and login again
- Check token expiry settings

---

## 📝 TODO (Future Enhancements)

- [ ] AI Assistant integration (component exists, needs backend)
- [ ] LAN device discovery (mDNS/UDP)
- [ ] End-to-end encryption
- [ ] Message pagination
- [ ] User profiles and avatars
- [ ] Voice/video calls
- [ ] Database migration (SQLite/MongoDB)
- [ ] Docker containerization
- [ ] Unit and integration tests

---

## 📄 License

MIT

---

## 🆘 Support

For issues or questions:
1. Check this guide first
2. Review console logs (browser & server)
3. Check GitHub issues (if applicable)

---

**Built with ❤️ using React, Node.js, Socket.io, and TailwindCSS**
