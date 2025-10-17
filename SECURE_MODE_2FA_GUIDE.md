# 🔐 Secure Mode with Google Authenticator - Complete Guide

## Overview

The Secure Mode now uses **Google Authenticator** for Two-Factor Authentication (2FA). This provides military-grade security using Time-based One-Time Passwords (TOTP).

---

## ✨ What's New

### 1. Room ID Field Added
- You now enter a **custom Room ID** when creating a room
- This makes it easier to share and remember room identifiers

### 2. Google Authenticator Integration
- **QR Code** generated during room creation
- Scan with **Google Authenticator** mobile app
- Enter **6-digit code** to verify and create room
- Same code required to join the room

### 3. No More Manual PIN
- OLD: Manual 6-digit PIN that you choose
- NEW: Dynamic 6-digit codes from Google Authenticator that change every 30 seconds

---

## 🚀 How to Create a Room

### Step 1: Initial Room Setup

1. Click **"Secure Mode"** on the landing page
2. Click **"Create Room"** (purple card)
3. Fill in the following fields:

   **Room ID** (NEW!) - *Required*
   - Enter a unique identifier for your room
   - Example: `meeting-2025`, `team-alpha`, `project-x`
   - This is what others will use to find your room
   
   **Username** - *Required*
   - Your display name in the room
   - Example: `Alice`, `JohnDoe`, `TeamLead`
   
   **Password** - *Required*
   - Minimum 6 characters
   - Example: `SecurePass123`
   
   **Room Time Limit** - *Required*
   - Time in minutes before room auto-deletes
   - Example: `30`, `60`, `120`
   
   **Burn After Reading** - *Optional*
   - Check to auto-delete messages based on time limit

4. Click **"Next: Setup 2FA"**

### Step 2: Google Authenticator Setup

You'll now see a screen with:

**Instructions:**
```
Step 1: Open Google Authenticator on your mobile device
Step 2: Scan the QR code below
Step 3: Enter the 6-digit code displayed
```

**QR Code Display:**
- Large QR code displayed in the center
- White background for easy scanning

**What to Do:**

