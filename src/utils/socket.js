import { io } from 'socket.io-client';

// Use the current host's IP/domain, but connect to port 5000
// This allows the app to work on both localhost and LAN
const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:5000`;

let socket = null;
let messageQueue = [];
let isConnected = false;
let isUserJoined = false;

export const initializeSocket = (userId, username, mode) => {
  if (socket) {
    socket.disconnect();
  }

  console.log(`🔌 Connecting to socket server at: ${SOCKET_URL}`);

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    isConnected = true;
    isUserJoined = false;
    
    // Emit user:join and wait for callback confirmation
    socket.emit('user:join', { userId, username, mode }, (response) => {
      if (response && response.success) {
        console.log(`✅ User joined server with mode: ${response.mode}`);
        isUserJoined = true;
        
        // Send queued messages
        if (messageQueue.length > 0) {
          console.log(`📤 Sending ${messageQueue.length} queued messages`);
          messageQueue.forEach(({ event, data, callback }) => {
            socket.emit(event, data, callback);
          });
          messageQueue = [];
        }
      } else {
        console.error('❌ User join failed');
      }
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    isConnected = false;
    isUserJoined = false;
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Connection error:', error.message);
    isConnected = false;
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    isConnected = true;
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed after all attempts');
    isConnected = false;
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    isUserJoined = false;
    messageQueue = [];
  }
};

export const emitWithQueue = (event, data, callback) => {
  if (socket && isConnected && isUserJoined) {
    socket.emit(event, data, callback);
  } else {
    console.log(`📥 Queuing message: ${event} (connected: ${isConnected}, joined: ${isUserJoined})`);
    messageQueue.push({ event, data, callback });
  }
};

export const isUserJoinedToServer = () => isUserJoined;

export const getConnectionStatus = () => isConnected;
