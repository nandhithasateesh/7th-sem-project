import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/config.js';
import { apiLimiter, authLimiter, registerLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import { initializeDataFiles } from './utils/fileHandler.js';
import { initializeRoomFiles } from './utils/roomManager.js';
import { setupChatHandlers } from './socket/chatHandler.js';
import { startCleanupScheduler } from './utils/cleanupScheduler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Initialize data files
initializeDataFiles();
initializeRoomFiles();

// Routes
app.use('/api/auth/normal/register', registerLimiter);
app.use('/api/auth/normal/login', authLimiter);
app.use('/api/auth/secure/create-session', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StealthLAN server is running' });
});

// Setup Socket.io handlers
setupChatHandlers(io);

// Start cleanup scheduler for expired rooms and messages (after io is ready)
startCleanupScheduler(io);

httpServer.listen(config.PORT, '0.0.0.0', () => {
  console.log(`🚀 StealthLAN server running on http://localhost:${config.PORT}`);
  console.log(`📡 Accessible on LAN at http://0.0.0.0:${config.PORT}`);
  console.log(`💬 Socket.io ready for real-time chat`);
  console.log(`🔒 Environment: ${config.NODE_ENV}`);
  console.log(`🛡️  CORS allowed origins: ${Array.isArray(config.ALLOWED_ORIGINS) ? config.ALLOWED_ORIGINS.join(', ') : 'dynamic (localhost + LAN)'}`);
});
