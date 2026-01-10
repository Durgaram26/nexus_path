'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Bell, FileText, Info, User, Search, RefreshCw, X, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

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
}

interface MessageInboxProps {
  studentId: number;
}

export function MessageInbox({ studentId }: MessageInboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple notification system - no Socket.IO needed

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await api.patch('/student/messages', { messageId });
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      setFilteredMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Update selected message if it's the same
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Fetch real messages from API
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching messages for studentId:', studentId);
      console.log('API URL:', `/student/messages?studentId=${studentId}`);
      
      const response = await api.get(`/student/messages?studentId=${studentId}`);
      console.log('API Response:', response.data);
      
      const newMessages = response.data.messages || [];
      console.log('Messages received:', newMessages.length);
      
      setMessages(newMessages);
      setFilteredMessages(newMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setMessages([]);
      setFilteredMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Show notification for unread messages on first load
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.isRead);
      if (unreadMessages.length > 0) {
        toast.info(`You have ${unreadMessages.length} unread message(s)`, {
          description: 'Click to view your messages',
          action: {
            label: 'View Messages',
            onClick: () => {
              // Scroll to messages section or focus on first unread
            }
          }
        });
      }
    }
  }, [messages]);

  // messages based on search and filters
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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'reminder':
        return <div className="h-4 w-4 text-orange-600" />;
      case 'assignment':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const selectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
    setFilteredMessages(prev => prev.filter(message => message.id !== messageId));
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Messages
          </h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Badge variant={unreadCount > 0 ? 'destructive' : 'secondary'}>
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mail className="h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No messages found</h3>
              <p className="text-gray-500 text-center text-lg mb-6">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any messages yet'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterPriority === 'all' && (
                <div className="max-w-sm mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📩 Messages from your faculty members will appear here once they send you any updates, announcements, or reminders.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => selectMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getMessageTypeIcon(message.messageType)}
                      <h3 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                        {message.subject}
                      </h3>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{message.senderName}</span>
                      <Badge className={getPriorityColor(message.priority)}>
                        {message.priority.toUpperCase()}
                      </Badge>
                      {message.isBroadcast && (
                        <Badge variant="outline">Broadcast</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(message.sentAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMessageTypeIcon(selectedMessage.messageType)}
                  <h3>{selectedMessage.subject}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedMessage.senderName}</span>
                <Badge className={getPriorityColor(selectedMessage.priority)}>
                  {selectedMessage.priority.toUpperCase()}
                </Badge>
                {selectedMessage.isBroadcast && (
                  <Badge variant="outline">Broadcast</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t">
                <Clock className="h-4 w-4" />
                <span>Sent {formatTimestamp(selectedMessage.sentAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
