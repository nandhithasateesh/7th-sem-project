# StealthLAN - AI-Powered Offline Chat System

An AI-powered offline chat web application for real-time LAN communication with two modes:

- **Normal Mode**: Casual/office chats with persistent storage
- **Secure Mode**: Ephemeral messages that vanish after viewing

## Features

### Normal Mode
- **Mandatory Aadhaar Verification** for all new users
- Persistent chat history stored in JSON
- Create and manage chat rooms
- Customizable user preferences
- File sharing with storage
- AI chat assistance
- 2FA support (optional)

### Secure Mode
- Ephemeral messages (no permanent storage)
- Self-destructing files after viewing
- View-once media
- Anonymous sessions
- Maximum privacy
- No Aadhaar required (temporary sessions)

## Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Installation

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install server dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

Server will run on `http://localhost:5000`

**Note**: Both frontend and backend must be running for authentication to work.

## Build for Production

```bash
npm run build
```

## Project Structure

```
stealthlan/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── NormalMode.jsx
│   │   └── SecureMode.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Registration & Authentication

### New User Registration (MANDATORY)
🔒 **All new users MUST register with Aadhaar verification**

1. Navigate to the application
2. Click on "Normal Mode"
3. Click "Register with Aadhaar Verification"
4. Provide:
   - Username
   - Full Name (as on Aadhaar)
   - Password
   - Aadhaar Card Image (front side)
5. System will:
   - Extract and validate Aadhaar number using Verhoeff algorithm
   - Verify name matches Aadhaar card
   - Delete image immediately after verification (privacy)
   - Create your account

### Login (Existing Users)
- Use email/username and password
- Optional 2FA for enhanced security

### Secure Mode
- No registration required
- Create temporary anonymous sessions
- All data deleted when session ends

## Development Status

✅ Landing page with animations and mode selection
✅ Authentication system (Normal & Secure modes)
✅ **Mandatory Aadhaar verification for new users**
✅ Normal Mode: Login with 2FA support
✅ Secure Mode: Ephemeral sessions with optional 2FA
✅ Login attempt tracking and account lockout
✅ Backend API with Node.js + Express
✅ Normal Mode chat interface
✅ Secure Mode chat interface
✅ Room management with passwords
✅ File sharing and uploads
✅ AI integration
✅ LAN networking support

## License

MIT
