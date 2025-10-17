# ⏱️ Extend Time Feature - Limits & Permissions

## 🔒 Who Can Extend Time?

### ✅ ONLY the Room Creator (Host)
The person who **created the room** can extend time.

**Example:**
```
nandhitha creates room "exam" → ✅ CAN extend time
abi joins room "exam"        → ❌ CANNOT extend time
```

---

## ⚠️ Error Messages Explained

### Error 1: "Only the room creator can extend time"

**When you see this:**
```
Failed to extend time: Only the room creator can extend time
```

**What it means:**
- You are NOT the room creator
- You joined someone else's room
- Only the host can extend time

**Example:**
```
Room: "exam"
Creator: nandhitha
Members: nandhitha, abi, charlie

✅ nandhitha clicks +2m → Works!
❌ abi clicks +2m → Error: "Only the room creator can extend time"
❌ charlie clicks +2m → Error: "Only the room creator can extend time"
```

**Solution:**
- Only the host can extend time
- Ask the host to extend if you need more time
- Or: Leave and create your own room

---

## 📊 All Limits & Restrictions

### Limit 1: Permission (**WHO** can extend)
```
✅ Room Creator (Host): YES
❌ Regular Members: NO
```

### Limit 2: Minutes Range (**HOW MUCH** can extend)
```
Minimum: 1 minute
Maximum: 60 minutes (1 hour) per click
```

**Error if outside range:**
```
Minutes must be between 1 and 60
```

**Examples:**
```
✅ +1 minute → Works
✅ +2 minutes → Works
✅ +5 minutes → Works
✅ +10 minutes → Works
✅ +60 minutes → Works (max)

❌ +0 minutes → Error
❌ +61 minutes → Error
❌ +100 minutes → Error
```

### Limit 3: Button Options (UI)
```
Available buttons:
- +1m (1 minute)
- +2m (2 minutes)
- +5m (5 minutes)
```

**You can click multiple times:**
```
Start: 5 minutes remaining
Click +5m → 10 minutes remaining
Click +5m → 15 minutes remaining
Click +5m → 20 minutes remaining
✅ No limit on how many times you can extend!
```

### Limit 4: Room Must Exist
```
✅ Room exists → Can extend
❌ Room expired → Cannot extend
❌ Room deleted → Cannot extend
```

### Limit 5: Secure Mode Only
```
✅ Secure Mode → Can extend time
❌ Normal Mode → No time limit (doesn't apply)
```

---

## 📋 Complete Validation Checklist

When you click extend time, server checks:

1. ✅ **Room ID provided?**
   - Error: "Room ID and minutes to add are required"

2. ✅ **Minutes to add provided?**
   - Error: "Room ID and minutes to add are required"

3. ✅ **Minutes between 1-60?**
   - Error: "Minutes must be between 1 and 60"

4. ✅ **Room exists?**
   - Error: "Room not found"

5. ✅ **You are the creator?**
   - Error: "Only the room creator can extend time"

6. ✅ **All checks pass → Time extended! ✅**

---

## 🎯 Permission Matrix

| User Type | Can See Buttons? | Can Click? | What Happens? |
|-----------|------------------|------------|---------------|
| **Room Creator (Host)** | ✅ YES | ✅ YES | ✅ Time extends |
| **Regular Member** | ❌ NO | ❌ N/A | ❌ Buttons hidden |
| **Not in room** | ❌ NO | ❌ N/A | ❌ Not applicable |

---

## 💡 Common Questions

### Q1: Why can't I see the extend buttons?
**A:** You are not the room creator. Only the host sees the buttons.

**Check:**
```
Look at the room header:
- If you created the room → You should see +1m, +2m, +5m buttons
- If you joined someone's room → You won't see buttons
```

### Q2: I clicked +5m but got an error "Only the room creator can extend time"
**A:** This shouldn't happen if the UI is working correctly. The buttons should be hidden for non-creators.

**Possible causes:**
1. Someone else created the room, you just joined
2. UI bug (please report)

### Q3: Can I extend by 10 minutes at once?
**A:** No single button for +10m, but you can:
```
Option 1: Click +5m twice (5 + 5 = 10)
Option 2: Click +2m five times (2 + 2 + 2 + 2 + 2 = 10)
```

### Q4: Is there a maximum total time?
**A:** No maximum! You can keep extending forever.

**Example:**
```
Start: 5 minutes
After 10 extensions: 55 minutes
After 20 extensions: 105 minutes
After 100 extensions: 505 minutes
✅ No limit on total time!
```

### Q5: What if I click +60m when there's only 30 seconds left?
**A:** It adds 60 minutes to the current time.

