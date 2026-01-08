import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, ensureFacultyRecord } from '@/lib/auth';
import prisma from '@/lib/prisma';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/faculty/send-message - Starting request');
    
    const payload = getAuthPayload(request);
    if (!payload) {
      console.log('POST /api/faculty/send-message - Unauthorized');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { subject, content, messageType, priority, isBroadcast, recipientIds } = await request.json();
    
    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json({ message: 'Subject and content are required' }, { status: 400 });
    }

    if (!isBroadcast && (!recipientIds || recipientIds.length === 0)) {
      return NextResponse.json({ message: 'Please select at least one recipient or choose broadcast' }, { status: 400 });
    }
    
    console.log('POST /api/faculty/send-message - Message data:', {
      subject,
      messageType,
      priority,
      isBroadcast,
      recipientCount: recipientIds?.length || 0
    });

    // Get faculty info
    const facultyEmail = (payload as any).email;
    let faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail },
      select: { id: true, name: true, email: true }
    });

    if (!faculty) {
      // Try to create a Faculty record automatically
      try {
        await ensureFacultyRecord(facultyEmail, parseInt((payload as any).userId));
        // Re-fetch faculty
        faculty = await prisma.faculty.findUnique({
          where: { email: facultyEmail },
          select: { id: true, name: true, email: true }
        });
        
        if (!faculty) {
          throw new Error('Failed to create faculty record');
        }
      } catch (error) {
        console.log(`Failed to create Faculty record for email: ${facultyEmail}`);
        return NextResponse.json({ 
          message: 'Faculty record not found. Please contact administrator to set up your faculty profile.',
          email: facultyEmail 
        }, { status: 404 });
      }
    }

    // Store message in database
    const message = await prisma.message.create({
      data: {
        senderId: faculty.id,
        recipientIds: isBroadcast ? [] : recipientIds,
        subject,
        content,
        messageType,
        priority,
        isBroadcast,
        isRead: false
      }
    });

    console.log('POST /api/faculty/send-message - Message created:', message);

    // Simulate sending to students
    const studentsToNotify = isBroadcast 
      ? 'all students' 
      : `${recipientIds?.length || 0} selected students`;

    return NextResponse.json({
      message: 'Message sent successfully',
      messageId: message.id.toString(),
      sentTo: studentsToNotify,
      timestamp: message.sentAt.toISOString()
    });

  } catch (error) {
    console.error('POST /api/faculty/send-message error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}