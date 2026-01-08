'use client';

import React, { useState, useEffect } from 'react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { RealtimeMessageComposer } from '@/components/realtime/RealtimeMessageComposer';
import { RealtimeMessageList } from '@/components/realtime/RealtimeMessageList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Wifi, 
  WifiOff,
  Plus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: number;
  name: string;
  description?: string;
  roomType: string;
  memberCount: number;
  isMember: boolean;
}

export default function RealtimeMessagingPage() {
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<number>(0);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Initialize auth token and user ID
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(parseInt(storedUserId));
    } else {
      toast.error('Please log in to access real-time messaging');
      // Redirect to login or handle authentication
    }
  }, []);

  const {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    markAsRead,
    fetchMessages,
    fetchRooms,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping
  } = useRealtimeMessaging({
    userId,
    token,
    onNewMessage: (message) => {
      console.log('New message received:', message);
    },
    onNotification: (notification) => {
      console.log('Notification received:', notification);
    }
  });

  // Load rooms on component mount
  useEffect(() => {
    if (token) {
      loadRooms();
    }
  }, [token, fetchRooms]);

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      joinRoom(selectedRoom);
    } else {
      loadMessages();
    }
  }, [selectedRoom, fetchMessages, joinRoom]);

  const loadRooms = async () => {
    try {
      const roomsData = await fetchRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
    }
  };

  const loadMessages = async () => {
    try {
      await fetchMessages(selectedRoom || undefined);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (messageData: any) => {
    try {
      await sendMessage({
        ...messageData,
        roomId: selectedRoom || undefined
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleStartTyping = () => {
    if (selectedRoom) {
      startTyping(undefined, selectedRoom);
    }
  };

  const handleStopTyping = () => {
    if (selectedRoom) {
      stopTyping(undefined, selectedRoom);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !message.isRead;
    if (filterType === 'broadcast') return message.isBroadcast;
    return message.messageType === filterType;
  });

  const searchedMessages = filteredMessages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token || !userId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to access real-time messaging.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Real-time Messaging</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Rooms Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rooms & Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSelectedRoom('')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  General Chat
                </Button>
                
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={selectedRoom === room.id.toString() ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedRoom(room.id.toString())}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="truncate">{room.name}</span>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {room.memberCount}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="compose">Compose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="space-y-4">
              {/* Message Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search messages..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="broadcast">Broadcasts</SelectItem>
                        <SelectItem value="announcement">Announcements</SelectItem>
                        <SelectItem value="reminder">Reminders</SelectItem>
                        <SelectItem value="assignment">Assignments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Messages List */}
              <RealtimeMessageList
                messages={searchedMessages}
                currentUserId={userId}
                onMarkAsRead={handleMarkAsRead}
                onReply={(messageId) => {
                  console.log('Reply to message:', messageId);
                  // Handle reply functionality
                }}
                onEdit={(messageId) => {
                  console.log('Edit message:', messageId);
                  // Handle edit functionality
                }}
              />
            </TabsContent>
            
            <TabsContent value="compose">
              <RealtimeMessageComposer
                onSendMessage={handleSendMessage}
                onStartTyping={handleStartTyping}
                onStopTyping={handleStopTyping}
                roomId={selectedRoom}
                isBroadcast={!selectedRoom}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Typing Indicators */}
      {typingUsers.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>
              {Array.from(typingUsers).length} user{Array.from(typingUsers).length !== 1 ? 's' : ''} typing...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
