# Real-time Messaging System

## Overview

The NexusPath prototype now includes a comprehensive real-time messaging system built with Socket.IO, providing instant communication between faculty and students with live updates, typing indicators, and push notifications.

## Features

### ✅ Core Features
- **Real-time messaging** with Socket.IO WebSocket connections
- **Live typing indicators** showing when users are typing
- **Instant notifications** for new messages
- **Message threading** with reply functionality
- **Room-based messaging** for group conversations
- **Message status tracking** (read/unread)
- **Priority-based messaging** (low, normal, high, urgent)
- **Message types** (general, announcement, reminder, assignment)
- **Broadcast messaging** to all students
- **Connection status indicators**

### ✅ Database Schema
- Enhanced `Message` model with real-time fields
- `MessageRead` tracking for read receipts
- `MessageRoom` for group conversations
- `MessageRoomMember` for room membership

### ✅ API Endpoints
- `/api/realtime/send-message` - Send real-time messages
- `/api/realtime/messages` - Get messages with real-time support
- `/api/realtime/rooms` - Manage messaging rooms
- `/api/realtime/typing` - Handle typing indicators

### ✅ Frontend Components
- `RealtimeMessageComposer` - Enhanced message composer
- `RealtimeMessageList` - Live message display
- `RealtimeNotificationCenter` - Notification management
- `EnhancedMessageInbox` - Upgraded inbox with real-time features

## Getting Started

### 1. Environment Setup

Ensure your `.env` file includes:
```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Migration

The database schema has been updated with new tables:
- `MessageRead` - Tracks message read status
- `MessageRoom` - Group messaging rooms
- `MessageRoomMember` - Room membership

### 3. Socket.IO Server

The Socket.IO server is configured at `/pages/api/socket.ts` and handles:
- User authentication
- Room management
- Typing indicators
- Message broadcasting

## Usage

### For Students

1. **Access Real-time Messaging**
   - Navigate to `/realtime-messaging`
   - Or use the enhanced message inbox

2. **Send Messages**
   - Use the message composer
   - Select recipients or use broadcast
   - Choose message type and priority

3. **Receive Notifications**
   - Get instant notifications for new messages
   - See typing indicators from other users
   - View connection status

### For Faculty

1. **Create Rooms**
   - Set up group messaging rooms
   - Add students to rooms
   - Manage room permissions

2. **Send Broadcast Messages**
   - Send announcements to all students
   - Use priority levels for urgent messages
   - Track message delivery

## API Reference

### Send Message
```typescript
POST /api/realtime/send-message
{
  "recipientIds": [1, 2, 3],
  "subject": "Message Subject",
  "content": "Message content",
  "messageType": "general",
  "priority": "normal",
  "isBroadcast": false,
  "roomId": "room_123",
  "replyToId": 456
}
```

### Get Messages
```typescript
GET /api/realtime/messages?roomId=room_123&limit=50&offset=0
```

### Mark as Read
```typescript
PATCH /api/realtime/messages
{
  "messageId": "123"
}
```

## Socket.IO Events

### Client to Server
- `authenticate` - Authenticate user
- `join_room` - Join a messaging room
- `leave_room` - Leave a room
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `send_message` - Send a message

### Server to Client
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `new_message` - New message received
- `notification` - Push notification
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing

## Components Usage

### RealtimeMessageComposer
```tsx
<RealtimeMessageComposer
  onSendMessage={handleSendMessage}
  onStartTyping={handleStartTyping}
  onStopTyping={handleStopTyping}
  roomId="room_123"
  isBroadcast={false}
/>
```

### RealtimeMessageList
```tsx
<RealtimeMessageList
  messages={messages}
  currentUserId={userId}
  onMarkAsRead={handleMarkAsRead}
  onReply={handleReply}
  onEdit={handleEdit}
/>
```

### useRealtimeMessaging Hook
```tsx
const {
  isConnected,
  messages,
  sendMessage,
  markAsRead,
  fetchMessages,
  joinRoom,
  leaveRoom,
  startTyping,
  stopTyping
} = useRealtimeMessaging({
  userId,
  token,
  onNewMessage: handleNewMessage,
  onNotification: handleNotification
});
```

## Configuration

### Socket.IO Server
The server is configured with CORS support and authentication:
```typescript
const io = new SocketIOServer(res.socket.server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```

### Client Connection
```typescript
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  auth: { token },
  transports: ['websocket', 'polling']
});
```

## Security

- **Authentication Required**: All Socket.IO connections require valid JWT tokens
- **Role-based Access**: Users can only access messages they're authorized to see
- **Room Permissions**: Room membership is enforced server-side
- **Message Validation**: All messages are validated before sending

## Performance

- **Connection Pooling**: Efficient Socket.IO connection management
- **Message Pagination**: Large message lists are paginated
- **Typing Debouncing**: Typing indicators are debounced to prevent spam
- **Auto-reconnection**: Client automatically reconnects on connection loss

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if Socket.IO server is running
   - Verify environment variables
   - Check CORS configuration

2. **Messages Not Received**
   - Verify user authentication
   - Check room membership
   - Ensure proper event listeners

3. **Typing Indicators Not Working**
   - Check typing event handlers
   - Verify debouncing logic
   - Check Socket.IO connection

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=socket.io:*
```

## Future Enhancements

- [ ] Message encryption
- [ ] File sharing in messages
- [ ] Message reactions/emojis
- [ ] Message search functionality
- [ ] Message archiving
- [ ] Advanced notification preferences
- [ ] Message scheduling
- [ ] Voice/video call integration

## Support

For issues or questions about the real-time messaging system:
1. Check the console for Socket.IO connection logs
2. Verify database schema is up to date
3. Ensure all dependencies are installed
4. Check environment variable configuration

The system is designed to be robust and handle connection drops gracefully with automatic reconnection and message queuing.
