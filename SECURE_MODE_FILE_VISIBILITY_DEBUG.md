# 🔍 Secure Mode File Visibility Issue - Debug Guide

## 🐛 **Problem Description**

In secure mode, when a user sends a file (PDF, image, etc.), the file message:
- ✅ **Appears correctly** for other users (receivers)
- ❌ **Does NOT appear** for the sender in their own chat

## 🔧 **Debugging Steps Added**

### **1. Server-Side Debugging (`chatHandler.js`)**

Added logging to check:
- If sender is properly in the socket room when sending
- Room membership verification
- Message broadcast confirmation

```javascript
// Check if sender is in the room (debugging)
const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
const senderInRoom = socketsInRoom && socketsInRoom.has(socket.id);
console.log(`[MESSAGE:SEND] Sender ${socket.username} in room ${roomId}: ${senderInRoom}`);
console.log(`[MESSAGE:SEND] Room ${roomId} has ${socketsInRoom ? socketsInRoom.size : 0} sockets`);
```

### **2. Client-Side Debugging (`ChatWindow.jsx`)**

Added logging to track:
- `message:new` event reception
- File message sending process
- Response handling

```javascript
socket.on('message:new', (message) => {
  console.log(`[CLIENT] Received message:new event:`, {
    messageId: message.id,
    type: message.type,
    sender: message.username,
    currentUser: user?.username,
    mode: mode,
    roomId: room?.id
  });
  // ...
});
```

## 🧪 **Testing Instructions**

### **Step 1: Open Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Clear console logs

### **Step 2: Test File Upload in Secure Mode**
1. User A creates secure room
2. User B joins secure room  
3. User A uploads a PDF file
4. **Check console logs** for both users

### **Step 3: Expected Console Output**

#### **User A (Sender) Console:**
```
[CLIENT] Sending file message: {type: "file", fileName: "document.pdf", ...}
[CLIENT] File message send response: {success: true, message: {...}}
[CLIENT] File message sent successfully, message ID: abc123
[CLIENT] Received message:new event: {messageId: "abc123", type: "file", sender: "UserA", ...}
```

#### **User B (Receiver) Console:**
```
[CLIENT] Received message:new event: {messageId: "abc123", type: "file", sender: "UserA", ...}
```

#### **Server Console:**
```
[MESSAGE:SEND] Sender UserA in room room123: true
[MESSAGE:SEND] Room room123 has 2 sockets
[MESSAGE:SEND] Message sent to room room123 by UserA
```

## 🔍 **Potential Issues to Check**

### **Issue 1: Socket Room Membership**
- **Check**: Is sender properly joined to socket room?
- **Expected**: `Sender UserA in room room123: true`
- **If false**: Socket join issue during room creation/joining

### **Issue 2: Message Event Reception**
- **Check**: Does sender receive `message:new` event?
- **Expected**: Sender should see their own message in console
- **If missing**: Event not reaching sender's client

### **Issue 3: React State Update**
- **Check**: Does `setMessages` get called for sender?
- **Expected**: Message should be added to sender's message list
- **If missing**: State update issue

### **Issue 4: Duplicate Prevention**
- **Check**: Is there duplicate message filtering?
- **Expected**: No duplicate filtering for new messages
- **If filtered**: Message might be incorrectly identified as duplicate

## 🛠️ **Potential Fixes**

### **Fix 1: Explicit Sender Emission**
If sender not receiving via `io.to(roomId)`:
```javascript
// Ensure sender gets their own message
io.to(roomId).emit('message:new', message);
socket.emit('message:new', message); // Explicit to sender
```

### **Fix 2: Socket Room Re-join**
If sender not in room:
```javascript
// Ensure sender is in room before sending
if (!socket.rooms.has(roomId)) {
  socket.join(roomId);
}
```

### **Fix 3: Client-Side Message Addition**
If server broadcast fails:
```javascript
// Add message locally for sender
socket.emit('message:send', messageData, (response) => {
  if (response.success) {
    setMessages(prev => [...prev, response.message]);
  }
});
```

## 📊 **Debug Checklist**

- [ ] Server logs show sender in room: `true`
- [ ] Server logs show correct socket count
- [ ] Sender console shows file send success
- [ ] Sender console shows `message:new` event received
- [ ] Receiver console shows `message:new` event received
- [ ] Sender's chat UI shows the file message
- [ ] Receiver's chat UI shows the file message

## 🎯 **Next Steps**

1. **Run the test** with console logging
2. **Identify which step fails** from the debug output
3. **Apply appropriate fix** based on the failure point
4. **Remove debug logging** once issue is resolved

---

**Status**: 🔄 Debug logging added, ready for testing
