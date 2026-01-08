'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Users, AlertCircle, FileText, Bell, Info } from 'lucide-react';
import { toast } from 'sonner';

interface RealtimeMessageComposerProps {
  onMessageSent?: () => void;
  recipientIds?: number[];
  roomId?: string;
  replyToId?: number;
  isBroadcast?: boolean;
  onSendMessage: (messageData: any) => Promise<void>;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

export function RealtimeMessageComposer({
  onMessageSent,
  recipientIds = [],
  roomId,
  replyToId,
  isBroadcast = false,
  onSendMessage,
  onStartTyping,
  onStopTyping
}: RealtimeMessageComposerProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messageTypes = [
    { value: 'general', label: 'General', icon: Info },
    { value: 'announcement', label: 'Announcement', icon: Bell },
    { value: 'reminder', label: 'Reminder', icon: AlertCircle },
    { value: 'assignment', label: 'Assignment', icon: FileText }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping?.();
    }
    
    // Clear typing indicator after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.();
      }
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please fill in both subject and content');
      return;
    }

    if (!isBroadcast && recipientIds.length === 0) {
      toast.error('Please select at least one recipient or choose broadcast message');
      return;
    }

    setIsLoading(true);

    try {
      const messageData = {
        subject: subject.trim(),
        content: content.trim(),
        messageType,
        priority,
        isBroadcast,
        recipientIds: isBroadcast ? [] : recipientIds,
        roomId,
        replyToId
      };

      await onSendMessage(messageData);
      
      toast.success(
        isBroadcast 
          ? 'Broadcast message sent to all students' 
          : `Message sent to ${recipientIds.length} recipient(s)`
      );

      // Reset form
      setSubject('');
      setContent('');
      setMessageType('general');
      setPriority('normal');

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.();
      }

      onMessageSent?.();

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const selectedMessageType = messageTypes.find(type => type.value === messageType);
  const selectedPriority = priorities.find(priority => priority.value === priority);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Real-time Message
          {isBroadcast && (
            <Badge variant="secondary" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              Broadcast
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your message here... (Ctrl+Enter to send)"
            className="min-h-[120px]"
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press Ctrl+Enter to send</span>
            {isTyping && (
              <span className="text-blue-500">Typing...</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color.split(' ')[0]}`} />
                      {priority.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !subject.trim() || !content.trim()}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </div>
              )}
            </Button>
          </div>
        </div>

        {selectedMessageType && selectedPriority && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Message type:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {(() => {
                const IconComponent = selectedMessageType.icon;
                return <IconComponent className="h-3 w-3" />;
              })()}
              {selectedMessageType.label}
            </Badge>
            <span className="text-gray-500">Priority:</span>
            <Badge className={selectedPriority.color}>
              {selectedPriority.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
