# Secure Mode Implementation Guide

## Overview
This document describes the complete implementation of the enhanced Secure Mode feature for the StealthLAN application. The secure mode now provides true end-to-end encryption, 2FA authentication, auto-deletion, and enhanced security features.

## ✨ Key Features Implemented

### 1. **Direct Room Access (No Session Setup)**
- When users click "Secure Mode", they see two options immediately:
  - **Create Room**
  - **Join Room**
- No authentication or session setup required
- Truly ephemeral - no data persistence

### 2. **Create Room Flow**

#### Mandatory Fields:
- **Username**: User's display name in the room
- **Room Password**: Minimum 6 characters (mandatory)
- **Two-Factor Authentication PIN**: Exactly 6 digits (mandatory)
- **Room Time Limit**: Time in minutes before auto-deletion (mandatory)

#### Optional Fields:
- **Burn After Reading**: Messages auto-delete based on time limit

#### What Happens:
1. User fills all mandatory fields
2. Room is created with a unique Room ID
3. Timer starts immediately based on the time limit
4. User is shown an alert with:
   - Room ID
   - Password
   - 2FA PIN
   - Time limit
5. These credentials must be shared with others to join
6. User automatically joins the room

### 3. **Join Room Flow**

#### Required Fields:
- **Room ID**: Unique identifier (obtained from room creator)
- **Username**: Display name
- **Room Password**: Must match room password
- **Two-Factor Authentication PIN**: Must match room's 2FA PIN

#### Verification Process:
1. System checks if Room ID exists
2. Verifies password matches
3. Verifies 2FA PIN matches
4. If ANY credential is wrong → Access Denied
5. If all match → User joins the secure room

### 4. **Chat Features in Secure Mode**

#### End-to-End Encryption
- All messages are encrypted using AES-256
- Encryption key generated from: Room ID + Password + 2FA PIN
- Only users with correct credentials can decrypt messages

#### File Sharing
- **Image/Video/Document Upload**: Files appear as previews in chat
- **Download Button**: Visible on each file
- **Download Notification**: When someone downloads a file, all users see:
  ```
  📥 [Username] downloaded [filename]
  ```
- **Preview**: Images show inline, videos have player, documents have preview button

#### Screenshot Protection (Secure Mode Only)
- Detects screenshot attempts (PrtScn, Win+Shift+S, Cmd+Shift+3/4/5)
- **Instant Response**:
  1. Screen turns completely black immediately
  2. Shows warning message: "🚫 Screenshot Blocked"
  3. Notifies all users in the room:
     ```
     📸 [Username] tried to take a screenshot
     ```
  4. Black screen remains for 2 seconds

#### Auto-Delete Features

##### Room Expiration:
- Timer starts when room is created
- After time limit expires:
  - Room is automatically deleted
  - All messages deleted
  - All uploaded files deleted
  - Users are notified and kicked out

##### Empty Room Deletion:
- When ALL users leave/go offline:
  - 10-minute countdown timer starts
  - If no one rejoins within 10 minutes:
    - Room and all data deleted permanently
  - If someone rejoins before 10 minutes:
    - Timer is cancelled
    - Room continues normally

##### Burn After Reading (Optional):
- If enabled, messages auto-delete based on room time limit
- Files are also deleted when messages expire

### 5. **System Messages**
Users see system notifications for:
- User joined the room
- User left the room
- Screenshot attempts
- File downloads
- Room expiration warnings

## 🔧 Technical Implementation

### Client-Side Changes

#### 1. New Component: `SecureRoomSelection.jsx`
**Location**: `src/components/chat/SecureRoomSelection.jsx`

Features:
- Beautiful UI with animated cards
- Create Room form with validation
- Join Room form with validation
- Real-time error display
- 2FA PIN input with digit-only validation

#### 2. Updated: `SecureMode.jsx`
**Location**: `src/pages/SecureMode.jsx`

Changes:
- Removed authentication requirement
- Removed SecureLogin component
- Removed RoomList component
- Added direct SecureRoomSelection integration
- Socket initialization on page load
- Leave room functionality
- Exit to main menu

