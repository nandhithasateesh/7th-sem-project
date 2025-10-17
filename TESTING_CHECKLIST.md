# 🧪 Complete Testing Checklist

## Pre-Testing Setup

### ✅ Environment Setup
- [ ] Node.js installed (v14+ recommended)
- [ ] Both frontend and backend dependencies installed
- [ ] Server running on port 5000
- [ ] Frontend running on port 3000
- [ ] No errors in console on startup

### ✅ Server Startup
```bash
# Terminal 1 - Backend
cd server
npm install  # If first time
npm start

# Expected output:
# 🚀 StealthLAN server running on http://localhost:5000
# 📡 Accessible on LAN at http://0.0.0.0:5000
# 💬 Socket.io ready for real-time chat
```

- [ ] Server starts without errors
- [ ] Port 5000 is accessible
- [ ] Socket.io initialized successfully

### ✅ Frontend Startup
```bash
# Terminal 2 - Frontend
npm install  # If first time
npm run dev

# Expected output:
# VITE ready in XXX ms
# Local: http://localhost:3000
```

- [ ] Frontend starts without errors
- [ ] Port 3000 is accessible
- [ ] No build errors

---

## 1. Landing Page Tests

### ✅ Basic Functionality
- [ ] Navigate to `http://localhost:3000`
- [ ] Landing page loads successfully
- [ ] Animations play smoothly
- [ ] "Normal Mode" button visible
- [ ] "Secure Mode" button visible
- [ ] No console errors

### ✅ Navigation
- [ ] Click "Normal Mode" → Redirects to `/normal`
- [ ] Click "Secure Mode" → Redirects to `/secure`
- [ ] Back button works correctly

---

## 2. Normal Mode - Login Tests (Existing Users)

### ✅ Login Page UI
- [ ] Navigate to `/normal`
- [ ] Page title shows "Welcome Back"
- [ ] Subtitle shows "Normal Mode Login"
- [ ] Green info box shows "🆕 New User?" message
- [ ] Email field visible
- [ ] Password field visible
- [ ] Password toggle (eye icon) works
- [ ] "Login" button visible
- [ ] Green "Register with Aadhaar Verification" button visible
- [ ] "🔒 Mandatory for all new users" text visible

### ✅ Login Validation
- [ ] Try to submit empty form → Shows validation errors
- [ ] Enter invalid email format → Shows error
- [ ] Enter wrong password → Shows "Invalid credentials"
- [ ] Login attempts tracked (check after 3 failed attempts)
- [ ] Account lockout works after max attempts

### ✅ Successful Login (If you have existing user)
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Redirects to chat interface
- [ ] User data stored in localStorage
- [ ] JWT token stored correctly
- [ ] No console errors

### ✅ 2FA Login (If enabled for user)
- [ ] Enter email and password
- [ ] 2FA code field appears
- [ ] Enter valid 6-digit code
- [ ] Login successful
- [ ] Enter invalid code → Shows error

---

## 3. Aadhaar Registration Tests (NEW USERS - MANDATORY)

### ✅ Access Registration
- [ ] From login page, click "Register with Aadhaar Verification"
- [ ] Redirects to `/register-aadhaar`
- [ ] Page loads successfully
- [ ] Title shows "Aadhaar Verification"
- [ ] Subtitle shows "Secure registration with Aadhaar authentication"

### ✅ Registration Form UI
- [ ] Username field visible
- [ ] Full Name field visible with hint "as on Aadhaar"
- [ ] Password field visible
- [ ] Password toggle works
- [ ] File upload area visible
- [ ] Privacy notice box visible
- [ ] "Verify & Register" button visible
- [ ] "Back to Login" link visible

### ✅ Form Validation
- [ ] Try to submit empty form → Shows "All fields are required"
- [ ] Enter username < 3 chars → Shows error
- [ ] Enter password < 6 chars → Shows error
- [ ] Enter name < 2 chars → Shows error
- [ ] Try to upload PDF → Shows "Only JPEG and PNG allowed"
- [ ] Try to upload file > 5MB → Shows "Image size must be less than 5MB"

### ✅ Aadhaar Image Upload
- [ ] Click upload area
- [ ] File picker opens
- [ ] Select valid Aadhaar image (JPEG/PNG)
- [ ] Green checkmark appears
- [ ] "Aadhaar card uploaded" message shows
- [ ] Can change image by clicking again

### ✅ Aadhaar Verification Process

**Prepare Test Data:**
- Username: `testuser123`
- Name: (Exact name from your test Aadhaar card)
- Password: `Test@123`
- Aadhaar Image: Clear front-side image

