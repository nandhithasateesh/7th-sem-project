# 🗑️ Auto-Cleanup System for Normal Mode

## Overview

Normal Mode now has **automatic cleanup** of expired rooms, messages, and files - just like Secure Mode!

## How It Works

### **Room Expiry:**
```
Room created with 24-hour time limit
    ↓
After 24 hours, room expires
    ↓
Cleanup scheduler runs (every 5 minutes)
    ↓
Deletes:
  - The room itself
  - All messages in the room
  - All files (images, videos, documents) sent in the room
```

### **Message Expiry:**
```
Room has message auto-delete set to 24 hours
    ↓
Messages older than 24 hours are expired
    ↓
Cleanup scheduler runs
    ↓
Deletes:
  - Expired messages
  - Associated files from expired messages
  - Room stays active (only old messages deleted)
```

---

## Features

### ✅ **Automatic Cleanup:**
- Runs every **5 minutes**
- Checks for expired rooms and messages
- Deletes files from `uploads/` folder
- No manual intervention needed

### ✅ **Two Types of Expiry:**

**1. Room Expiry (timeLimit):**
- Deletes entire room after X hours/minutes
- Removes all messages and files
- Example: "24-hour room" deletes everything after 24 hours

**2. Message Expiry (messageExpiry):**
- Deletes old messages while keeping room active
- Removes files from old messages
- Example: "Keep messages for 6 hours" deletes messages older than 6 hours

---

## Configuration

### **When Creating a Room:**

**Room Time Limit (Room Expiry):**
```javascript
{
  timeLimit: 1440  // Room expires in 1440 minutes (24 hours)
}
```

**Message Auto-Delete (Message Expiry):**
```javascript
{
  messageExpiry: 24  // Messages expire after 24 hours
}
```

**Options:**
- `1` hour
- `6` hours
- `12` hours
- `24` hours (default)
- `48` hours (2 days)
- `168` hours (7 days)
- `720` hours (30 days)
- `0` = Never delete (keep forever)

---

## Examples

### **Example 1: Temporary Project Room**
```javascript
{
  name: "Project Discussion",
  timeLimit: 2880,      // Room expires in 48 hours (2 days)
  messageExpiry: 24     // Messages older than 24 hours deleted
}
```

**Result:**
- Messages older than 24 hours deleted automatically
- Entire room deleted after 48 hours
- All files deleted when room expires

### **Example 2: Permanent Room with Message Cleanup**
```javascript
{
  name: "General Chat",
  timeLimit: null,      // Room never expires
  messageExpiry: 168    // Messages older than 7 days deleted
}
```

**Result:**
- Room stays forever
- Messages older than 7 days deleted
- Files from old messages deleted

### **Example 3: Keep Everything**
```javascript
{
  name: "Archive Room",
  timeLimit: null,      // Room never expires
  messageExpiry: 0      // Messages never deleted
}
```

**Result:**
- Room stays forever
- Messages kept forever
- Files kept forever

---

## Cleanup Process

### **What Gets Deleted:**

**When Room Expires:**
1. ✅ Room entry from `data/rooms.json`
2. ✅ All messages from `data/messages.json`
3. ✅ All files from `uploads/` folder:
   - Images (.jpg, .png, .gif)
   - Videos (.mp4, .webm)
   - Documents (.pdf, .docx, .txt)
   - Any other uploaded files

**When Messages Expire:**
1. ✅ Expired messages from `data/messages.json`
2. ✅ Files associated with expired messages from `uploads/`

### **What Stays:**
- ❌ Room (if only messages expired, not room)
- ❌ Recent messages (within expiry time)
- ❌ Files from recent messages

---

## Scheduler Details

### **Runs Every 5 Minutes:**
```
Server starts
    ↓
Cleanup runs immediately
    ↓
Wait 5 minutes
    ↓
Cleanup runs again
    ↓
Repeat...
```

