import { useEffect, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket-client';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  recipientIds: number[];
  subject: string;
  content: string;
  messageType: string;
  priority: string;
  isBroadcast: boolean;
  roomId?: string;
  replyToId?: number;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
  replies?: Message[];
}

interface Notification {
  type: string;
  title: string;
  message: string;
  data?: any;
}

interface UseRealtimeMessagingProps {
  userId: number;
  token: string;
  onNewMessage?: (message: Message) => void;
  onNotification?: (notification: Notification) => void;
}

export function useRealtimeMessaging({
  userId,
  token,
  onNewMessage,
  onNotification
}: UseRealtimeMessagingProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isTyping, setIsTyping] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socket = socketClient.connect(token);

    // Connection status
    const updateConnectionStatus = () => {
      const status = socketClient.getConnectionStatus();
      setIsConnected(status.isConnected);
    };

    socket.on('connect', updateConnectionStatus);
    socket.on('disconnect', updateConnectionStatus);

    // Message handlers
    socketClient.onNewMessage((message: Message) => {
      setMessages(prev => [message, ...prev]);
      onNewMessage?.(message);
      
      // Show toast notification
      toast.info(`New message from ${message.senderName}`, {
        description: message.subject,
        action: {
          label: 'View',
          onClick: () => {
            // Handle view message action
            console.log('View message:', message.id);
          }
        }
      });
    });

    socketClient.onNotification((notification: Notification) => {
      onNotification?.(notification);
      
      // Show toast notification
      toast.info(notification.title, {
        description: notification.message
      });
    });

    socketClient.onUserTyping((data: { userId: number; userName: string }) => {
      setTypingUsers(prev => new Set([...prev, data.userId]));
    });

    socketClient.onUserStoppedTyping((data: { userId: number }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      socketClient.removeAllListeners();
    };
  }, [token, onNewMessage, onNotification]);

  // Send message
  const sendMessage = useCallback(async (messageData: {
    recipientIds?: number[];
    subject: string;
    content: string;
    messageType?: string;
    priority?: string;
    isBroadcast?: boolean;
    roomId?: string;
    replyToId?: number;
  }) => {
    try {
      const response = await api.post('/api/realtime/send-message', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await api.patch('/api/realtime/messages', { messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Get messages
  const fetchMessages = useCallback(async (roomId?: string, limit = 50, offset = 0) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (roomId) {
        params.append('roomId', roomId);
      }

      const response = await api.get(`/api/realtime/messages?${params}`);
      setMessages(response.data.messages);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }, []);

  // Get rooms
  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get('/api/realtime/rooms');
      return response.data.rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }, []);

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    socketClient.joinRoom(roomId);
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    socketClient.leaveRoom(roomId);
  }, []);

  // Typing indicators
  const startTyping = useCallback((recipientId?: number, room?: string) => {
    if (!isTyping) {
      setIsTyping(true);
      socketClient.startTyping(recipientId, room);
    }
  }, [isTyping]);

  const stopTyping = useCallback((recipientId?: number, room?: string) => {
    if (isTyping) {
      setIsTyping(false);
      socketClient.stopTyping(recipientId, room);
    }
  }, [isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketClient.disconnect();
    };
  }, []);

  return {
    isConnected,
    messages,
    typingUsers,
    isTyping,
    sendMessage,
    markAsRead,
    fetchMessages,
    fetchRooms,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping
  };
}
