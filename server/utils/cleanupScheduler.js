import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readRooms, writeRooms, readMessages, writeMessages } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads');

/**
 * Delete files associated with a room
 */
const deleteRoomFiles = (roomId, messages) => {
  let deletedCount = 0;
  
  // Get all messages for this room
  const roomMessages = messages[roomId] || [];
  
  // Find all file URLs in messages
  roomMessages.forEach(message => {
    if (message.fileUrl && (message.type === 'image' || message.type === 'video' || message.type === 'document' || message.type === 'file')) {
      try {
        // Extract file path from URL (e.g., /uploads/abc.jpg -> uploads/abc.jpg)
        const filePath = path.join(__dirname, '..', message.fileUrl);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`[Cleanup] Deleted file: ${message.fileUrl}`);
        }
      } catch (error) {
        console.error(`[Cleanup] Error deleting file ${message.fileUrl}:`, error);
      }
    }
  });
  
  return deletedCount;
};

/**
 * Delete expired messages from a room
 */
const deleteExpiredMessages = (roomId, room, messages) => {
  if (!room.messageExpiry || room.messageExpiry === 0) {
    return 0; // No expiry set or set to "never"
  }
  
  const roomMessages = messages[roomId] || [];
  const expiryTime = room.messageExpiry * 60 * 60 * 1000; // Convert hours to milliseconds
  const now = Date.now();
  let deletedCount = 0;
  let deletedFiles = 0;
  
  // Filter out expired messages
  const validMessages = roomMessages.filter(message => {
    const messageTime = new Date(message.timestamp).getTime();
    const isExpired = (now - messageTime) > expiryTime;
    
    if (isExpired) {
      // Delete associated file if exists
      if (message.fileUrl && (message.type === 'image' || message.type === 'video' || message.type === 'document' || message.type === 'file')) {
        try {
          const filePath = path.join(__dirname, '..', message.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            deletedFiles++;
            console.log(`[Cleanup] Deleted expired file: ${message.fileUrl}`);
          }
        } catch (error) {
          console.error(`[Cleanup] Error deleting expired file:`, error);
        }
      }
      deletedCount++;
    }
    
    return !isExpired;
  });
  
  if (deletedCount > 0) {
    messages[roomId] = validMessages;
    console.log(`[Cleanup] Deleted ${deletedCount} expired messages (${deletedFiles} files) from room ${room.name}`);
  }
  
  return deletedCount;
};

/**
 * Clean up expired rooms and their data
 */
export const cleanupExpiredRooms = (io = null) => {
  console.log('[Cleanup] Starting cleanup check...');
  
  const rooms = readRooms();
  const messages = readMessages();
  const now = new Date();
  
  let expiredRooms = 0;
  let deletedMessages = 0;
  let deletedFiles = 0;
  
  // Filter out expired rooms and delete their data
  const activeRooms = rooms.filter(room => {
    // Check if room has expired
    if (room.expiresAt && new Date(room.expiresAt) < now) {
      console.log(`[Cleanup] 🗑️ Room expired: ${room.name} (ID: ${room.id}) - expired at ${room.expiresAt}`);
      console.log(`[Cleanup] 🧹 Deleting all data for room: ${room.name}`);
      
      // Notify all clients that the room has expired and kick them out
      if (io) {
        // First notify all users in the room that it has expired
        io.to(room.id).emit('room:expired', { roomId: room.id, roomName: room.name });
        
        // Then notify all clients to remove the room from their lists
        io.emit('room:removed', { roomId: room.id, roomName: room.name });
        
        // Force all users to leave the room
        io.in(room.id).socketsLeave(room.id);
        
        console.log(`[Cleanup] 📢 Notified all clients about expired room: ${room.name}`);
        console.log(`[Cleanup] 👥 Kicked all users out of expired room: ${room.name}`);
      } else {
        console.log(`[Cleanup] ⚠️ No socket.io instance available for notifications`);
      }
      
      // Delete all files associated with this room
      const filesDeleted = deleteRoomFiles(room.id, messages);
      deletedFiles += filesDeleted;
      
      // Delete all messages for this room
      const messageCount = messages[room.id]?.length || 0;
      delete messages[room.id];
      deletedMessages += messageCount;
      
      expiredRooms++;
      return false; // Remove room
    }
    
    // Room is still active, check for expired messages
    const expiredMsgCount = deleteExpiredMessages(room.id, room, messages);
    deletedMessages += expiredMsgCount;
    
    return true; // Keep room
  });
  
  // Save updated data if anything changed
  if (expiredRooms > 0 || deletedMessages > 0) {
    writeRooms(activeRooms);
    writeMessages(messages);
    
    console.log(`[Cleanup] Summary:`);
    console.log(`  - Expired rooms deleted: ${expiredRooms}`);
    console.log(`  - Messages deleted: ${deletedMessages}`);
    console.log(`  - Files deleted: ${deletedFiles}`);
  } else {
    console.log('[Cleanup] No expired data found');
  }
};

/**
 * Start the cleanup scheduler
 * Runs every 1 minute for faster room expiry detection
 */
export const startCleanupScheduler = (io = null) => {
  console.log('[Cleanup] Starting cleanup scheduler (runs every 1 minute)');
  
  // Run immediately on startup
  cleanupExpiredRooms(io);
  
  // Then run every 1 minute for faster expiry detection
  setInterval(() => {
    cleanupExpiredRooms(io);
  }, 1 * 60 * 1000); // 1 minute
};

/**
 * Manually trigger cleanup (for testing)
 */
export const triggerCleanup = () => {
  console.log('[Cleanup] Manual cleanup triggered');
  cleanupExpiredRooms();
};
