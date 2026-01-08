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

// POST - Create daily test reminder notification
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    const { testTitle, testId } = await request.json();

    if (!testTitle || !testId) {
      return NextResponse.json({ 
        message: 'Test title and test ID are required' 
      }, { status: 400 });
    }

    // Create daily test reminder notification
    const notification = await NotificationService.createDailyTestReminder(
      studentId,
      testTitle,
      testId
    );

    return NextResponse.json({ 
      message: 'Daily test reminder created successfully',
      notification 
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/student/notifications/daily-test-reminder error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
