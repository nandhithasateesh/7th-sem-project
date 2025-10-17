# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to Fetch" Error on Mobile/LAN Access

**Symptoms:**
- Mobile devices show "Failed to fetch" when trying to create a secure session
- Error message: "Cannot connect to server"

**Causes:**
- Server not running on port 5000
- Firewall blocking port 5000
- Mobile device not on the same network as the server
- Server not listening on `0.0.0.0` (all network interfaces)

**Solutions:**

1. **Verify Server is Running:**
   ```bash
   cd server
   npm start
   ```
   You should see: `🚀 StealthLAN server running on http://localhost:5000`

2. **Check Server is Accessible on LAN:**
   - Find your computer's IP address:
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - From mobile browser, try accessing: `http://YOUR_IP:5000/api/health`
   - You should see: `{"status":"ok","message":"StealthLAN server is running"}`

3. **Configure Firewall (Windows):**
   ```powershell
   # Allow port 5000 through Windows Firewall
   New-NetFirewallRule -DisplayName "StealthLAN Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

4. **Ensure Both Frontend and Backend are Running:**
   - Terminal 1: `npm run dev` (Frontend on port 3000)
   - Terminal 2: `cd server && npm start` (Backend on port 5000)

5. **Access from Mobile:**
   - Use: `http://YOUR_COMPUTER_IP:3000`
   - NOT: `http://localhost:3000`

### 2. "Room Not Found" Error in Secure Mode

**Symptoms:**
- Laptop shows "Room not found" when trying to join with correct Room ID and password
- Error occurs even though Room ID is correct

**Causes:**
- Room was created on a different device/session
- Room expired (if time limit was set)
- Trying to access a Normal Mode room from Secure Mode (or vice versa)

**Solutions:**

1. **Verify Room ID is Correct:**
   - Room IDs are case-sensitive UUIDs (e.g., `abc123-def456-ghi789`)
   - Copy-paste the Room ID to avoid typos
   - Make sure there are no extra spaces

2. **Check Room Mode:**
   - Secure Mode rooms can ONLY be accessed from Secure Mode
   - Normal Mode rooms can ONLY be accessed from Normal Mode
   - If you get "This room exists in [other mode]", switch modes

3. **Verify Room Hasn't Expired:**
   - If the room had a time limit, it may have been auto-deleted
   - Create a new room or use a room without time limits

4. **Ensure You're Using the Join Room Feature:**
   - Click the **Join Room** button (green icon with arrow)
   - Enter the exact Room ID (not the room name)
   - Enter the password shared by the room creator

### 3. Socket Connection Issues

**Symptoms:**
- Chat messages not sending
- Room list not updating
- "Socket not connected" errors in console

**Solutions:**

1. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Look for socket connection messages:
     - ✅ `Socket connected: [socket-id]`
     - ✅ `User joined server with mode: secure`
   - If you see connection errors, check server status

2. **Verify Network Connectivity:**
   - Make sure all devices are on the same network
   - Check if server is reachable: `http://YOUR_IP:5000/api/health`

3. **Clear Browser Cache:**
   - Sometimes old cached files cause issues
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### 4. CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- Requests blocked by CORS

**Solutions:**

1. **Server Already Configured for CORS:**
   - The server is configured to allow all origins in development
   - If you still see CORS errors, restart the server

2. **Use Correct URLs:**
   - Always access via IP:PORT format
   - Don't mix HTTP and HTTPS

## Debugging Tips

### Enable Detailed Logging

1. **Frontend Logging:**
   - Open browser console (F12)
   - Look for messages prefixed with:
     - `[SecureLogin]` - Authentication issues
     - `[RoomList]` - Room operations
     - `🔌` - Socket connection
     - `✅` - Success messages
     - `❌` - Error messages

2. **Backend Logging:**
   - Check terminal where server is running
   - Look for:
     - `[DEBUG]` - Debug information
     - `[JOIN]` - Room join attempts
     - `[CREATE]` - Room creation

### Network Testing

1. **Test API Endpoint:**
   ```bash
   # From any device on the network
   curl http://YOUR_IP:5000/api/health
   ```

2. **Test Socket Connection:**
   - Open browser console on mobile
   - Look for WebSocket connection messages
   - Should see: `WebSocket connection to 'ws://YOUR_IP:5000/socket.io/'`

## Quick Checklist

Before reporting an issue, verify:

- [ ] Server is running (`cd server && npm start`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Both devices are on the same network
- [ ] Firewall allows port 5000
- [ ] Using correct IP address (not localhost on mobile)
- [ ] Room ID is copied correctly (for secure mode)
- [ ] Password is correct
- [ ] Using correct mode (Secure vs Normal)
- [ ] Browser console shows no errors

## Still Having Issues?

1. **Restart Everything:**
   - Stop server (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Clear browser cache
   - Restart server: `cd server && npm start`
   - Restart frontend: `npm run dev`

2. **Check Server Logs:**
   - Look for error messages in the terminal
   - Note any stack traces or error codes

3. **Test on Localhost First:**
   - Before testing on LAN, verify everything works on `localhost`
   - If localhost works but LAN doesn't, it's a network/firewall issue

## Recent Fixes (Applied)

✅ **Fixed:** Secure mode "Room not found" error when joining by Room ID
- Now allows joining rooms by ID even if not in local room list
- Rooms are automatically added to list after successful join

✅ **Fixed:** Better error messages for connection failures
- Clear indication when server is unreachable
- Helpful guidance on what to check

✅ **Fixed:** Room filtering in secure mode
- Secure rooms can now be joined via Room ID from any device
- Room list properly updates after joining
