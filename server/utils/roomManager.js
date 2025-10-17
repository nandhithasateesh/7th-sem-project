import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// In-memory storage for secure mode
export const secureRooms = new Map();
const secureMessages = new Map();

// Initialize files
export const initializeRoomFiles = () => {
  if (!fs.existsSync(ROOMS_FILE)) {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({}, null, 2));
  }
};

// Normal Mode - Rooms
export const readRooms = () => {
  try {
    const data = fs.readFileSync(ROOMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rooms:', error);
    return [];
  }
};

export const writeRooms = (rooms) => {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
  } catch (error) {
    console.error('Error writing rooms:', error);
  }
};

export const createRoom = (roomData, mode = 'normal') => {
  // For normal mode: Cap time limit at 24 hours (1440 minutes), default to 24 hours if not set
  let timeLimit = roomData.timeLimit;
  if (mode === 'normal') {
    if (timeLimit && timeLimit > 1440) {
      timeLimit = 1440; // Cap at 24 hours
    } else if (!timeLimit) {
      timeLimit = 1440; // Default to 24 hours if not set
    }
  }

  const room = {
    id: roomData.id || uuidv4(), // Use provided ID or generate new one
    name: roomData.name,
    description: roomData.description || '',
    createdBy: roomData.createdBy,
    host: roomData.createdBy, // Host is the creator
    createdAt: new Date().toISOString(),
    password: roomData.password || null,
    burnAfterReading: roomData.burnAfterReading || false,
    timeLimit: timeLimit, // in minutes (for room deletion)
    messageExpiry: mode === 'normal' ? null : (roomData.messageExpiry || 24), // in normal mode, messages persist until room expires
    expiresAt: timeLimit ? new Date(Date.now() + timeLimit * 60000).toISOString() : null,
    members: [roomData.createdBy],
    mode
  };

  if (mode === 'normal') {
    const rooms = readRooms();
    rooms.push(room);
    writeRooms(rooms);
  } else {
    console.log(`[DEBUG] Storing secure room ${room.id} (${room.name}) in Map`);
    secureRooms.set(room.id, room);
    console.log(`[DEBUG] Secure rooms Map now has ${secureRooms.size} rooms`);
  }

  return room;
};

export const getRooms = (mode = 'normal') => {
  if (mode === 'normal') {
    const allRooms = readRooms();
    console.log(`[getRooms] Read ${allRooms.length} total rooms from file`);
    // Only return rooms that are explicitly normal mode or have no mode set (legacy)
    const normalRooms = allRooms.filter(room => !room.mode || room.mode === 'normal');
    console.log(`[getRooms] Filtered to ${normalRooms.length} normal mode rooms`);
    return normalRooms;
  } else {
    // Clean up expired rooms
    const now = Date.now();
    for (const [id, room] of secureRooms.entries()) {
      if (room.expiresAt && new Date(room.expiresAt) < now) {
        secureRooms.delete(id);
        secureMessages.delete(id);
      }
    }
    // Only return secure mode rooms
    const secureRoomsList = Array.from(secureRooms.values()).filter(room => room.mode === 'secure');
    console.log(`[getRooms] Returning ${secureRoomsList.length} secure mode rooms from memory`);
    return secureRoomsList;
  }
};

export const getRoom = (roomId, mode = 'normal') => {
  if (mode === 'normal') {
    const rooms = readRooms();
    return rooms.find(r => r.id === roomId);
  } else {
    console.log(`[DEBUG] Looking for room ${roomId} in secure mode. Total secure rooms: ${secureRooms.size}`);
    console.log(`[DEBUG] Secure room IDs:`, Array.from(secureRooms.keys()));
    const room = secureRooms.get(roomId);
    console.log(`[DEBUG] Room found:`, room ? 'YES' : 'NO');
    return room;
  }
};