**Test Steps:**
- [ ] Fill all fields correctly
- [ ] Upload clear Aadhaar image
- [ ] Click "Verify & Register"
- [ ] Button shows "Verifying..." with spinner
- [ ] Progress messages appear:
  - [ ] "Uploading Aadhaar card..."
  - [ ] OCR processing (check server console)
  - [ ] "✅ Authorized and Registered Successfully!"

**Server Console Verification:**
- [ ] `[Aadhaar] Starting verification for: testuser123`
- [ ] `[Aadhaar] Step 1: Reading Aadhaar card with OCR...`
- [ ] `[Aadhaar] OCR Progress: XX%`
- [ ] `[Aadhaar] Step 2: Extracting Aadhaar number...`
- [ ] `[Aadhaar] Aadhaar number found: XXXX********`
- [ ] `[Aadhaar] Step 3: Validating Aadhaar number...`
- [ ] `[Aadhaar] Aadhaar number is valid ✓`
- [ ] `[Aadhaar] Step 4: Extracting name...`
- [ ] `[Aadhaar] Step 5: Comparing names...`
- [ ] `[Aadhaar] Names match ✓`
- [ ] `[Aadhaar] Step 6: Deleting Aadhaar image...`
- [ ] `[Aadhaar] Image deleted ✓`
- [ ] `[Aadhaar] User saved to database ✓`
- [ ] `[Aadhaar] ✅ Verification successful`

**Post-Registration:**
- [ ] Success message displayed
- [ ] Auto-redirected to Normal Mode chat (after 1.5s)
- [ ] User logged in automatically
- [ ] JWT token in localStorage
- [ ] User data in localStorage

### ✅ Database Verification
```bash
# Check server/data/users.json
cat server/data/users.json
```

- [ ] New user entry exists
- [ ] User has `aadhaarVerified: true`
- [ ] Password is hashed (starts with `$2b$`)
- [ ] Aadhaar number NOT in database
- [ ] `verifiedAt` timestamp present
- [ ] User ID is UUID format

### ✅ Error Scenarios

**Test Invalid Aadhaar:**
- [ ] Upload blurry/unclear image → "Could not find valid Aadhaar number"
- [ ] Upload non-Aadhaar image → "Could not find valid Aadhaar number"
- [ ] Upload image with invalid Aadhaar number → "Invalid Aadhaar number"

**Test Name Mismatch:**
- [ ] Enter different name than on Aadhaar
- [ ] Should show: "Name mismatch. Aadhaar shows 'X' but you entered 'Y'"

**Test Duplicate User:**
- [ ] Try to register with same username again
- [ ] Should show: "User already exists with this username or email"

**Test File Issues:**
- [ ] Upload 6MB file → "Image size must be less than 5MB"
- [ ] Upload .pdf file → "Only JPEG and PNG allowed"

---

## 4. Disabled Direct Registration Test

### ✅ API Endpoint Test
```bash
# Test the disabled registration endpoint
curl -X POST http://localhost:5000/api/auth/normal/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "username": "testuser"
  }'

# Expected Response (403):
{
  "error": "Direct registration is disabled. All new users must register with Aadhaar verification.",
  "redirectTo": "/register-aadhaar"
}
```

- [ ] Returns 403 status code
- [ ] Error message is clear
- [ ] Includes redirect path

---

## 5. Secure Mode Tests

### ✅ Secure Session Creation
- [ ] Navigate to `/secure`
- [ ] Page shows "Secure Session" title
- [ ] Username field visible
- [ ] "Enable temporary 2FA" checkbox visible
- [ ] "Create Secure Session" button visible

### ✅ Create Session Without 2FA
- [ ] Enter username: `secureuser1`
- [ ] Leave 2FA unchecked
- [ ] Click "Create Secure Session"
- [ ] Session created successfully
- [ ] Redirected to secure chat interface
- [ ] Session data in sessionStorage

### ✅ Create Session With 2FA
- [ ] Enter username: `secureuser2`
- [ ] Check "Enable temporary 2FA"
- [ ] Click "Create Secure Session"
- [ ] QR code appears
- [ ] Manual entry code visible
- [ ] Scan QR with authenticator app
- [ ] Enter 6-digit code
- [ ] Click "Verify & Continue"
- [ ] Session created successfully

### ✅ Secure Mode Features
- [ ] Header shows "Secure Mode"
- [ ] Shows "🔥 Ephemeral - No data stored"
- [ ] "End Session" button visible
- [ ] Room list visible
- [ ] Can create rooms
- [ ] Can join rooms

---

## 6. Room Management Tests (Both Modes)

