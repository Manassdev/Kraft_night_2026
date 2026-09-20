import { io, Socket } from 'socket.io-client';
const SOCKET_URL = 'http://172.21.35.7:3000';

let socket: Socket | null = null;
let connectedUserId: string | null = null;

export interface SocketChatMessage {
  id?: string;
  journeyId: string;
  userId: string;
  message: string;
  timestamp?: string | number;
  senderName?: string;
}

export interface SocketChatHistory {
  journeyId: string;
  messages: SocketChatMessage[];
}

export const socketService = {
  connect(userId: string) {
    if (!userId) return;

    connectedUserId = userId;

    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: false,
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected:', socket?.id);
        if (connectedUserId) {
          socket?.emit('userOnline', {
            userId: connectedUserId,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });

      socket.on('connect_error', (error) => {
        console.log('Socket.IO connection error:', error.message);
      });
    }

    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect() {
    connectedUserId = null;
    if (socket) {
      socket.disconnect();
    }
  },

  joinJourney(journeyId: string, userId: string) {
    socket?.emit('joinJourney', {
      journeyId,
      userId,
    });
  },

  sendMessage(
    journeyId: string,
    userId: string,
    message: string,
    senderName?: string,
  ) {
    socket?.emit('sendMessage', {
      journeyId,
      userId,
      message,
      senderName,
    });
  },

  onMessage(callback: (message: SocketChatMessage) => void) {
    socket?.on('newMessage', callback);
  },

  onChatHistory(callback: (data: SocketChatHistory) => void) {
    socket?.on('chatHistory', callback);
  },

  onUserOnline(callback: (data: { userId: string }) => void) {
    socket?.on('userOnline', callback);
  },

  removeListeners() {
    socket?.off('newMessage');
    socket?.off('chatHistory');
    socket?.off('userOnline');
  },
};
