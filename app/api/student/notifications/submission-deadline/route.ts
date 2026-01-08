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

// POST - Create submission deadline notification
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    const { submissionType, itemTitle, dueDate, itemId } = await request.json();

    if (!submissionType || !itemTitle || !dueDate || !itemId) {
      return NextResponse.json({ 
        message: 'Submission type, item title, due date, and item ID are required' 
      }, { status: 400 });
    }

    // Validate submission type
    const validSubmissionTypes = ['assignment', 'certificate', 'project'];
    if (!validSubmissionTypes.includes(submissionType)) {
      return NextResponse.json({ 
        message: 'Invalid submission type. Must be one of: assignment, certificate, project' 
      }, { status: 400 });
    }

    // Create submission deadline notification
    const notification = await NotificationService.createSubmissionDeadlineReminder(
      studentId,
      submissionType as 'assignment' | 'certificate' | 'project',
      itemTitle,
      new Date(dueDate),
      itemId
    );

    return NextResponse.json({ 
      message: 'Submission deadline notification created successfully',
      notification 
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/student/notifications/submission-deadline error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