### ✅ Create Room - Normal Mode
- [ ] Login to Normal Mode
- [ ] Click "+" (Create Room) button
- [ ] Modal opens
- [ ] Enter room name: `Test Room 1`
- [ ] Enter description: `Testing room creation`
- [ ] Enter password: `room123`
- [ ] Set time limit: 60 minutes
- [ ] Set message expiry: 24 hours
- [ ] Check "Burn After Reading" (optional)
- [ ] Click "Create"
- [ ] Room appears in room list
- [ ] Room has lock icon (password protected)

### ✅ Create Room - Secure Mode
- [ ] Login to Secure Mode
- [ ] Click "+" (Create Room) button
- [ ] Enter room details
- [ ] Password is MANDATORY in secure mode
- [ ] Click "Create"
- [ ] Alert shows Room ID and password
- [ ] Copy Room ID for joining test
- [ ] Room appears in list with Room ID

### ✅ Join Room by Password
- [ ] Click on password-protected room
- [ ] Password modal appears
- [ ] Enter correct password
- [ ] Click "Join Room"
- [ ] Successfully joins room
- [ ] Chat window opens

### ✅ Join Room by ID (Secure Mode)
- [ ] Click "Join Room" (green button)
- [ ] Modal shows "Enter Room ID" field
- [ ] Paste copied Room ID
- [ ] Enter password
- [ ] Click "Join"
- [ ] Successfully joins room
- [ ] Room added to local list

---

## 7. Chat Functionality Tests

### ✅ Send Messages
- [ ] Join a room
- [ ] Type message in input field
- [ ] Click send or press Enter
- [ ] Message appears in chat
- [ ] Message shows username
- [ ] Message shows timestamp
- [ ] Socket.io connection active

### ✅ Real-time Communication
- [ ] Open app in two browser windows/devices
- [ ] Join same room from both
- [ ] Send message from window 1
- [ ] Message appears in window 2 instantly
- [ ] Send message from window 2
- [ ] Message appears in window 1 instantly

### ✅ File Upload
- [ ] Click attachment icon
- [ ] Select image file
- [ ] File uploads successfully
- [ ] Image preview appears in chat
- [ ] Other users can see the image

### ✅ Typing Indicators
- [ ] Start typing in one window
- [ ] "User is typing..." appears in other window
- [ ] Stop typing
- [ ] Indicator disappears

---

## 8. Network/LAN Tests

### ✅ Find Your IP Address
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# Mac/Linux
ifconfig
# or
ip addr
```

### ✅ Mobile/LAN Access
- [ ] Note your computer's IP address
- [ ] Ensure mobile on same WiFi network
- [ ] Open mobile browser
- [ ] Navigate to `http://YOUR_IP:3000`
- [ ] Landing page loads
- [ ] Can access Normal Mode
- [ ] Can access Secure Mode
- [ ] Can register with Aadhaar from mobile
- [ ] Can create/join rooms

### ✅ Firewall Configuration (Windows)
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "StealthLAN Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "StealthLAN Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

- [ ] Firewall rules added
- [ ] Port 5000 accessible from LAN
- [ ] Port 3000 accessible from LAN

### ✅ API Health Check
```bash
# From mobile or another device
curl http://YOUR_IP:5000/api/health

# Expected:
{"status":"ok","message":"StealthLAN server is running"}
```

- [ ] Health endpoint responds
- [ ] Server accessible from network

---

## 9. Error Handling Tests

### ✅ Network Errors
- [ ] Stop backend server
- [ ] Try to login from frontend
- [ ] Shows: "Cannot connect to server. Make sure the server is running..."
- [ ] Error message is helpful
- [ ] Restart server → Works again

### ✅ Invalid Credentials
- [ ] Enter wrong password 3 times
- [ ] Shows remaining attempts warning
- [ ] After 5 attempts → Account locked
- [ ] Shows lockout duration
- [ ] Wait or check `loginAttempts.json`

### ✅ Session Expiry
- [ ] Login successfully
- [ ] Wait for token to expire (or manually delete from localStorage)
- [ ] Try to access chat
- [ ] Redirected to login
- [ ] Shows appropriate message

---

## 10. Data Persistence Tests

### ✅ Normal Mode Persistence
- [ ] Create room in Normal Mode
- [ ] Send messages
- [ ] Close browser
- [ ] Reopen and login
- [ ] Room still exists
- [ ] Messages still visible
- [ ] Check `server/data/rooms.json`
- [ ] Check `server/data/messages.json`

### ✅ Secure Mode Ephemeral
- [ ] Create room in Secure Mode
- [ ] Send messages
- [ ] Click "End Session"
- [ ] Confirm session ended
- [ ] Room deleted
- [ ] Messages deleted
- [ ] No data in files

---

## 11. Security Tests

