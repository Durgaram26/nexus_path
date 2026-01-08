'use client';

import React, { useState, useEffect } from 'react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { RealtimeNotificationCenter } from '@/components/realtime/RealtimeNotificationCenter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Bell, 
  AlertCircle, 
  Info, 
  FileText,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  MessageCircle,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderName: string;
  subject: string;
  content: string;
  messageType: string;
  priority: string;
  sentAt: string;
  isRead: boolean;
  isBroadcast: boolean;
  replies?: Message[];
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
}

interface EnhancedMessageInboxProps {
  studentId: number;
  token: string;
}

export function EnhancedMessageInbox({ studentId, token }: EnhancedMessageInboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  // Real-time messaging hook
  const {
    isConnected,
    sendMessage,
    markAsRead,
    fetchMessages,
    startTyping,
    stopTyping
  } = useRealtimeMessaging({
    userId: studentId,
    token,
    onNewMessage: (message) => {
      console.log('New real-time message:', message);
      setMessages(prev => [message, ...prev]);
      
      // Add notification
      const notification: Notification = {
        id: `msg_${message.id}`,
        type: 'new_message',
        title: `New message from ${message.senderName}`,
        message: message.subject,
        timestamp: message.sentAt,
        isRead: false,
        data: { messageId: message.id }
      };
      setNotifications(prev => [notification, ...prev]);
    },
    onNotification: (notification) => {
      console.log('Real-time notification:', notification);
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: new Date().toISOString(),
        isRead: false,
        data: notification.data
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  });

  // Fetch messages on component mount
  useEffect(() => {
    loadMessages();
  }, [fetchMessages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMessages();
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on search and filters
  useEffect(() => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(message => message.messageType === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(message => message.priority === filterPriority);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterType, filterPriority]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'reminder':
        return <AlertCircle className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;
  const unreadNotifications = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Enhanced Message Inbox</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Real-time Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">
            Messages ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="realtime">
            Real-time Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="reminder">Reminders</SelectItem>
                    <SelectItem value="assignment">Assignments</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMessages}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
                <Badge variant="secondary">
                  {filteredMessages.length} messages
                </Badge>
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mb-4" />
                  <p>No messages found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <Card
                      key={message.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{message.senderName}</span>
                            {message.isBroadcast && (
                              <Badge variant="outline" className="text-xs">
                                Broadcast
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-500">
                              {getMessageTypeIcon(message.messageType)}
                              <span className="text-xs">{message.messageType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-2">
                          <h4 className="font-medium text-gray-900">{message.subject}</h4>
                          <p className="text-gray-700 text-sm mt-1 line-clamp-2">{message.content}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                            </div>
                            {message.replies && message.replies.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {message.replies.length} replies
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessage(message);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
                <p className="text-gray-600 mb-4">
                  Access the full real-time messaging interface with live chat, typing indicators, and instant notifications.
                </p>
                <Button
                  onClick={() => window.location.href = '/realtime-messaging'}
                  className="w-full"
                >
                  Open Real-time Messaging
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getMessageTypeIcon(selectedMessage.messageType)}
                {selectedMessage.subject}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMessage(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{selectedMessage.senderName}</span>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(selectedMessage.sentAt), { addSuffix: true })}
                </span>
              </div>
              
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Replies ({selectedMessage.replies.length})</h4>
                  <div className="space-y-2">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{reply.senderName}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.sentAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Center */}
      <RealtimeNotificationCenter
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearAllNotifications}
        isOpen={showNotifications}
        onToggle={() => setShowNotifications(!showNotifications)}
      />
    </div>
  );
}