**Example:**
```
Before: 00:00:30 (30 seconds left)
Click: +60m (60 minutes)
After: 01:00:30 (1 hour 30 seconds)
✅ Works perfectly!
```

---

## 🔄 How Extension Works

### Step-by-Step:

**1. Creator clicks +2m button**
```javascript
Client → Server: "extend-time" { roomId: "exam", minutesToAdd: 2 }
```

**2. Server validates:**
```javascript
✅ roomId provided? YES
✅ minutesToAdd provided? YES
✅ minutesToAdd between 1-60? YES (2 is valid)
✅ room exists? YES
✅ user is creator? YES
```

**3. Server extends time:**
```javascript
currentExpiry: 2025-10-15T01:05:00.000Z
minutesToAdd: 2
newExpiry: 2025-10-15T01:07:00.000Z (added 2 minutes)
```

**4. Server notifies everyone:**
```javascript
Server → All Users: "room:time-extended" {
  roomId: "exam",
  newExpiresAt: "2025-10-15T01:07:00.000Z",
  minutesAdded: 2,
  extendedBy: "nandhitha"
}
```

**5. All users update:**
```javascript
Creator (nandhitha):
  ✅ Timer updates: 00:03:45 → 00:05:45
  ✅ No alert (they clicked it)

Members (abi, charlie):
  ✅ Timer updates: 00:03:45 → 00:05:45
  ✅ Alert: "Room time extended by 2 minute(s) by nandhitha"
```

---

## 📊 Statistics & Limits Summary

| Limit Type | Value | Can Override? |
|------------|-------|---------------|
| **Who can extend** | Room creator only | ❌ NO |
| **Minimum minutes** | 1 minute | ❌ NO |
| **Maximum minutes per click** | 60 minutes | ❌ NO |
| **Maximum total extensions** | Unlimited | ✅ N/A |
| **Maximum total time** | Unlimited | ✅ N/A |
| **Cooldown between clicks** | None | ✅ N/A |

---

## 🎨 UI Behavior

### Creator View (Host):
```
┌────────────────────────────────────────────────┐
│ 🕒 00:04:32  [+1m] [+2m] [+5m]                 │
│              ↑     ↑     ↑                     │
│              Visible buttons                   │
└────────────────────────────────────────────────┘
```

### Member View (Non-Host):
```
┌────────────────────────────────────────────────┐
│ 🕒 00:04:32                                    │
│              No buttons visible                │
└────────────────────────────────────────────────┘
```

---

## ⚡ Quick Reference

### ✅ You CAN extend if:
- You created the room
- Room is in secure mode
- Room still exists
- You're currently in the room
- You click 1-60 minutes

### ❌ You CANNOT extend if:
- You joined someone else's room
- You're not the creator
- Room already expired
- Room was deleted
- You left the room

---

## 🚀 Examples

### Example 1: Successful Extension
```
User: nandhitha (creator)
Room: exam
Time left: 00:02:30

Action: Click +5m
Result: ✅ Timer now shows: 00:07:30
Alert to others: "Room time extended by 5 minute(s) by nandhitha"
```

### Example 2: Failed Extension (Not Creator)
```
User: abi (member)
Room: exam (created by nandhitha)
Time left: 00:02:30

Action: Try to click +5m
Result: ❌ Buttons not visible
        ❌ Cannot extend
        ❌ Only nandhitha can extend
```

### Example 3: Multiple Extensions
```
User: alice (creator)
Room: meeting
Start time: 00:05:00

alice clicks +2m → 00:07:00
alice clicks +2m → 00:09:00
alice clicks +5m → 00:14:00
alice clicks +5m → 00:19:00

✅ All extensions work
✅ No limits on quantity
```

---

## 📝 Summary

### Permission Limit:
```
✅ ONLY room creator can extend time
❌ Regular members CANNOT extend time
```

### Time Limits:
```
Minimum per click: 1 minute
Maximum per click: 60 minutes
Total extensions: Unlimited
Total time: Unlimited
```

### Other Limits:
```
✅ Room must exist
✅ Secure mode only
✅ No cooldown between clicks
✅ Can extend multiple times
```

### Error Messages:
```
1. "Only the room creator can extend time"
   → You're not the host

2. "Minutes must be between 1 and 60"
   → Invalid minute value

3. "Room not found"
   → Room expired or deleted

4. "Room ID and minutes to add are required"
   → Missing data (shouldn't happen from UI)
```

---

## 🎯 Key Takeaway

**Only 2 main limits:**
1. ✅ **WHO:** Only room creator (host)
2. ✅ **HOW MUCH:** 1-60 minutes per click

Everything else is unlimited! 🚀