### ✅ Password Security
- [ ] Check `server/data/users.json`
- [ ] Passwords are hashed (start with `$2b$`)
- [ ] No plain text passwords
- [ ] Aadhaar numbers NOT stored

### ✅ JWT Token Validation
- [ ] Login successfully
- [ ] Copy JWT token from localStorage
- [ ] Decode at jwt.io
- [ ] Check payload contains userId, email, mode
- [ ] Token has expiry time

### ✅ File Privacy (Aadhaar)
- [ ] Check `server/temp/` directory
- [ ] Should be empty (images deleted after verification)
- [ ] No Aadhaar images stored

### ✅ XSS Prevention
- [ ] Try to send message with `<script>alert('XSS')</script>`
- [ ] Script should not execute
- [ ] Message displayed as text

---

## 12. Browser Compatibility Tests

### ✅ Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Animations smooth

### ✅ Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Animations smooth

### ✅ Safari (Mac/iOS)
- [ ] All features work
- [ ] No console errors
- [ ] File upload works

### ✅ Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Responsive design works
- [ ] Touch interactions work

---

## 13. Performance Tests

### ✅ Load Time
- [ ] Landing page loads < 2 seconds
- [ ] Login page loads < 1 second
- [ ] Chat interface loads < 2 seconds

### ✅ OCR Performance
- [ ] Aadhaar verification completes < 30 seconds
- [ ] Progress indicators show during processing
- [ ] No timeout errors

### ✅ Real-time Updates
- [ ] Messages appear instantly (< 100ms)
- [ ] Typing indicators responsive
- [ ] Room list updates in real-time

---

## 14. Edge Cases

### ✅ Concurrent Users
- [ ] 5+ users in same room
- [ ] All receive messages
- [ ] No message loss
- [ ] Online user count accurate

### ✅ Large Files
- [ ] Upload 4.9MB image (should work)
- [ ] Upload 5.1MB image (should fail)
- [ ] Error message clear

### ✅ Special Characters
- [ ] Username with numbers: `user123`
- [ ] Username with underscore: `user_name`
- [ ] Username with hyphen: `user-name`
- [ ] Room name with emoji: `Test 🚀 Room`

### ✅ Long Sessions
- [ ] Keep session open for 1+ hour
- [ ] Socket stays connected
- [ ] No memory leaks
- [ ] Can still send messages

---

## 15. Documentation Tests

### ✅ README Accuracy
- [ ] Installation steps work
- [ ] All commands execute successfully
- [ ] Port numbers correct
- [ ] Features list accurate

### ✅ Aadhaar Setup Guide
- [ ] Instructions clear
- [ ] Examples work
- [ ] Privacy notes accurate

### ✅ Troubleshooting Guide
- [ ] Common issues listed
- [ ] Solutions work
- [ ] Links valid

---

## Final Checklist

### ✅ Critical Features
- [ ] ✅ Aadhaar registration is MANDATORY
- [ ] ✅ Direct registration is DISABLED
- [ ] ✅ Existing users can login
- [ ] ✅ New users must use Aadhaar
- [ ] ✅ Users saved to database
- [ ] ✅ Aadhaar images deleted
- [ ] ✅ Privacy maintained
- [ ] ✅ Secure mode works
- [ ] ✅ Normal mode works
- [ ] ✅ Chat functionality works
- [ ] ✅ LAN access works

### ✅ No Regressions
- [ ] Existing features still work
- [ ] No new console errors
- [ ] No broken links
- [ ] No UI glitches

---

## Test Results Summary

**Date:** _______________
**Tester:** _______________

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Landing Page | __ / __ | __ | |
| Normal Login | __ / __ | __ | |
| Aadhaar Registration | __ / __ | __ | |
| Secure Mode | __ / __ | __ | |
| Room Management | __ / __ | __ | |
| Chat Features | __ / __ | __ | |
| Network/LAN | __ / __ | __ | |
| Security | __ / __ | __ | |
| Performance | __ / __ | __ | |

**Overall Status:** ⬜ PASS | ⬜ FAIL

**Critical Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## Quick Test Script

For rapid testing, run this sequence:

```bash
# 1. Start servers
cd server && npm start &
cd .. && npm run dev &

# 2. Open browser
# Navigate to http://localhost:3000

# 3. Test flow
# - Click Normal Mode
# - Click "Register with Aadhaar Verification"
# - Fill form and upload Aadhaar
# - Verify registration works
# - Logout and login again
# - Create a room
# - Send messages
# - Open in another browser/device
# - Join same room
# - Test real-time chat

# 4. Test secure mode
# - Navigate to Secure Mode
# - Create session
# - Create room
# - Test ephemeral features
# - End session
# - Verify data deleted
```

---

**✅ All tests completed successfully = Ready for production!**