### **Console Logs:**
```
[Cleanup] Starting cleanup scheduler (runs every 5 minutes)
[Cleanup] Starting cleanup check...
[Cleanup] Room expired: Project Discussion (expired at 2025-10-11T18:00:00.000Z)
[Cleanup] Deleted file: /uploads/abc123.jpg
[Cleanup] Deleted file: /uploads/def456.mp4
[Cleanup] Deleted 15 expired messages (8 files) from room General Chat
[Cleanup] Summary:
  - Expired rooms deleted: 1
  - Messages deleted: 15
  - Files deleted: 8
```

---

## File Deletion

### **Files Deleted:**
- Images sent in expired rooms/messages
- Videos sent in expired rooms/messages
- Documents sent in expired rooms/messages
- Any file with `fileUrl` in message

### **Files NOT Deleted:**
- Files in active rooms
- Files from recent messages
- Files in `uploads/secure/` (handled separately)

---

## Testing

### **Test Room Expiry:**

1. Create room with 1-minute expiry:
```javascript
{
  name: "Test Room",
  timeLimit: 1,  // 1 minute
  messageExpiry: 24
}
```

2. Send some messages with files
3. Wait 6 minutes (1 min expiry + 5 min scheduler)
4. Check console logs
5. Verify room, messages, and files are deleted

### **Test Message Expiry:**

1. Create room with no room expiry:
```javascript
{
  name: "Test Room",
  timeLimit: null,
  messageExpiry: 1  // 1 hour
}
```

2. Manually edit `data/messages.json` to set old timestamp
3. Wait for next cleanup cycle (up to 5 minutes)
4. Check console logs
5. Verify old messages and files deleted

---

## Manual Cleanup

### **Trigger Cleanup Manually:**

Add this endpoint to test (optional):

```javascript
// In server.js
app.post('/api/cleanup/trigger', (req, res) => {
  const { triggerCleanup } = require('./utils/cleanupScheduler.js');
  triggerCleanup();
  res.json({ success: true, message: 'Cleanup triggered' });
});
```

Then call:
```bash
curl -X POST http://localhost:5000/api/cleanup/trigger
```

---

## Comparison: Normal vs Secure Mode

| Feature | Normal Mode | Secure Mode |
|---------|-------------|-------------|
| **Room Expiry** | Optional (set timeLimit) | Always (session ends) |
| **Message Expiry** | Configurable (1h - 30d or never) | Always (session ends) |
| **File Storage** | `uploads/` | `uploads/secure/` |
| **File Deletion** | When room/message expires | When session ends |
| **Cleanup Frequency** | Every 5 minutes | Immediate on logout |
| **Persistence** | Until expiry | Never (ephemeral) |

---

## Benefits

### ✅ **Privacy:**
- Old messages automatically deleted
- Files don't accumulate forever
- Reduces data footprint

### ✅ **Storage Management:**
- Prevents disk space issues
- Automatic cleanup of old files
- No manual intervention needed

### ✅ **Compliance:**
- Data retention policies
- Automatic data deletion
- Audit trail in logs

### ✅ **Performance:**
- Smaller JSON files
- Faster room loading
- Reduced server storage

---

## Files Modified

**New Files:**
- `server/utils/cleanupScheduler.js` - Cleanup logic

**Modified Files:**
- `server/server.js` - Integrated scheduler

**Existing Files Used:**
- `server/utils/roomManager.js` - Read/write functions
- `server/data/rooms.json` - Room storage
- `server/data/messages.json` - Message storage
- `server/uploads/` - File storage

---

## Summary

✅ **Normal Mode now has auto-cleanup!**
- Rooms expire after timeLimit
- Messages expire after messageExpiry
- Files deleted automatically
- Runs every 5 minutes
- No manual cleanup needed

**Just like Secure Mode, but configurable!** 🗑️✨

---

**Ready to use!** Restart the server and the cleanup scheduler will start automatically.
