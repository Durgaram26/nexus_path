import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/faculty/sent-messages - Starting request');
    
    // Verify authentication
    const bearer = request.headers.get('authorization');
    const tokenFromHeader = bearer?.startsWith('Bearer ')
      ? bearer.substring('Bearer '.length)
      : undefined;
    const tokenFromCookie = request.cookies.get('access_token')?.value;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'faculty') {
      return NextResponse.json({ error: 'Unauthorized - Faculty access required' }, { status: 403 });
    }

    const facultyEmail = (decoded as any).email;
    console.log('Faculty email from token:', facultyEmail);

    // Get the Faculty record using the email from the token
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail },
      select: { id: true }
    });

    if (!faculty) {
      console.log('Faculty not found for email:', facultyEmail);
      return NextResponse.json({ error: 'Faculty record not found' }, { status: 404 });
    }

    const facultyId = faculty.id;
    console.log('Faculty ID:', facultyId);

    // Get faculty's sent messages
    const messages = await prisma.message.findMany({
      where: {
        senderId: facultyId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    console.log(`Found ${messages.length} sent messages for faculty ${facultyId}`);

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        content: msg.content,
        recipientIds: msg.recipientIds,
        isBroadcast: msg.isBroadcast,
        priority: msg.priority,
        messageType: msg.messageType,
        sentAt: msg.sentAt.toISOString(),
        isRead: msg.isRead,
        sender: msg.sender
      }))
    });

  } catch (error: any) {
    console.error('Error fetching sent messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sent messages',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
