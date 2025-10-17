# 🎯 Complete Feature Testing Guide - StealthLAN

## Table of Contents
1. [Landing Page](#landing-page)
2. [Normal Mode](#normal-mode)
3. [Secure Mode](#secure-mode)
4. [Settings & Options](#settings--options)
5. [File Sharing](#file-sharing)
6. [Security Features](#security-features)
7. [Testing Checklist](#testing-checklist)

---

## 1. Landing Page

### **URL:** `http://localhost:5173/`

### **Features:**

#### **1.1 Mode Selection**
- **Normal Mode Button**
  - Click to enter Normal Mode
  - Persistent chat with registration
  - Data stored permanently
  
- **Secure Mode Button**
  - Click to enter Secure Mode
  - Ephemeral chat (temporary)
  - Data deleted on logout

#### **1.2 UI Elements**
- **Theme Toggle** (Moon/Sun icon)
  - Click to switch between Dark/Light mode
  - Preference saved in localStorage
  
- **Language Selector**
  - Dropdown to select language
  - Currently supports multiple languages

#### **1.3 Information Displayed**
- App title: "StealthLAN"
- Tagline: "AI-Powered Offline Chat"
- Feature highlights
- Mode descriptions

---

## 2. Normal Mode

### **URL:** `http://localhost:5173/normal`

---

### **2.1 Authentication**

#### **Login Screen**

**Fields:**
- Email address
- Password
- Show/Hide password toggle (eye icon)

**Options:**
- "Don't have an account? Register" link
- "Register with Aadhaar Verification" link (green button)

**Features:**
- Email validation
- Password validation
- 2FA support (if enabled)
- Account lockout after 5 failed attempts
- Remaining attempts counter

**Test:**
1. Enter valid email/password → Login success
2. Enter wrong password 5 times → Account locked for 5 minutes
3. Click "Register" → Switch to registration form
4. Click "Aadhaar Verification" → Go to Aadhaar registration

---

#### **Registration Screen**

**Fields:**
- Email address
- Username
- Password
- Show/Hide password toggle

**Validation:**
- Email format check
- Username min 3 characters
- Password min 6 characters
- Duplicate email check

**Test:**
1. Fill all fields correctly → Registration success
2. Use existing email → Error: "Email already exists"
3. Short username → Error: "Username must be at least 3 characters"
4. Weak password → Error: "Password must be at least 6 characters"

---

#### **Aadhaar Registration** (NEW!)

**URL:** `http://localhost:5173/register-aadhaar`

**Fields:**
- Username
- Full Name (as on Aadhaar)
- Password
- Aadhaar Card Image Upload

**Process:**
1. Fill username, name, password
2. Upload Aadhaar card image (JPEG/PNG, max 5MB)
3. Click "Verify & Register"
4. System processes:
   - "Uploading Aadhaar card..."
   - "Reading Aadhaar..." (OCR with Tesseract.js)
   - "Extracting Aadhaar number..."
   - "Validating with Verhoeff checksum..."
   - "Extracting name..."
   - "Comparing names..."
   - "Deleting image for privacy..."

**Success:**
- ✅ "Authorized and Registered Successfully"
- Auto-login with JWT token

**Failure:**
- ❌ "Could not find valid Aadhaar number"
- ❌ "Invalid Aadhaar number"
- ❌ "Name mismatch"

**Test:**
1. Upload clear Aadhaar image → Success
2. Upload blurry image → OCR fails
3. Wrong name → Name mismatch error
4. Check uploads/ folder → No Aadhaar image stored (privacy)

---

### **2.2 Dashboard** (NEW!)

**Access:** Click 📊 icon in header

**Statistics Shown:**

**Main Cards:**
1. **Total Rooms**
   - Count of all existing rooms
   - Blue icon
   
2. **Active Rooms**
   - Rooms with messages in last 24 hours
   - Green icon
   
3. **Total Messages**
   - All messages currently in system
   - Purple icon
   
4. **Files Shared**
   - Total files uploaded
   - Orange icon

**File Breakdown:**
- Images count + percentage bar (blue)
- Videos count + percentage bar (purple)
- Documents count + percentage bar (orange)

**Your Activity:**
- Rooms Joined count
- Active Today status
- Member Since date

**Recent Activity:**
- List of recent actions
- Timestamps

**Test:**
1. Click Dashboard → See statistics
2. Send message → Total Messages increases
3. Upload file → Files Shared increases
4. Create room → Total Rooms increases
5. Wait for cleanup → Numbers decrease for expired items

---

### **2.3 Room Management**

#### **Room List (Left Sidebar)**

**Header:**
- "Rooms" title
- Search bar (magnifying glass icon)
- "+" button to create room
- "Join Room" button

**Room Display:**
- Room name
- Description (if any)
- Member count
- Icons:
  - 🔒 Password protected
  - 🔥 Burn after reading
  - ⏱️ Time limit set

**Features:**
- Search rooms by name
- Click room to open chat
- Active room highlighted in blue

**Test:**
1. Search for room name → Filters list
2. Click room → Opens chat
3. Check icons → Shows room settings

---

#### **Create Room**

**Click "+" button**

**Fields:**
- **Room Name*** (required, 3-50 characters)
- **Description** (optional)
- **Password*** (required, min 4 characters) - NEW: Mandatory!
- **Message Auto-Delete** (dropdown)
  - 1 hour
  - 6 hours
  - 12 hours
  - 24 hours (default)
  - 2 days
  - 7 days
  - 30 days
  - Never (keep forever)

**Options (Checkboxes):**
- **Burn After Reading** (messages delete after viewing)
- **Time Limit** (room expires after X time)

**Test:**
1. Create room with all options → Success
2. Create without password → Error: "Password required"
3. Create with short name → Error: "Name must be 3-50 characters"
4. Create with Burn After Reading → Messages disappear after viewing
5. Create with 1-hour time limit → Room deletes after 1 hour

---

#### **Join Room**

**Click "Join Room" button**

**Fields:**
- Room Name
- Password

**Test:**
1. Enter correct name + password → Join success
2. Enter wrong password → Error: "Incorrect password"
3. Enter non-existent room → Error: "Room not found"

---

### **2.4 Chat Features**

#### **Chat Window (Center/Right)**

**Header:**
- Room name
- Member count
- Online users count (green dot)
- Settings icon (if host)

**Message Display:**
- Username
- Timestamp
- Message content
- Reactions (emoji)
- Pin icon (if pinned)
- Self-destruct timer (if burn after reading)

**Message Types:**
1. **Text Messages**
   - Plain text
   - Line breaks supported
   
2. **Image Messages**
   - Inline preview
   - Click to open full size
   - Download button
   
3. **Video Messages**
   - Inline player with controls
   - Download button
   
4. **Audio Messages**
   - Audio player with controls
   - Download button
   
5. **Document Messages**
   - File icon
   - File name and size
   - Preview button
   - Download button
   
6. **System Messages**
   - Screenshot alerts (red badge)
   - Download alerts (blue badge)
   - User joined/left

**Test Each:**
1. Send text → Appears in chat
2. Send image → Preview shows, click to enlarge
3. Send video → Player appears, can play
4. Send audio → Player appears, can play
5. Send document → File info shows, can preview/download
6. Take screenshot → Red alert appears
7. Download file → Blue alert appears

---

#### **Input Area (Bottom)**

**Buttons (Left to Right):**

1. **📎 Attach File**
   - Opens file picker
   - Any file type
   - Max 50MB
   
2. **🖼️ Send Image**
   - Opens image picker
   - JPEG, PNG, GIF, WebP
   - Max 5MB
   
3. **🎥 Record Video**
   - Opens camera
   - Records video
   - Preview before sending
   - Retake option
   
4. **🎤 Record Audio**
   - Opens microphone
   - Records audio
   - Waveform visualization
   - Stop and send
   
5. **😊 Emoji Picker**
   - Quick emoji selection
   - Click to insert

**Text Input:**
- Type message
- Enter to send
- Shift+Enter for new line

**Send Button:**
- Blue arrow icon
- Click to send message

**Test:**
1. Click each button → Opens respective picker/recorder
2. Upload file → Converts to base64, no disk storage
3. Record video → Camera opens, can record and send
4. Record audio → Microphone opens, can record and send
5. Select emoji → Inserts in message
6. Type and send → Message appears

---

#### **Message Actions**

**Hover over message:**

**Reaction Button:**
- Click to add emoji reaction
- Shows emoji picker
- Multiple users can react

**Pin Button:**
- Pin important messages
- Shows pin icon on message
- Only host can pin

**Delete Button:**
- Delete your own messages
- Host can delete any message
- Confirmation required

**Test:**
1. React to message → Emoji appears below
2. Pin message → Pin icon shows
3. Delete message → Removed from chat

---

### **2.5 File Sharing (Base64 Storage)**

**Upload Process:**
1. Select file
2. Converts to base64 in memory
3. Stores in database (NOT on disk)
4. Displays in chat

**Download:**
1. Click download button
2. Converts base64 to file
3. Downloads to device
4. Notification sent to room

**Test:**
1. Upload image → Check uploads/ folder (should be empty)
2. Check database → See base64 data
3. Image displays in chat → Works
4. Download image → File downloads correctly
5. Other users see download notification

---

### **2.6 Security Features**

#### **Screenshot Detection**

**Triggers:**
- Print Screen key
- Win + Shift + S (Windows Snipping Tool)
- Cmd + Shift + 3/4/5 (Mac)

**Action:**
1. Screen goes black for 1 second
2. Shows "🚫 Screenshot Blocked"
3. Notification sent to room: "📸 [User] took a screenshot"

**Test:**
1. Press Print Screen → Black screen + notification
2. Press Win+Shift+S → Black screen + notification
3. All users in room see alert

---

#### **Download Tracking**

**When file downloaded:**
1. Click download button
2. File downloads
3. Notification sent: "📥 [User] downloaded [filename]"
4. All users see notification

**Test:**
1. Download image → Notification appears
2. Download video → Notification appears
3. Download document → Notification appears

---

#### **Burn After Reading**

**If enabled in room:**
1. Message shows timer icon
2. After viewing, countdown starts
3. Message deletes automatically

**Test:**
1. Create room with Burn After Reading
2. Send message
3. View message → Timer starts
4. Wait → Message disappears

---

#### **Message Auto-Delete**

**Based on room settings:**
1. Messages older than X hours
2. Deleted automatically every 5 minutes
3. Files also deleted

**Test:**
1. Create room with 1-hour expiry
2. Send messages
3. Wait 1 hour + 5 minutes
4. Messages deleted automatically

---

#### **Room Expiry**

**If time limit set:**
1. Room expires after X time
2. Cleanup runs every 5 minutes
3. Room + messages + files deleted

**Test:**
1. Create room with 2-minute time limit
2. Send messages and files
3. Wait 7 minutes (2 min + 5 min cleanup)
4. Room deleted
5. Files deleted from database

---

### **2.7 Settings & Options**

**Header Buttons:**

1. **📊 Dashboard**
   - Toggle dashboard view
   - Shows statistics
   
2. **🌙 Theme Toggle**
   - Switch Dark/Light mode
   - Saved in localStorage
   
3. **🌐 Language Selector**
   - Change app language
   - Dropdown menu
   
4. **🚪 Logout**
   - Logs out user
   - Clears session
   - Returns to login

**Test:**
1. Click Dashboard → Shows stats
2. Toggle theme → UI changes
3. Change language → Text updates
4. Logout → Returns to login

---

## 3. Secure Mode

### **URL:** `http://localhost:5173/secure`

---

### **3.1 Authentication**

#### **Secure Login Screen**

**Fields:**
- Username (temporary)
- Enable 2FA checkbox

**Process:**
1. Enter username
2. Optionally enable 2FA
3. Click "Create Secure Session"

**Without 2FA:**
- Instant access
- Session token generated

**With 2FA:**
1. QR code displayed
2. Scan with authenticator app (Google Authenticator, Authy, etc.)
3. Enter 6-digit code
4. Access granted

**Test:**
1. Login without 2FA → Instant access
2. Login with 2FA → QR code appears
3. Scan QR → Code generated
4. Enter code → Access granted
5. Enter wrong code → Error

---

### **3.2 Room Management**

**Same as Normal Mode BUT:**

**Differences:**

1. **Room Visibility:**
   - Can't see other users' rooms
   - Only see rooms YOU created or joined
   
2. **Join Room:**
   - Must enter exact Room ID (not name)
   - Room ID shown when creating room
   
3. **Create Room:**
   - Password MANDATORY
   - Shows Room ID in popup after creation
   - Share Room ID + Password with others

**Test:**
1. Create room → Popup shows Room ID
2. Copy Room ID
3. Open another browser/device
4. Join with Room ID + Password → Success
5. Try to browse rooms → Can't see other rooms

---

### **3.3 Chat Features**

**Same as Normal Mode:**
- Text messages
- Image sharing (base64)
- Video sharing (base64)
- Audio recording
- Video recording
- File sharing
- Reactions
- Screenshot detection
- Download tracking

**Differences:**
- NO message auto-delete settings (all deleted on logout)
- NO room expiry settings (all deleted on logout)
- Everything ephemeral

**Test:**
1. Send all message types → Works
2. Logout → All data deleted
3. Login again → No history

---

### **3.4 Session End**

**When you logout:**
1. All rooms you created → Deleted
2. All messages → Deleted
3. All files → Deleted from database
4. Session token → Invalidated

**Test:**
1. Create room, send messages, upload files
2. Logout
3. Check database → All gone
4. Login again → Fresh start

---

## 4. Settings & Options

### **4.1 Theme Settings**

**Dark Mode (Default):**
- Dark background
- Light text
- Blue accents

**Light Mode:**
- Light background
- Dark text
- Blue accents

**Test:**
1. Toggle theme → UI changes
2. Refresh page → Theme persists
3. Works in all modes

---

### **4.2 Language Settings**

**Supported Languages:**
- English
- Spanish
- French
- German
- (Add more as needed)

**Test:**
1. Change language → Text updates
2. Refresh page → Language persists
3. Works in all modes

---

## 5. File Sharing

### **5.1 File Types Supported**

**Images:**
- JPEG, PNG, GIF, WebP, SVG
- Max 5MB
- Inline preview

**Videos:**
- MP4, WebM, OGG, QuickTime
- Max 50MB
- Inline player

**Audio:**
- MP3, WAV, OGG, WebM
- Max 10MB
- Inline player

**Documents:**
- PDF, Word, Excel, PowerPoint, Text
- Max 10MB
- Preview + Download

**Test Each:**
1. Upload JPEG → Preview shows
2. Upload PNG → Preview shows
3. Upload MP4 → Player shows
4. Upload PDF → File info shows
5. Upload Word doc → File info shows

---

### **5.2 Base64 Storage**

**How it works:**
1. File uploaded
2. Converted to base64 in memory
3. Stored in database as data URL
4. NO files on disk

**Test:**
1. Upload file
2. Check `uploads/` folder → Empty
3. Check `data/messages.json` → See base64 data
4. File displays in chat → Works
5. Download file → Works correctly

---

### **5.3 File Actions**

**Preview:**
- Click image → Opens full size
- Click video → Plays inline
- Click document → Opens in new tab

**Download:**
- Click download button
- File downloads to device
- Notification sent to room

**Test:**
1. Preview image → Opens
2. Preview video → Plays
3. Preview document → Opens
4. Download each → Works

---

## 6. Security Features

### **6.1 Screenshot Detection**

**Detected Keys:**
- Print Screen
- Win + Shift + S
- Cmd + Shift + 3/4/5

**Action:**
- Black screen (1 second)
- Notification to room

**Test:**
1. Press Print Screen → Detected
2. Press Win+Shift+S → Detected
3. Switch tabs → NOT detected (fixed)
4. Minimize window → NOT detected (fixed)

---

### **6.2 Download Tracking**

**Every download tracked:**
- Images
- Videos
- Audio
- Documents

**Notification:**
- "📥 [User] downloaded [filename]"
- Shows to all users

**Test:**
1. Download any file → Notification appears
2. All users see notification

---

### **6.3 Aadhaar Verification**

**Process:**
1. Upload Aadhaar image
2. OCR extracts text
3. Find 12-digit number
4. Validate with Verhoeff algorithm
5. Extract name
6. Compare with form name
7. Delete image immediately

**Security:**
- Image never stored
- Aadhaar number never stored
- Only username + hashed password stored

**Test:**
1. Upload valid Aadhaar → Success
2. Upload invalid → Fails
3. Check uploads/ → No image
4. Check database → No Aadhaar number

---

### **6.4 Auto-Cleanup**

**Normal Mode:**
- Runs every 5 minutes
- Deletes expired rooms
- Deletes expired messages
- Deletes files from database

**Secure Mode:**
- Runs on logout
- Deletes all rooms created by user
- Deletes all messages
- Deletes all files

**Test:**
1. Create room with 1-min expiry
2. Wait 6 minutes
3. Room deleted
4. Messages deleted
5. Files deleted

---

## 7. Testing Checklist

### **7.1 Landing Page**
- [ ] Normal Mode button works
- [ ] Secure Mode button works
- [ ] Theme toggle works
- [ ] Language selector works

### **7.2 Normal Mode - Authentication**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Register with Aadhaar
- [ ] 2FA works (if enabled)
- [ ] Account lockout after 5 attempts

### **7.3 Normal Mode - Dashboard**
- [ ] Dashboard shows statistics
- [ ] Total Rooms count correct
- [ ] Active Rooms count correct
- [ ] Total Messages count correct
- [ ] Files Shared count correct
- [ ] File breakdown shows percentages
- [ ] Auto-updates every 30 seconds

### **7.4 Normal Mode - Rooms**
- [ ] Create room with password
- [ ] Create room with burn after reading
- [ ] Create room with time limit
- [ ] Create room with message expiry
- [ ] Join room with password
- [ ] Search rooms
- [ ] Room list updates in real-time

### **7.5 Normal Mode - Chat**
- [ ] Send text message
- [ ] Send image (base64)
- [ ] Send video (base64)
- [ ] Send audio recording
- [ ] Send video recording
- [ ] Send document
- [ ] Add emoji reaction
- [ ] Pin message
- [ ] Delete message
- [ ] Typing indicator works

### **7.6 Normal Mode - Files**
- [ ] Upload image → No file on disk
- [ ] Upload video → No file on disk
- [ ] Upload document → No file on disk
- [ ] Files display correctly
- [ ] Download works
- [ ] Download notification appears
- [ ] Base64 stored in database

### **7.7 Normal Mode - Security**
- [ ] Screenshot detection works
- [ ] Download tracking works
- [ ] Burn after reading works
- [ ] Message auto-delete works
- [ ] Room expiry works
- [ ] Cleanup runs every 5 minutes

### **7.8 Secure Mode - Authentication**
- [ ] Login without 2FA
- [ ] Login with 2FA
- [ ] QR code displays
- [ ] Authenticator app works
- [ ] 6-digit code validates

### **7.9 Secure Mode - Rooms**
- [ ] Create room → Room ID shown
- [ ] Join with Room ID
- [ ] Can't see other users' rooms
- [ ] Password mandatory

### **7.10 Secure Mode - Chat**
- [ ] All message types work
- [ ] Files stored as base64
- [ ] Screenshot detection works
- [ ] Download tracking works

### **7.11 Secure Mode - Session End**
- [ ] Logout deletes all rooms
- [ ] Logout deletes all messages
- [ ] Logout deletes all files
- [ ] Fresh start on re-login

### **7.12 Multi-Device**
- [ ] Connect from PC
- [ ] Connect from laptop
- [ ] Connect from mobile
- [ ] All devices see same data
- [ ] Real-time updates work
- [ ] Microphone works (with Chrome flags)
- [ ] Camera works (with Chrome flags)

### **7.13 Aadhaar Verification**
- [ ] Upload Aadhaar image
- [ ] OCR extracts text
- [ ] Aadhaar number validated
- [ ] Name comparison works
- [ ] Image deleted immediately
- [ ] Registration success
- [ ] Auto-login works

---

## 8. Quick Test Scenarios

### **Scenario 1: Basic Chat**
1. Start server and client
2. Login to Normal Mode
3. Create room "Test Room" with password "test123"
4. Send text message
5. Send image
6. React to message
7. Download image → Check notification
8. Logout

### **Scenario 2: Multi-Device Chat**
1. Start server on PC
2. Login on PC
3. Create room
4. Open mobile browser
5. Go to http://[PC-IP]:5173
6. Login on mobile
7. Join same room
8. Send message from PC → See on mobile
9. Send message from mobile → See on PC

### **Scenario 3: Secure Mode**
1. Login to Secure Mode
2. Enable 2FA
3. Scan QR code
4. Enter 6-digit code
5. Create room → Note Room ID
6. Send messages
7. Logout → All deleted
8. Login again → Fresh start

### **Scenario 4: File Sharing**
1. Login to Normal Mode
2. Create room
3. Upload image → Check uploads/ folder (empty)
4. Image displays in chat
5. Download image → Works
6. Check database → See base64
7. Wait for message expiry → File deleted

### **Scenario 5: Screenshot Detection**
1. Login and join room
2. Press Print Screen → Black screen
3. Notification appears
4. Other users see alert
5. Switch tabs → No alert (correct)

### **Scenario 6: Aadhaar Registration**
1. Go to /register-aadhaar
2. Fill username, name, password
3. Upload Aadhaar image
4. Click Verify
5. Watch progress messages
6. Success → Auto-login
7. Check uploads/ → No image

### **Scenario 7: Dashboard**
1. Login to Normal Mode
2. Click Dashboard icon
3. See statistics
4. Create room → Total Rooms increases
5. Send message → Total Messages increases
6. Upload file → Files Shared increases
7. Wait for cleanup → Numbers decrease

### **Scenario 8: Room Expiry**
1. Create room with 2-minute time limit
2. Send messages and files
3. Wait 7 minutes
4. Room deleted
5. Messages deleted
6. Files deleted from database
7. Dashboard numbers updated

---

## 9. Known Issues & Limitations

### **File Size:**
- Large files (>50MB) may cause performance issues
- Base64 increases size by ~33%
- Consider compression for large files

### **Browser Support:**
- Microphone/Camera requires HTTPS on IP addresses
- Use Chrome flags or HTTPS setup
- Some features may not work on older browsers

### **Network:**
- All devices must be on same WiFi
- Firewall may block connections
- Mobile hotspot works as alternative

### **Database:**
- JSON file grows with base64 data
- Consider MongoDB for production
- Regular cleanup recommended

---

## 10. Tips for Testing

1. **Use Multiple Browsers:**
   - Chrome for user 1
   - Firefox for user 2
   - Test real-time updates

2. **Use Incognito Mode:**
   - Test without cached data
   - Simulate new user

3. **Check Console Logs:**
   - Server console for backend logs
   - Browser console for frontend logs
   - Look for errors

4. **Test Edge Cases:**
   - Very long messages
   - Special characters
   - Large files
   - Network interruptions

5. **Monitor Database:**
   - Check `data/rooms.json`
   - Check `data/messages.json`
   - Verify cleanup works

6. **Test Cleanup:**
   - Create room with 1-min expiry
   - Wait and verify deletion
   - Check database updated

---

## 11. Summary

**Total Features Implemented:**
- ✅ 2 Modes (Normal + Secure)
- ✅ Aadhaar Verification
- ✅ Dashboard with Statistics
- ✅ Base64 File Storage
- ✅ Screenshot Detection
- ✅ Download Tracking
- ✅ Auto-Cleanup
- ✅ Burn After Reading
- ✅ Message Expiry
- ✅ Room Expiry
- ✅ 2FA Support
- ✅ Multi-Device Support
- ✅ Real-time Updates
- ✅ Audio/Video Recording
- ✅ Theme Toggle
- ✅ Language Selector

**Ready for comprehensive testing!** 🚀✨
