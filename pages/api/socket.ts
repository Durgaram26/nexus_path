import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '@/lib/auth';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket.server.io) {
    console.log('Socket.IO already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  const io = new SocketIOServer(res.socket.server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async (data: { token: string }) => {
      try {
        const payload = verifyToken(data.token);
        if (!payload) {
          socket.emit('auth_error', { message: 'Invalid token' });
          return;
        }

        const user = {
          id: socket.id,
          role: (payload as any).role,
          userId: parseInt((payload as any).userId),
          socketId: socket.id
        };

        connectedUsers.set(socket.id, user);
        
        // Join user to their role-based room
        socket.join(user.role);
        
        // Join user to their specific user room for direct messages
        socket.join(`user_${user.userId}`);

        socket.emit('authenticated', { 
          userId: user.userId, 
          role: user.role 
        });

        console.log(`User authenticated: ${user.role} (${user.userId})`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle joining specific rooms
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { recipientId?: number; room?: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      if (data.recipientId) {
        socket.to(`user_${data.recipientId}`).emit('user_typing', {
          userId: user.userId,
          userName: user.id
        });
      } else if (data.room) {
        socket.to(data.room).emit('user_typing', {
          userId: user.userId,
          userName: user.id
        });
      }
    });

    socket.on('typing_stop', (data: { recipientId?: number; room?: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      if (data.recipientId) {
        socket.to(`user_${data.recipientId}`).emit('user_stopped_typing', {
          userId: user.userId
        });
      } else if (data.room) {
        socket.to(data.room).emit('user_stopped_typing', {
          userId: user.userId
        });
      }
    });

    // Handle sending messages
    socket.on('send_message', (messageData) => {
      console.log('Message received:', messageData);
      // This would typically save to database and then broadcast
      // For now, just echo back
      socket.emit('message_sent', { success: true, messageId: Date.now() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      connectedUsers.delete(socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;
