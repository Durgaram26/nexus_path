'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Clock, 
  User, 
  Reply, 
  Edit, 
  MoreHorizontal,
  Bell,
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface RealtimeMessageListProps {
  messages: Message[];
  currentUserId: number;
  onMarkAsRead: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  isLoading?: boolean;
}

export function RealtimeMessageList({
  messages,
  currentUserId,
  onMarkAsRead,
  onReply,
  onEdit,
  isLoading = false
}: RealtimeMessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2">Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Real-time Messages
            <Badge variant="secondary" className="ml-auto">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[600px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mb-4" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleMessageClick(message)}
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
                        <p className="text-gray-700 text-sm mt-1">{message.content}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.sentAt)}
                          </div>
                          {message.replies && message.replies.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Reply className="h-3 w-3" />
                              {message.replies.length} replies
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <div className="flex gap-1">
                            {onReply && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReply(message.id);
                                }}
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                            )}
                            {onEdit && message.senderId === currentUserId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(message.id);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {message.replies && message.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="mb-2 p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-sm font-medium">{reply.senderName}</span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(reply.sentAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

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
                  {formatTime(selectedMessage.sentAt)}
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
                            {formatTime(reply.sentAt)}
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
    </div>
  );
}
