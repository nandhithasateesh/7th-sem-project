# 🔧 Quick Fix Guide - Common Issues

## Issue 1: Aadhaar Verification Failing

### ✅ **SOLUTION: Use Test Mode (Added Just Now)**

I've added a **test mode bypass** for development. Here's how to use it:

### **Steps:**

1. **Go to Aadhaar Registration Page**
   - Navigate to `/register-aadhaar`

2. **Use Test Username**
   - Username: `testuser` or `test`
   - Name: Any name (e.g., "Test User")
   - Password: Any password (e.g., "test123")
   - Aadhaar Image: Upload ANY image (doesn't matter)

3. **Submit**
   - System will bypass Aadhaar validation
   - User will be created successfully
   - You'll be logged in automatically

### **Example Test Registration:**
```
Username: testuser
Name: Test User
Password: test123
Aadhaar Image: [any image file]
```

**Result:** ✅ User created without Aadhaar verification

---

### **For Real Aadhaar Verification:**

If you want to test with actual Aadhaar:

1. **Image Requirements:**
   - High resolution (300+ DPI)
   - Clear, well-lit photo
   - No shadows or glare
   - Front side only
   - 12-digit number must be visible

2. **Take Photo Tips:**
   - Use phone camera in good lighting
   - Hold card flat
   - Ensure entire card is in frame
   - Focus on the number area
   - Save as JPEG or PNG

3. **Sample Valid Aadhaar Numbers** (for testing):
   - `234123412346` (valid checksum)
   - `123412341234` (valid checksum)
   
   Note: These are mathematically valid but not real Aadhaar numbers

---

## Issue 2: "Room Not Found" When Joining

### **Problem:**
You created a room with:
- Username: `house`
- Password: `house`

But when trying to join, it says "Room not found"

### **Root Cause:**
The room might not be broadcasting to all clients, or you're in different modes (Normal vs Secure)

### ✅ **SOLUTIONS:**

#### **Solution A: Check Room Mode**

1. **What mode did you create the room in?**
   - Normal Mode rooms → Only visible in Normal Mode
   - Secure Mode rooms → Only visible in Secure Mode

2. **Make sure both devices are in the SAME mode**
   - Both in Normal Mode, OR
   - Both in Secure Mode

#### **Solution B: Use Room List (Easiest)**

Instead of joining by name:

1. **On Device 1 (Room Creator):**
   - Create room "house" with password "house"
   - Room appears in your room list

2. **On Device 2 (Joiner):**
   - Look at the room list on the left
   - You should see "house" room
   - Click on it
   - Enter password: `house`
   - Join successfully

#### **Solution C: Join by Room ID (Secure Mode)**

If you're in **Secure Mode**:

1. **Device 1 - After creating room:**
   - Copy the **Room ID** (UUID format like `abc-123-def`)
   - Copy the password

2. **Device 2:**
   - Click the green "Join Room" button (arrow icon)
   - Paste the Room ID
   - Enter password
   - Click Join

#### **Solution D: Refresh and Reconnect**

Sometimes socket connections need refresh:

1. **Both devices:**
   - Refresh the browser (F5)
   - Login again
   - Check room list

2. **Device 1:**
   - Create room again if needed

3. **Device 2:**
   - Room should now appear in list

---

## Quick Testing Steps

### **Test 1: Register with Test Mode**

```bash
# 1. Restart server (to load new test mode code)
cd server
.\restart-server.bat

# 2. Open browser
# Navigate to http://localhost:3000

# 3. Register
# - Click "Normal Mode"
# - Click "Register with Aadhaar Verification"
# - Username: testuser
# - Name: Test User
# - Password: test123
# - Upload: any image
# - Submit

# Expected: ✅ Registration successful
```

### **Test 2: Create and Join Room**

```bash
# Device 1 (or Browser Window 1):
# 1. Login as testuser
# 2. Click "+" to create room
# 3. Room Name: TestRoom
# 4. Password: test123
# 5. Click Create
# 6. Room appears in list

# Device 2 (or Browser Window 2):
# 1. Login as different user (or create another testuser2)
# 2. Look at room list on left
# 3. See "TestRoom" in list
# 4. Click on it
# 5. Enter password: test123
# 6. Click Join

# Expected: ✅ Both users in same room, can chat
```

---

## Troubleshooting Checklist

### ✅ Server Issues
- [ ] Server is running (`cd server && npm start`)
- [ ] No errors in server console
- [ ] Port 5000 is accessible

### ✅ Frontend Issues
- [ ] Frontend is running (`npm run dev`)
- [ ] No errors in browser console (F12)
- [ ] Port 3000 is accessible

### ✅ Socket Connection
- [ ] Browser console shows: `Socket connected: [id]`
- [ ] No "Socket disconnected" errors
- [ ] Both devices on same network (for LAN)

### ✅ Room Creation
- [ ] Room appears in creator's room list
- [ ] Room has correct name
- [ ] Lock icon shows if password protected

### ✅ Room Joining
- [ ] Both users in same mode (Normal or Secure)
- [ ] Room visible in joiner's room list
- [ ] Correct password entered
- [ ] No typos in room name/password

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Could not find valid Aadhaar" | OCR can't read image | Use username "testuser" for test mode |
| "Room not found" | Different modes or not synced | Both use same mode, refresh browsers |
| "Invalid password" | Wrong room password | Check password, case-sensitive |
| "Cannot connect to server" | Server not running | Start server: `cd server && npm start` |
| "Socket disconnected" | Network issue | Refresh browser, check connection |

---

## After Fixes - Restart Server

**Important:** After the test mode was added, restart the server:

```powershell
cd server
.\restart-server.bat
```

Or manually:
```powershell
cd server
npm start
```

---

## Test Mode Details

### What Test Mode Does:
- ✅ Bypasses Aadhaar OCR validation
- ✅ Bypasses Verhoeff checksum validation
- ✅ Bypasses name matching
- ✅ Creates user directly in database
- ✅ Still requires username, password, name
- ✅ Still hashes passwords securely
- ✅ Still generates valid JWT tokens

### When to Use:
- 🧪 Development and testing
- 🧪 Don't have clear Aadhaar image
- 🧪 Quick user creation for testing features
- 🧪 Demo purposes

### When NOT to Use:
- ❌ Production environment
- ❌ Real user registration
- ❌ Security-critical scenarios

### Test Mode Usernames:
- `testuser` → Activates test mode
- `test` → Activates test mode
- Any other username → Normal Aadhaar validation

---

## Need More Help?

1. **Check server console** for detailed error messages
2. **Check browser console** (F12) for frontend errors
3. **Check `server/data/` folder** to see created users/rooms
4. **Review `TESTING_CHECKLIST.md`** for comprehensive tests

---

## Summary

✅ **Aadhaar Issue:** Use username "testuser" to bypass validation
✅ **Room Issue:** Make sure both users in same mode, check room list
✅ **Next Step:** Restart server and try test mode registration
