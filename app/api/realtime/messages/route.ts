import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAuthPayload(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyToken(token) : null;
}

// GET - Get real-time messages for a user
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = (payload as any).userId;
    const userRole = (payload as any).role;
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {
      isRealtime: true
    };

    // Build where clause based on user role and room
    if (roomId) {
      whereClause.roomId = roomId;
    } else if (userRole === 'student') {
      whereClause.OR = [
        { recipientIds: { has: userId } },
        { isBroadcast: true }
      ];
    } else if (userRole === 'faculty') {
      whereClause.OR = [
        { senderId: userId },
        { roomId: { not: null } } // Faculty can see room messages
      ];
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        readBy: {
          where: { userId },
          select: {
            readAt: true
          }
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { sentAt: 'asc' }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset
    });

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id.toString(),
      senderId: msg.senderId,
      senderName: msg.sender.name,
      recipientIds: msg.recipientIds,
      subject: msg.subject,
      content: msg.content,
      messageType: msg.messageType,
      priority: msg.priority,
      isBroadcast: msg.isBroadcast,
      roomId: msg.roomId,
      replyToId: msg.replyToId,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt?.toISOString(),
      sentAt: msg.sentAt.toISOString(),
      isRead: msg.readBy.length > 0,
      readAt: msg.readBy[0]?.readAt.toISOString(),
      replies: msg.replies.map((reply: any) => ({
        id: reply.id.toString(),
        senderId: reply.senderId,
        senderName: reply.sender.name,
        content: reply.content,
        sentAt: reply.sentAt.toISOString(),
        isEdited: reply.isEdited,
        editedAt: reply.editedAt?.toISOString()
      }))
    }));

    return NextResponse.json({
      messages: formattedMessages,
      total: formattedMessages.length,
      hasMore: formattedMessages.length === limit
    });

  } catch (error) {
    console.error('GET /api/realtime/messages error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: String(error)
    }, { status: 500 });
  }
}

// PATCH - Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    const userId = (payload as any).userId;

    if (!messageId) {
      return NextResponse.json({
        message: 'Message ID is required'
      }, { status: 400 });
    }

    // Check if message exists and user has access
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { recipientIds: { has: userId } },
          { isBroadcast: true },
          { senderId: userId }
        ]
      }
    });

    if (!message) {
      return NextResponse.json({
        message: 'Message not found or access denied'
      }, { status: 404 });
    }

    // Mark as read
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId
        }
      },
      update: {
        readAt: new Date()
      },
      create: {
        messageId: messageId,
        userId,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('PATCH /api/realtime/messages error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: String(error)
    }, { status: 500 });
  }
}
