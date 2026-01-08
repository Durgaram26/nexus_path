import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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

// GET - Get messages for a student
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/student/messages - Starting request');
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload || (payload as any).role !== 'student') {
      console.log('Authentication failed - payload:', payload, 'role:', (payload as any)?.role);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    console.log('Student ID from params:', studentId);

    if (!studentId) {
      console.log('No student ID provided');
      return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
    }

    // Get student's messages
    console.log('Querying messages for studentId:', parseInt(studentId));
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { recipientIds: { has: parseInt(studentId) } },
          { isBroadcast: true }
        ]
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
    console.log('Found messages:', messages.length);

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id.toString(),
        senderName: msg.sender?.name || 'Unknown',
        subject: msg.subject,
        content: msg.content,
        messageType: msg.messageType,
        priority: msg.priority,
        sentAt: msg.sentAt.toISOString(),
        isRead: msg.isRead,
        isBroadcast: msg.isBroadcast
      }))
    });

  } catch (error) {
    console.error('GET /api/student/messages error:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}

// PATCH - Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ message: 'Message ID is required' }, { status: 400 });
    }

    await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { isRead: true }
    });

    return NextResponse.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('PATCH /api/student/messages error:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}