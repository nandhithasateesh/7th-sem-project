# 🔐 Secure Mode - Quick Start Guide

## What is Secure Mode?

Secure Mode is a highly secure, ephemeral chat environment with:
- ✅ End-to-end encryption
- ✅ Two-factor authentication (2FA)
- ✅ Auto-deletion of all data
- ✅ Screenshot protection
- ✅ No data persistence

## 🚀 How to Use

### Option 1: Create a Room

1. **Click "Secure Mode"** on the landing page
2. **Click "Create Room"** (purple card)
3. **Fill in ALL mandatory fields:**
   - Username: Your display name
   - Password: At least 6 characters
   - 2FA PIN: Exactly 6 digits (e.g., 123456)
   - Time Limit: Minutes before room auto-deletes
4. **Optional:** Check "Burn After Reading" for message auto-deletion
5. **Click "Create Room"**
6. **Save the credentials shown in the alert:**
   - Room ID
   - Password
   - 2FA PIN
7. **Share these credentials** with people you want to join

### Option 2: Join a Room

1. **Get credentials from the room creator:**
   - Room ID
   - Password
   - 2FA PIN
2. **Click "Secure Mode"** on the landing page
3. **Click "Join Room"** (green card)
4. **Enter the credentials:**
   - Room ID (from creator)
   - Username (your choice)
   - Password (from creator)
   - 2FA PIN (from creator)
5. **Click "Join Room"**
6. If all credentials match, you'll enter the room!

## 💬 Features in the Room

### Send Messages
- Type in the text box at the bottom
- Press Enter or click Send
- Messages are encrypted automatically

### Share Files
- Click the **Paperclip** icon to attach any file
- Click the **Image** icon to upload images
- Click the **Video** icon to record video
- Click the **Microphone** icon to record audio
- Files show as previews in the chat

### Download Files
- Click the **Download** button on any file
- All users see: "📥 [Your Name] downloaded [filename]"

### Leave Room
- Click **"Leave Room"** button (top-right, orange)
- You can rejoin if the room hasn't expired

### Exit Secure Mode
- Click **"Exit"** button (top-right, red)
- Returns to main menu

## 🔒 Security Features

### Screenshot Protection
- If someone tries to take a screenshot:
  - Screen turns BLACK instantly
  - Warning message appears
  - All users are notified: "📸 [Name] tried to take a screenshot"
  - Blocked for 2 seconds

### Auto-Deletion

**Room Expiry:**
- Room deletes after the time limit you set
- Everyone is kicked out
- All messages and files deleted forever

**Empty Room Deletion:**
- If EVERYONE leaves the room:
  - 10-minute countdown starts
  - Room deletes if no one returns
  - If someone rejoins, timer cancels

### End-to-End Encryption
- All messages encrypted on your device
- Only people with correct credentials can decrypt
- Server never sees your messages

## ⚠️ Important Notes

### Credentials
- **SAVE YOUR CREDENTIALS!** There's no way to recover them
- Share credentials securely (not over public channels)
- Anyone with credentials can join

### Access Denied?
- Check Room ID is correct (copy-paste to avoid typos)
- Password is case-sensitive
- 2FA PIN must be exactly 6 digits
- If ANY credential is wrong, access is denied

### Room Expired?
- Rooms auto-delete after the time limit
- Check with the creator if room is still active
- Empty rooms delete after 10 minutes

### No History
- Messages are NOT saved anywhere
- When room expires, everything is gone forever
- This is intentional for maximum privacy

## 📱 Tips for Best Experience

1. **Set Realistic Time Limits**
   - For quick chats: 30 minutes
   - For meetings: 1-2 hours
   - For all-day access: 480 minutes (8 hours)

2. **Share Credentials Securely**
   - Use encrypted messaging apps
   - Don't post publicly
   - Only share with trusted people

3. **Keep Room Active**
   - If everyone leaves, room deletes in 10 minutes
   - Keep at least one person in the room

4. **Files in Secure Mode**
   - Files are also encrypted
   - Files delete when room expires
   - Download important files before leaving

5. **Screenshot Protection**
   - Only detects keyboard shortcuts
   - Can't prevent all screenshot methods
   - Acts as deterrent + notification system

## 🎯 Common Scenarios

### Private Business Meeting
```
Time Limit: 120 minutes (2 hours)
Burn After Reading: No
Password: ComplexPassword123
2FA PIN: 789456
```

### Quick Secret Discussion
```
Time Limit: 15 minutes
Burn After Reading: Yes
Password: quick123
2FA PIN: 111111
```

### All-Day Secure Channel
```
Time Limit: 480 minutes (8 hours)
Burn After Reading: No
Password: WorkDay2024
2FA PIN: 246810
```

## 🆘 Troubleshooting

### Can't Create Room
- All fields marked with * are mandatory
- Password must be at least 6 characters
- 2FA PIN must be exactly 6 digits
- Time limit must be greater than 0

### Can't Join Room
- Verify Room ID (copy-paste from creator)
- Check password (case-sensitive)
- Verify 2FA PIN (exactly 6 digits)
- Room might have expired

### Messages Not Sending
- Check internet connection
- Try refreshing the page
- Room might have expired

### Files Not Uploading
- Check file size (10MB max)
- Check internet speed
- Try smaller files

### Screenshot Still Works
- Protection detects keyboard shortcuts only
- Some tools might bypass detection
- Notification still alerts everyone

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the full documentation (SECURE_MODE_IMPLEMENTATION.md)
3. Check server logs for errors
4. Verify internet connection

## ✨ Enjoy Secure, Private Communication!

Remember: Secure Mode is designed for maximum privacy. Once data is deleted, it's gone forever. Use responsibly!
