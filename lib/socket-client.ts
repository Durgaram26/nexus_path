import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
    });

    return this.socket;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message events
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    this.socket?.on('user_stopped_typing', callback);
  }

  // Room management
  joinRoom(room: string) {
    this.socket?.emit('join_room', room);
  }

  leaveRoom(room: string) {
    this.socket?.emit('leave_room', room);
  }

  // Typing indicators
  startTyping(recipientId?: number, room?: string) {
    this.socket?.emit('typing_start', { recipientId, room });
  }

  stopTyping(recipientId?: number, room?: string) {
    this.socket?.emit('typing_stop', { recipientId, room });
  }

  // Send message
  sendMessage(messageData: any) {
    this.socket?.emit('send_message', messageData);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id
    };
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

// Singleton instance
export const socketClient = new SocketClient();
