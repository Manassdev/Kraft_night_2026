const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'CoJourney Realtime Server' }));
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Redis client setup
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => {
  console.warn('[Redis] Warning:', err.message);
});

async function initRedis() {
  try {
    await redis.connect();
    console.log('[Redis] Connected to Redis server at 6379');
  } catch (err) {
    console.warn('[Redis] Could not connect to Redis, running in-memory fallback:', err.message);
  }
}

initRedis();

// Socket.io connection handling
io.on('connection', (socket) => {
  let currentUserId = null;
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User online event
  socket.on('userOnline', async ({ userId }) => {
    if (!userId) return;
    currentUserId = userId;
    socket.data.userId = userId;
    console.log(`[Socket] User online: ${userId} (${socket.id})`);

    try {
      if (redis.isOpen) {
        await redis.sAdd('online_users', userId);
      }
    } catch (e) {
      console.error('[Redis error]', e.message);
    }

    io.emit('userOnline', { userId });
  });

  // Join journey room
  socket.on('joinJourney', async ({ journeyId, userId }) => {
    if (!journeyId) return;
    const room = `journey:${journeyId}`;
    socket.join(room);
    console.log(`[Socket] User ${userId || socket.id} joined room ${room}`);

    // Send chat history if cached in Redis
    try {
      if (redis.isOpen) {
        const history = await redis.lRange(`journey_chat:${journeyId}`, -50, -1);
        if (history && history.length > 0) {
          const parsed = history.map((h) => JSON.parse(h));
          socket.emit('chatHistory', { journeyId, messages: parsed });
        }
      }
    } catch (e) {
      console.error('[Redis error]', e.message);
    }
  });

  // Send message
  socket.on('sendMessage', async ({ journeyId, userId, message, senderName }) => {
    if (!journeyId || !message) return;
    const room = `journey:${journeyId}`;

    const messageObj = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      journeyId,
      userId: userId || currentUserId || 'anonymous',
      senderName: senderName || 'User',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log(`[Socket] Message in ${room}:`, messageObj.message);

    // Cache in Redis
    try {
      if (redis.isOpen) {
        await redis.rPush(`journey_chat:${journeyId}`, JSON.stringify(messageObj));
        // Keep last 100 messages per journey
        await redis.lTrim(`journey_chat:${journeyId}`, -100, -1);
      }
    } catch (e) {
      console.error('[Redis error]', e.message);
    }

    // Broadcast to everyone in the room
    io.to(room).emit('newMessage', messageObj);
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (currentUserId) {
      try {
        if (redis.isOpen) {
          await redis.sRem('online_users', currentUserId);
        }
      } catch (e) {
        console.error('[Redis error]', e.message);
      }
      io.emit('userOffline', { userId: currentUserId });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CoJourney Server] Socket.IO & Redis server listening on http://0.0.0.0:${PORT}`);
});
