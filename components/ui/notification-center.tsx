'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, CheckCircle, Info, Check, RefreshCw, X, BookOpen, Code, Wrench, GraduationCap, FileText, Clock, Users, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'quiz' | 'test' | 'workshop' | 'course' | 'assignment' | 'submission' | 'mentor_talk' | 'general' | 'urgent' | 'info' | 'success' | 'warning' | '';
  timestamp: Date | string;
  read: boolean;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/student/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to basic notifications
      const fallbackNotifications = [
        {
          id: 'fallback-1',
          title: 'Welcome to NexusPath!',
          message: 'Start your learning journey with our interactive quizzes',
          type: 'info' as const,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          actionUrl: '//daily-quiz'
        },
        {
          id: 'fallback-2',
          title: 'Explore Your Dashboard',
          message: 'Check out your progress and analytics in the dashboard',
          type: 'info' as const,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          actionUrl: '//analytics'
        }
      ];
      setNotifications(fallbackNotifications);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'test':
        return <Code className="h-4 w-4 text-purple-600" />;
      case 'workshop':
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case 'course':
        return <GraduationCap className="h-4 w-4 text-green-600" />;
      case 'assignment':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'submission':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'mentor_talk':
        return <Users className="h-4 w-4 text-pink-600" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    // Priority-based colors override type-based colors
    if (priority === 'urgent') {
      return 'border-l-red-500 bg-red-50 ring-2 ring-red-200';
    }
    if (priority === 'high') {
      return 'border-l-orange-500 bg-orange-50 ring-1 ring-orange-200';
    }

    switch (type) {
      case 'quiz':
        return 'border-l-blue-500 bg-blue-50';
      case 'test':
        return 'border-l-purple-500 bg-purple-50';
      case 'workshop':
        return 'border-l-orange-500 bg-orange-50';
      case 'course':
        return 'border-l-green-500 bg-green-50';
      case 'assignment':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'submission':
        return 'border-l-red-500 bg-red-50';
      case 'mentor_talk':
        return 'border-l-pink-500 bg-pink-50';
      case 'urgent':
        return 'border-l-red-500 bg-red-50 ring-2 ring-red-200';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications => 
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications => 
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications => notifications.filter(notification => notification.id !== id));
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - timestampDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 p-0">
          <Card className="border-0 shadow-none">
            <div className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Notifications</div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchNotifications}
                  disabled={isRefreshing}
                  className="text-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
              <div className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </div>
            </div>
            
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-l-4 p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      } ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
