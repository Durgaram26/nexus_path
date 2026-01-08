import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'quiz' | 'test' | 'workshop' | 'course' | 'assignment' | 'submission' | 'mentor_talk' | 'general' | 'urgent' | 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export function useNotifications(studentId: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/student/notifications');
      const newNotifications = response.data.notifications || [];
      
      // Check for new notifications
      const previousCount = notifications.length;
      const newCount = newNotifications.length;
      
      if (newCount > previousCount && previousCount > 0) {
        // New notification arrived
        const newNotification = newNotifications[0];
        toast.info(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'View',
            onClick: () => {
              if (newNotification.actionUrl) {
                window.location.href = newNotification.actionUrl;
              }
            }
          }
        });
      }
      
      setNotifications(newNotifications);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30);
    return () => clearInterval(interval);
  }, [studentId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put('/student/notifications', {
        notificationId
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead
  };
}