#### 3. Enhanced: `encryption.js`
**Location**: `src/utils/encryption.js`

New Functions:
```javascript
// Generate encryption key from credentials
generateRoomKey(roomId, password, twoFactorPin)

// Encrypt message for secure room
encryptSecureMessage(message, roomId, password, twoFactorPin)

// Decrypt message from secure room
decryptSecureMessage(encryptedMessage, roomId, password, twoFactorPin)
```

#### 4. Enhanced: `ChatWindow.jsx`
**Location**: `src/components/chat/ChatWindow.jsx`

Changes:
- Added room expiration handler
- Enhanced screenshot detection (secure mode only)
- Better black screen overlay with prominent warning
- User join/leave system messages
- File download notifications
- Preview for all file types

### Server-Side Changes

#### 1. Updated: `chatHandler.js`
**Location**: `server/socket/chatHandler.js`

New Socket Events:
```javascript
// Create secure room with 2FA
'secure-room:create'
  - Validates all fields
  - Creates room in memory (not persisted)
  - Starts expiry timer
  - Returns room details

// Join secure room with 2FA
'secure-room:join'
  - Validates Room ID, password, and 2FA PIN
  - Checks room expiration
  - Cancels offline deletion timer if exists
  - Adds user to room
  - Returns room and messages

// Room expired notification
'room:expired'
  - Sent when time limit reached
  - Client reloads to exit room
```

Enhanced Handlers:
- `room:leave` - Starts 10-minute deletion timer if room becomes empty (secure mode)
- `disconnect` - Implements same 10-minute timer logic

New Tracking:
```javascript
// Tracks rooms with offline deletion timers
const roomOfflineTimers = new Map()
```

#### 2. Room Manager
**Location**: `server/utils/roomManager.js`

Secure rooms are:
- Stored in memory only (never written to disk)
- Automatically deleted on server restart
- Include password and twoFactorPin fields
- Have expiration timers

## 🔐 Security Features

### 1. End-to-End Encryption
- Messages encrypted on sender's device
- Decrypted on receiver's device
- Server never sees plaintext messages
- Encryption key derived from Room ID + Password + 2FA PIN

### 2. Two-Factor Authentication
- Mandatory 6-digit PIN
- Must match exactly to join room
- Prevents unauthorized access even with password

### 3. No Data Persistence
- Rooms stored in memory only
- Messages never written to disk
- All data deleted on room expiry or server restart
- Truly ephemeral

### 4. Screenshot Protection
- Instant detection
- Black screen overlay
- Public notification to all users
- 2-second block duration

### 5. Auto-Deletion
- Time-based room expiry
- Empty room cleanup (10 minutes)
- Burn after reading option
- File cleanup on room deletion

## 📱 User Experience Flow

### Creating a Room:
1. User clicks "Secure Mode"
2. Sees "Create Room" and "Join Room" options
3. Clicks "Create Room"
4. Fills form:
   - Username: "Alice"
   - Password: "secure123"
   - 2FA PIN: "123456"
   - Time Limit: 30 (minutes)
   - Burn After Reading: ✓ (optional)
5. Clicks "Create Room"
6. Sees alert with credentials to share
7. Automatically enters the room
8. Can start chatting immediately

### Joining a Room:
1. User receives credentials from room creator:
   - Room ID: "abc123-def456"
   - Password: "secure123"
   - 2FA PIN: "123456"
2. Clicks "Secure Mode"
3. Clicks "Join Room"
4. Fills form with received credentials
5. Username: "Bob"
6. Clicks "Join Room"
7. If all correct → Enters room
8. If any wrong → "Access denied" error

### In the Room:
1. Send encrypted messages
2. Share files with preview
3. See download notifications
4. Join/leave notifications
5. Screenshot attempt alerts
6. Can leave anytime
7. Room expires after time limit

## 🚀 How to Test

