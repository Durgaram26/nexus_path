import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { socketManager } from '@/lib/socket';

function getAuthPayload(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyToken(token) : null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      recipientIds,
      subject,
      content,
      messageType = 'general',
      priority = 'normal',
      isBroadcast = false,
      roomId,
      replyToId,
      isRealtime = true
    } = await request.json();

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json({
        message: 'Subject and content are required'
      }, { status: 400 });
    }

    if (!isBroadcast && (!recipientIds || recipientIds.length === 0)) {
      return NextResponse.json({
        message: 'Recipients are required for non-broadcast messages'
      }, { status: 400 });
    }

    const userId = (payload as any).userId;
    const userRole = (payload as any).role;

    // Get sender information
    let sender;
    if (userRole === 'faculty') {
      sender = await prisma.faculty.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      });
    } else if (userRole === 'student') {
      sender = await prisma.student.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      });
    }

    if (!sender) {
      return NextResponse.json({
        message: 'Sender not found'
      }, { status: 404 });
    }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientIds: isBroadcast ? [] : recipientIds,
        subject: subject.trim(),
        content: content.trim(),
        messageType,
        priority,
        isBroadcast,
        isRealtime,
        roomId,
        replyToId,
        sentAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Prepare message data for real-time delivery
    const messageData = {
      id: message.id.toString(),
      senderId: message.senderId,
      senderName: sender.name,
      recipientIds: message.recipientIds,
      subject: message.subject,
      content: message.content,
      messageType: message.messageType,
      priority: message.priority,
      isBroadcast: message.isBroadcast,
      roomId: message.roomId,
      replyToId: message.replyToId,
      sentAt: message.sentAt.toISOString()
    };

    // Send real-time message
    if (isBroadcast) {
      // Send to all students
      socketManager.sendBroadcastMessage(messageData, 'student');
    } else if (roomId) {
      // Send to room
      socketManager.sendMessageToRoom(messageData, roomId);
    } else {
      // Send to specific recipients
      socketManager.sendMessageToUsers(messageData, recipientIds);
    }

    // Send notification to recipients
    const notification = {
      type: 'new_message',
      title: `New message from ${sender.name}`,
      message: subject,
      data: { messageId: message.id }
    };

    if (isBroadcast) {
      // Notify all students
      const students = await prisma.student.findMany({
        select: { id: true }
      });
      students.forEach((student: any) => {
        socketManager.sendNotification(parseInt(student.id), notification);
      });
    } else {
      // Notify specific recipients
      recipientIds.forEach((recipientId: string) => {
        socketManager.sendNotification(parseInt(recipientId), notification);
      });
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      messageId: message.id,
      timestamp: message.sentAt.toISOString()
    });

  } catch (error) {
    console.error('POST /api/realtime/send-message error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
