import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { NotificationService } from '@/lib/notification-service';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get notifications for student
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;

    // Get notifications using the notification service
    let notifications: any[] = [];
    let unreadCount = 0;
    
    try {
      notifications = await NotificationService.getStudentNotifications(studentId, 50);
      unreadCount = await NotificationService.getUnreadCount(studentId);
    } catch (dbError) {
      console.log('Notification service error, using fallback data');
      notifications = [];
      unreadCount = 0;
    }

    return NextResponse.json({ 
      notifications, 
      unreadCount 
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/notifications error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { notificationId, markAll } = await request.json();
    const studentId = (payload as any).userId;

    let result;
    try {
      if (markAll) {
        // Mark all notifications as read
        result = await NotificationService.markAllAsRead(studentId);
        return NextResponse.json({ 
          message: 'All notifications marked as read',
          count: result.count 
        }, { status: 200 });
      } else {
        // Mark specific notification as read
        if (!notificationId) {
          return NextResponse.json({ message: 'Notification ID is required' }, { status: 400 });
        }
        
        result = await NotificationService.markAsRead(parseInt(notificationId), studentId);
        return NextResponse.json(result, { status: 200 });
      }
    } catch (dbError) {
      console.log('Notification service error:', dbError);
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('PUT /api/student/notifications error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}