### Test 1: Create and Join Flow
1. Open app in two browser tabs
2. Tab 1: Create room with credentials
3. Note the Room ID, password, and 2FA PIN
4. Tab 2: Join with correct credentials → Should succeed
5. Tab 2: Try with wrong password → Should fail
6. Tab 2: Try with wrong 2FA PIN → Should fail

### Test 2: Chat Features
1. Both users in room
2. Send text messages → Should appear instantly
3. Upload an image → Should show preview
4. Other user clicks download → Should see notification
5. Send messages → Should see in real-time

### Test 3: Screenshot Protection
1. Join secure room
2. Press PrtScn or Win+Shift+S
3. Screen should turn black
4. Other users should see screenshot alert
5. Screen returns to normal after 2 seconds

### Test 4: Auto-Deletion
1. Create room with 1-minute time limit
2. Wait 1 minute
3. Room should be deleted
4. Users should be kicked out
5. Alert shown: "Room has expired"

### Test 5: Empty Room Deletion
1. Create room
2. All users leave
3. Wait 10 minutes
4. Room should be deleted from server memory
5. Trying to rejoin should fail (room not found)

### Test 6: Rejoin Before Deletion
1. Create room
2. All users leave
3. Within 10 minutes, someone rejoins
4. Room should still exist
5. Timer should be cancelled

## 📋 Configuration

### Time Limits
- **Room Expiry**: Set by user (1-∞ minutes)
- **Empty Room Deletion**: 10 minutes (hardcoded)
- **Screenshot Block Duration**: 2 seconds (hardcoded)
- **Burn After Reading**: Based on room time limit

### Validation Rules
- **Password**: Minimum 6 characters
- **2FA PIN**: Exactly 6 digits (0-9)
- **Username**: Required, non-empty
- **Time Limit**: Must be > 0

## 🛠️ Troubleshooting

### Issue: "Room not found"
- Room may have expired
- Room ID might be wrong
- Room deleted after 10 minutes of inactivity

### Issue: "Invalid password"
- Password must match exactly (case-sensitive)
- Check for typos

### Issue: "Invalid 2FA PIN"
- PIN must be exactly 6 digits
- Must match room's PIN exactly

### Issue: Screenshot not blocked
- Only works in Secure Mode
- Only detects specific keyboard shortcuts
- Third-party tools might not be detected

### Issue: Room not deleting
- Check server logs for timer status
- Verify room expiry time
- Ensure server is running

## 🔄 Future Enhancements

Potential improvements:
1. Video calling in secure rooms
2. Voice messages
3. Custom time limits for individual messages
4. More advanced screenshot detection
5. Self-destructing messages after reading
6. Anonymous mode (no usernames)
7. Room capacity limits
8. Admin controls for host

## ✅ Testing Checklist

- [x] Room creation with all mandatory fields
- [x] Room creation validation (errors for missing fields)
- [x] Room joining with correct credentials
- [x] Room joining with wrong password (denied)
- [x] Room joining with wrong 2FA PIN (denied)
- [x] Message sending and receiving
- [x] File upload with preview
- [x] File download with notification
- [x] Screenshot detection and blocking
- [x] Screenshot notification to all users
- [x] Room expiration after time limit
- [x] Empty room deletion after 10 minutes
- [x] Timer cancellation when user rejoins
- [x] User join/leave notifications
- [x] Leave room functionality
- [x] Exit to main menu

## 📝 Summary

The Secure Mode implementation provides a truly private, ephemeral chat experience with:

✅ **No session setup** - Direct access to create/join
✅ **2FA authentication** - Mandatory 6-digit PIN
✅ **End-to-end encryption** - AES-256 encryption
✅ **Auto-deletion** - Time-based and empty room cleanup
✅ **Screenshot protection** - Detection and notification
✅ **File sharing** - Preview and download with alerts
✅ **System notifications** - Join/leave/download/screenshot alerts
✅ **No data persistence** - Memory-only storage
✅ **Burn after reading** - Optional message expiry

All features work together to create a secure, private communication platform that leaves no trace after the session ends.
