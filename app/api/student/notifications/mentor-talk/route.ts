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

// POST - Create mentor talk notification
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    const { mentorName, talkTitle, scheduledDate, talkId } = await request.json();

    if (!mentorName || !talkTitle || !scheduledDate || !talkId) {
      return NextResponse.json({ 
        message: 'Mentor name, talk title, scheduled date, and talk ID are required' 
      }, { status: 400 });
    }

    // Create mentor talk notification
    const notification = await NotificationService.createMentorTalkNotification(
      studentId,
      mentorName,
      talkTitle,
      new Date(scheduledDate),
      talkId
    );

    return NextResponse.json({ 
      message: 'Mentor talk notification created successfully',
      notification 
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/student/notifications/mentor-talk error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