1. **Open Google Authenticator** on your phone
   - iOS: [Download from App Store](https://apps.apple.com/app/google-authenticator/id388497605)
   - Android: [Download from Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

2. **Add a New Account:**
   - Tap the **"+"** button in Google Authenticator
   - Select **"Scan a QR code"**
   - Point camera at the QR code on your screen

3. **Entry Appears:**
   - You'll see a new entry: **`StealthLAN:[YourRoomID]`**
   - It shows a 6-digit code that changes every 30 seconds

4. **Enter the Code:**
   - Type the 6-digit code in the input field
   - Click **"Create Room"**

5. **Success!**
   - Room is created
   - You automatically join the room
   - Alert shows: Room ID, Password, and 2FA info

---

## 🔓 How to Join a Room

### Step 1: Get Credentials from Host

The room creator must share with you:
- **Room ID** (e.g., `meeting-2025`)
- **Password** (e.g., `SecurePass123`)
- **QR Code** or **2FA Secret** (they need to scan the same QR code)

### Step 2: Setup Your Google Authenticator

1. The host shows you the **QR code** they scanned
2. Open **Google Authenticator** on your phone
3. Tap **"+"** → **"Scan a QR code"**
4. Scan the **same QR code** the host used
5. You'll see **`StealthLAN:[RoomID]`** appear with a 6-digit code

### Step 3: Join the Room

1. Click **"Secure Mode"** on landing page
2. Click **"Join Room"** (green card)
3. Fill in the form:

   **Room ID** - *Required*
   - Enter the Room ID from the host
   - Example: `meeting-2025`
   
   **Username** - *Required*
   - Choose your display name
   - Example: `Bob`, `GuestUser`
   
   **Password** - *Required*
   - Enter the password from the host
   - Example: `SecurePass123`
   
   **Google Authenticator Code** - *Required*
   - Open Google Authenticator
   - Find **`StealthLAN:[RoomID]`**
   - Enter the 6-digit code shown
   - Example: `123456`

4. Click **"Join Room"**

### Step 4: Verification

- System checks Room ID exists ✓
- System checks password matches ✓
- System verifies 2FA code from Google Authenticator ✓
- If ALL correct → You join the room!
- If ANY wrong → Access denied

---

## 🔒 Security Features

### Time-Based One-Time Password (TOTP)
- Codes change every **30 seconds**
- Based on **RFC 6238** standard
- Same technology banks use for 2FA
- Nearly impossible to guess or intercept

### Verification Window
- Server accepts codes within **±60 seconds**
- Accounts for small clock differences
- Still highly secure

### No Code Reuse
- Each code only valid for 30 seconds
- Old codes automatically expire
- Can't replay captured codes

### End-to-End Encryption
- 2FA secret stored securely
- Messages encrypted with room credentials
- Server only verifies, doesn't decrypt

---

## 📱 Google Authenticator Tips

### Managing Multiple Rooms
- Each room appears as separate entry
- Format: `StealthLAN:[RoomID]`
- Easy to identify which code to use

### Backup Your Accounts
- Google Authenticator can backup to Google account
- Enable in app settings
- Prevents losing access if phone lost

### Sync Issues
- If codes don't work, check phone time
- Must be set to automatic (network time)
- Even 1 minute difference causes issues

### Sharing QR Codes Securely
- Take screenshot of QR code
- Share via encrypted messaging
- Delete screenshot after sharing
- Never post publicly

---

## 🎯 Example Scenarios

### Scenario 1: Private Business Meeting

**Host Creates Room:**
```
Room ID: business-meeting-oct14
Username: Alice
Password: Conference2025!
Time Limit: 60 minutes
Burn After Reading: Yes
```

1. Host scans QR code with Google Authenticator
2. Enters code: `487392`
3. Room created successfully
4. Host takes screenshot of QR code
5. Sends to Bob via Signal (encrypted messaging)

**Bob Joins:**
```
Room ID: business-meeting-oct14
Username: Bob
Password: Conference2025!
```

1. Bob scans QR code from screenshot
2. Opens Google Authenticator
3. Sees: `StealthLAN:business-meeting-oct14`
4. Current code: `391847`
5. Enters code and joins successfully

### Scenario 2: Team Collaboration

**Host Creates Room:**
```
Room ID: dev-team-alpha
Username: TeamLead
Password: DevSecure123
Time Limit: 480 minutes (8 hours)
Burn After Reading: No
```

1. Host scans QR in Google Authenticator
2. Shares QR code with 5 team members
3. All team members scan same QR
4. Everyone has matching authenticator entry

**Team Members Join:**
- Each person uses their own username
- Same Room ID: `dev-team-alpha`
- Same password: `DevSecure123`
- Each enters current code from their Google Authenticator
- Codes change every 30 seconds but all sync to same entry

---

## ⚠️ Troubleshooting

### "Invalid verification code" During Room Creation

**Causes:**
- Code expired (30-second window)
- Phone time not synced
- Typo in code entry

**Solutions:**
1. Wait for new code to appear (up to 30 seconds)
2. Check phone Settings → Date & Time → Set Automatically
3. Re-scan QR code if problem persists
4. Try clicking "Back" and re-generating 2FA

### "Invalid 2FA code" When Joining

**Causes:**
- Scanned wrong QR code
- Code expired before submission
- Not using Google Authenticator entry for this room
- Clock skew on phone

**Solutions:**
1. Verify you scanned the correct room's QR code
2. Make sure entry name matches: `StealthLAN:[RoomID]`
3. Wait for fresh code and try again
4. Sync phone time: Settings → Date & Time
5. Ask host to re-send QR code

### "Room ID already exists"

**Cause:**
- Another room with same ID already active

**Solution:**
- Choose a different, unique Room ID
- Add timestamp: `meeting-oct14-2pm`
- Add random suffix: `project-abc123`

### Can't Scan QR Code

**Solutions:**
1. Increase screen brightness
2. Move phone closer/farther from screen
3. Clean phone camera lens
4. Try screenshot method:
   - Take screenshot of QR code
   - Share via email/message
   - Scan from other device screen

### Lost Phone / Google Authenticator Access

**Prevention:**
- Enable Google Authenticator backup
- Save QR code screenshots securely
- Can re-scan QR if you saved it

**If Already Lost:**
- Cannot join existing rooms
- Must create new room
- Previous rooms become inaccessible

---

## 🔐 Best Practices

### Room Creation
1. **Use descriptive Room IDs**
   - Good: `team-meeting-oct14`
   - Bad: `room1`, `test`, `a`

2. **Choose strong passwords**
   - Minimum 8 characters
   - Mix letters, numbers, symbols
   - Don't reuse passwords

3. **Set appropriate time limits**
   - Quick chat: 15-30 minutes
   - Meeting: 60-120 minutes
   - All-day: 480 minutes (8 hours)

4. **Save QR code screenshot**
   - Needed for others to join
   - Store securely
   - Delete after room expires

### Sharing Credentials
1. **Use encrypted channels**
   - Signal, WhatsApp, Telegram
   - Never email or SMS

2. **Share separately**
   - Send QR code in one message
   - Send password in another
   - Tell Room ID verbally

3. **Time-sensitive sharing**
   - Share close to meeting time
   - Don't share days in advance

### Using Google Authenticator
1. **Enable backup**
   - Settings → Account Storage
   - Link to Google account

2. **Name entries clearly**
   - Default: `StealthLAN:[RoomID]`
   - Can rename if needed

3. **Delete old entries**
   - Remove after room expires
   - Keeps app organized

---

## 🆚 Old vs New Comparison

| Feature | Old (Manual PIN) | New (Google Authenticator) |
|---------|-----------------|----------------------------|
| **Room ID** | Auto-generated UUID | Custom user-defined ID |
| **2FA Method** | Static 6-digit PIN | Dynamic TOTP codes |
| **Security** | Medium (PIN can be shared easily) | High (codes change every 30 seconds) |
| **Setup** | Enter PIN manually | Scan QR code with app |
| **Joining** | Enter same PIN | Enter current code from app |
| **Code Reuse** | PIN never changes | Code changes every 30 seconds |
| **Interception Risk** | High (PIN can be captured) | Low (expired codes useless) |

---

## 📋 Quick Reference

### Create Room Flow:
1. Enter Room ID, Username, Password, Time Limit
2. Click "Next: Setup 2FA"
3. Scan QR with Google Authenticator
4. Enter 6-digit code
5. Click "Create Room"

### Join Room Flow:
1. Get Room ID, Password, and QR code from host
2. Scan QR with Google Authenticator
3. Enter Room ID, Username, Password
4. Enter current 6-digit code from app
5. Click "Join Room"

### Required Apps:
- **iOS**: Google Authenticator from App Store
- **Android**: Google Authenticator from Play Store
- **Alternative**: Authy, Microsoft Authenticator (compatible)

### Code Validity:
- Each code valid for **30 seconds**
- New code appears automatically
- Server accepts codes within **±60 seconds** window

---

## ✅ Testing Checklist

- [ ] Install Google Authenticator on phone
- [ ] Create room with custom Room ID
- [ ] Scan QR code successfully
- [ ] Enter verification code
- [ ] Room created successfully
- [ ] Take screenshot of QR code
- [ ] Open second browser/device
- [ ] Scan same QR code
- [ ] Join room with different username
- [ ] Enter current code from app
- [ ] Successfully join room
- [ ] Try expired code (should fail)
- [ ] Try wrong code (should fail)
- [ ] Try wrong password (should fail)

---

## 🎉 Summary

Your Secure Mode now uses **industry-standard 2FA** with Google Authenticator:

✅ **Custom Room IDs** - Easy to share and remember
✅ **QR Code Generation** - Simple setup process  
✅ **Google Authenticator** - Bank-level security
✅ **Dynamic Codes** - Change every 30 seconds
✅ **No Code Reuse** - Old codes automatically expire
✅ **Clock Sync** - ±60 second window for reliability
✅ **Secure Sharing** - QR codes for easy distribution
✅ **End-to-End Encryption** - Still fully encrypted

This implementation provides the perfect balance of **security** and **usability**! 🔒🚀