export const deleteRoom = (roomId, mode = 'normal') => {
  if (mode === 'normal') {
    const rooms = readRooms();
    const filtered = rooms.filter(r => r.id !== roomId);
    writeRooms(filtered);
    
    // Delete messages
    const messages = readMessages();
    delete messages[roomId];
    writeMessages(messages);
  } else {
    // Secure mode: Delete files before deleting room
    const messages = secureMessages.get(roomId) || [];
    messages.forEach(message => {
      if (message.fileUrl && (message.type === 'image' || message.type === 'video' || message.type === 'document' || message.type === 'file')) {
        try {
          const filePath = path.join(__dirname, '..', message.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Secure Cleanup] Deleted file: ${message.fileUrl}`);
          }
        } catch (error) {
          console.error(`[Secure Cleanup] Error deleting file ${message.fileUrl}:`, error);
        }
      }
    });
    
    secureRooms.delete(roomId);
    secureMessages.delete(roomId);
  }
};

export const addMemberToRoom = (roomId, userId, mode = 'normal') => {
  if (mode === 'normal') {
    const rooms = readRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room && !room.members.includes(userId)) {
      room.members.push(userId);
      writeRooms(rooms);
    }
  } else {
    const room = secureRooms.get(roomId);
    if (room && !room.members.includes(userId)) {
      room.members.push(userId);
    }
  }
};

export const removeMemberFromRoom = (roomId, userId, mode = 'normal') => {
  if (mode === 'normal') {
    const rooms = readRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.members = room.members.filter(m => m !== userId);
      writeRooms(rooms);
    }
  } else {
    const room = secureRooms.get(roomId);
    if (room) {
      room.members = room.members.filter(m => m !== userId);
    }
  }
};

export const isHost = (roomId, userId, mode = 'normal') => {
  const room = getRoom(roomId, mode);
  return room && room.host === userId;
};

// Normal Mode - Messages
export const readMessages = () => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return {};
  }
};

export const writeMessages = (messages) => {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error writing messages:', error);
  }
};

export const addMessage = (roomId, message, mode = 'normal') => {
  // Get room to check messageExpiry setting
  const room = getRoom(roomId, mode);
  
  // Calculate message expiry based on room's messageExpiry setting
  let expiresAt = message.expiresAt || null;
  
  // In NORMAL mode: messages persist until room expires (no individual message expiry)
  if (mode === 'normal') {
    expiresAt = null; // Messages don't expire individually, they persist until room is deleted
  }
  
  // In SECURE mode: use messageExpiry setting if available
  if (room && room.messageExpiry && room.messageExpiry > 0 && mode === 'secure') {
    // Set expiry time based on room's messageExpiry (in hours)
    expiresAt = new Date(Date.now() + room.messageExpiry * 60 * 60 * 1000).toISOString();
  }
  
  // In SECURE mode: messages are deleted when session ends (no auto-expiry timer)
  // They're stored in memory and cleared when the room is deleted on session end
  
  const msg = {
    id: uuidv4(),
    roomId,
    userId: message.userId,
    username: message.username,
    content: message.content,
    type: message.type || 'text', // text, image, video, audio, file
    fileUrl: message.fileUrl || null,
    fileName: message.fileName || null,
    timestamp: new Date().toISOString(),
    reactions: {},
    pinned: false,
    read: true,
    burnAfterReading: message.burnAfterReading || false,
    expiresAt // Auto-calculated based on room settings
  };

  if (mode === 'normal') {
    const messages = readMessages();
    if (!messages[roomId]) {
      messages[roomId] = [];
    }
    messages[roomId].push(msg);
    writeMessages(messages);
    
    // Only auto-delete if expiresAt is set
    if (msg.expiresAt) {
      const expiryTime = new Date(msg.expiresAt).getTime() - Date.now();
      if (expiryTime > 0) {
        setTimeout(() => {
          deleteMessage(roomId, msg.id, mode);
        }, expiryTime);
      }
    }
  } else {
    if (!secureMessages.has(roomId)) {
      secureMessages.set(roomId, []);
    }
    secureMessages.get(roomId).push(msg);
    
    // Secure mode: Only auto-delete if expiresAt is set
    if (msg.expiresAt) {
      const expiryTime = new Date(msg.expiresAt).getTime() - Date.now();
      if (expiryTime > 0) {
        setTimeout(() => {
          const msgs = secureMessages.get(roomId);
          if (msgs) {
            const index = msgs.findIndex(m => m.id === msg.id);
            if (index !== -1) {
              msgs.splice(index, 1);
            }
          }
        }, expiryTime);
      }
    }
  }

  return msg;
};

export const getMessages = (roomId, mode = 'normal') => {
  if (mode === 'normal') {
    const messages = readMessages();
    const roomMessages = messages[roomId] || [];
    
    // In normal mode, messages persist until room is deleted (no individual expiry filtering)
    return roomMessages;
  } else {
    // In secure mode, filter out expired messages
    const roomMessages = secureMessages.get(roomId) || [];
    const now = Date.now();
    const validMessages = roomMessages.filter(msg => {
      if (msg.expiresAt && new Date(msg.expiresAt).getTime() < now) {
        return false; // Message expired
      }
      return true;
    });
    
    // Update secure messages if any were filtered out
    if (validMessages.length !== roomMessages.length) {
      secureMessages.set(roomId, validMessages);
    }
    
    return validMessages;
  }
};

export const deleteMessage = (roomId, messageId, mode = 'normal') => {
  if (mode === 'normal') {
    const messages = readMessages();
    if (messages[roomId]) {
      messages[roomId] = messages[roomId].filter(m => m.id !== messageId);
      writeMessages(messages);
    }
  } else {
    const msgs = secureMessages.get(roomId);
    if (msgs) {
      const index = msgs.findIndex(m => m.id === messageId);
      if (index !== -1) {
        msgs.splice(index, 1);
      }
    }
  }
};

export const addReaction = (roomId, messageId, userId, emoji, mode = 'normal') => {
  if (mode === 'normal') {
    const messages = readMessages();
    if (messages[roomId]) {
      const msg = messages[roomId].find(m => m.id === messageId);
      if (msg) {
        if (!msg.reactions[emoji]) {
          msg.reactions[emoji] = [];
        }
        if (!msg.reactions[emoji].includes(userId)) {
          msg.reactions[emoji].push(userId);
        }
        writeMessages(messages);
      }
    }
  } else {
    const msgs = secureMessages.get(roomId);
    if (msgs) {
      const msg = msgs.find(m => m.id === messageId);
      if (msg) {
        if (!msg.reactions[emoji]) {
          msg.reactions[emoji] = [];
        }
        if (!msg.reactions[emoji].includes(userId)) {
          msg.reactions[emoji].push(userId);
        }
      }
    }
  }
};

export const togglePinMessage = (roomId, messageId, mode = 'normal') => {
  if (mode === 'normal') {
    const messages = readMessages();
    if (messages[roomId]) {
      const msg = messages[roomId].find(m => m.id === messageId);
      if (msg) {
        msg.pinned = !msg.pinned;
        writeMessages(messages);
      }
    }
  }
};

export const markMessageAsRead = (roomId, messageId, userId, mode = 'normal') => {
  if (mode === 'normal') {
    const messages = readMessages();
    if (messages[roomId]) {
      const msg = messages[roomId].find(m => m.id === messageId);
      if (msg) {
        if (!msg.readBy) msg.readBy = [];
        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
          msg.readAt = new Date().toISOString();
        }
        writeMessages(messages);
      }
    }
  } else {
    const msgs = secureMessages.get(roomId);
    if (msgs) {
      const msg = msgs.find(m => m.id === messageId);
      if (msg) {
        if (!msg.readBy) msg.readBy = [];
        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
          msg.readAt = new Date().toISOString();
        }
      }
    }
  }
};

// Delete all messages from rooms created by a specific user (for secure mode session cleanup)
export const deleteMessagesForUser = (userId, mode = 'secure') => {
  if (mode === 'secure') {
    const rooms = Array.from(secureRooms.values());
    const userRooms = rooms.filter(room => room.createdBy === userId);
    
    userRooms.forEach(room => {
      secureMessages.delete(room.id);
      console.log(`Deleted all messages from secure room: ${room.name} (${room.id})`);
    });
    
    return userRooms.length;
  }
  return 0;
};
