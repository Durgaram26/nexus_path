import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../../lib/notification-service';
import { verifyToken } from '../../../../../lib/auth';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// POST - Create workshop assignment notification
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    const { workshopTitle, workshopId, dueDate } = await request.json();

    if (!workshopTitle || !workshopId) {
      return NextResponse.json({ 
        message: 'Workshop title and workshop ID are required' 
      }, { status: 400 });
    }

    // Create workshop assignment notification
    const notification = await NotificationService.createWorkshopAssignmentNotification(
      studentId,
      workshopTitle,
      workshopId,
      dueDate ? new Date(dueDate) : undefined
    );

    return NextResponse.json({ 
      message: 'Workshop assignment notification created successfully',
      notification 
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/student/notifications/workshop-assignment error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
