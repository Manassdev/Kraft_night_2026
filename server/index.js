const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const PORT = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled Rejection:', reason);
});

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

/**
 * Check if a user is authorized to access an active journey room.
 * Authorization: user must be the journey owner OR an accepted participant.
 * For non-active journeys (open/scheduled), any user may join for chat.
 *
 * We use Redis cache first, then fall back to permissive mode if unavailable.
 * @param {string} journeyId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function isAuthorizedForJourneyRoom(journeyId, userId) {
  if (!journeyId || !userId) return false;

  try {
    // Check Redis cache: journey_status:<journeyId>
    if (redis.isOpen) {
      const cachedStatus = await redis.get(`journey_status:${journeyId}`);

      // If cached as active, verify user is in authorized set
      if (cachedStatus === 'in_progress' || cachedStatus === 'active') {
        const isAuth = await redis.sIsMember(`journey_participants:${journeyId}`, userId);
        return isAuth;
      }

      // Not active — allow anyone (open/scheduled journeys support chat preview)
      return true;
    }
  } catch (e) {
    console.warn('[Auth] Redis check failed, defaulting to permissive:', e.message);
  }

  // Fallback: allow access (don't block if Redis is down)
  return true;
}

/**
 * When a journey becomes active, store its status and participant list in Redis.
 * Called via a server event emitted from the app when journey starts.
 */
async function cacheJourneyAuthorization(journeyId, ownerId, participantIds) {
  if (!redis.isOpen) return;
  try {
    const allAuthorized = [ownerId, ...participantIds].filter(Boolean);
    await redis.set(`journey_status:${journeyId}`, 'in_progress');
    // Store authorized user set
    if (allAuthorized.length > 0) {
      await redis.del(`journey_participants:${journeyId}`);
      await redis.sAdd(`journey_participants:${journeyId}`, allAuthorized);
      await redis.expire(`journey_participants:${journeyId}`, 86400); // 24h TTL
      await redis.expire(`journey_status:${journeyId}`, 86400);
    }
    console.log(`[Auth] Journey ${journeyId} marked active, authorized users: ${allAuthorized.join(', ')}`);
  } catch (e) {
    console.error('[Auth] Failed to cache journey authorization:', e.message);
  }
}

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

  // App notifies server when a journey starts (to cache authorization)
  socket.on('journeyStarted', async ({ journeyId, ownerId, participantIds }) => {
    console.log(`[Socket] Journey started: ${journeyId}, owner: ${ownerId}`);
    await cacheJourneyAuthorization(journeyId, ownerId, participantIds || []);
  });

  // Join journey room — with authorization check for active journeys
  socket.on('joinJourney', async ({ journeyId, userId }) => {
    if (!journeyId) return;
    const room = `journey:${journeyId}`;
    const uid = userId || currentUserId;

    // Authorization check
    const authorized = await isAuthorizedForJourneyRoom(journeyId, uid);
    if (!authorized) {
      console.warn(`[Socket] UNAUTHORIZED: User ${uid} blocked from room ${room}`);
      socket.emit('joinJourneyError', {
        journeyId,
        message: 'This journey is active and you are not a participant.',
      });
      return;
    }

    socket.join(room);
    console.log(`[Socket] User ${uid || socket.id} joined room ${room}`);

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
