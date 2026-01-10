import 'server-only';

import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';

export interface SocketUser {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  userId: number;
  socketId: string;
}

export interface MessageData {
  id: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  subject: string;
  content: string;
  messageType: string;
  priority: string;
  isBroadcast: boolean;
  sentAt: string;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();

  initialize(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const payload = verifyToken(data.token);
          if (!payload) {
            socket.emit('auth_error', { message: 'Invalid token' });
            return;
          }

          const user: SocketUser = {
            id: socket.id,
            role: (payload as any).role,
            userId: parseInt((payload as any).userId),
            socketId: socket.id
          };

          this.connectedUsers.set(socket.id, user);
          
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

      // Handle joining specific rooms (for department-based messaging)
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
        const user = this.connectedUsers.get(socket.id);
        if (!user) return;

        if (data.recipientId) {
          socket.to(`user_${data.recipientId}`).emit('user_typing', {
            userId: user.userId,
            userName: user.id // You might want to store actual name
          });
        } else if (data.room) {
          socket.to(data.room).emit('user_typing', {
            userId: user.userId,
            userName: user.id
          });
        }
      });

      socket.on('typing_stop', (data: { recipientId?: number; room?: string }) => {
        const user = this.connectedUsers.get(socket.id);
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

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.connectedUsers.delete(socket.id);
      });
    });
  }

  // Send message to specific users
  sendMessageToUsers(messageData: MessageData, recipientIds: number[]) {
    if (!this.io) return;

    recipientIds.forEach(recipientId => {
      this.io!.to(`user_${recipientId}`).emit('new_message', messageData);
    });
  }

  // Send broadcast message to all users of a specific role
  sendBroadcastMessage(messageData: MessageData, role: 'student' | 'faculty' | 'admin') {
    if (!this.io) return;

    this.io.to(role).emit('new_message', messageData);
  }

  // Send message to a specific room
  sendMessageToRoom(messageData: MessageData, room: string) {
    if (!this.io) return;

    this.io.to(room).emit('new_message', messageData);
  }

  // Send notification to user
  sendNotification(userId: number, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  // Get connected users
  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.userId === userId);
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Next.js API route handler for Socket.IO
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any)?.server.io) {
    console.log('Socket.IO already running');
  } else {
    console.log('Initializing Socket.IO');
    socketManager.initialize((res.socket as any).server);
    (res.socket as any).server.io = socketManager;
  }
  res.end();
}
