import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { socketManager } from '@/lib/socket';

function getAuthPayload(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyToken(token) : null;
}

// POST - Handle typing indicators
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action, recipientId, roomId } = await request.json();
    const userId = parseInt((payload as any).userId);

    if (!action || (!recipientId && !roomId)) {
      return NextResponse.json({ 
        message: 'Action and either recipientId or roomId is required' 
      }, { status: 400 });
    }

    // Get user information for typing indicator
    const user = socketManager.getConnectedUsers().find(u => u.userId === userId);
    if (!user) {
      return NextResponse.json({ 
        message: 'User not connected' 
      }, { status: 404 });
    }

    if (action === 'start') {
      if (recipientId) {
        socketManager.sendNotification(recipientId, {
          type: 'typing_start',
          title: 'User is typing...',
          message: `${user.id} is typing...`,
          data: { userId, userName: user.id }
        });
      } else if (roomId) {
        // Send typing indicator to room
        // This would need to be implemented in the socket manager
        console.log(`User ${userId} started typing in room ${roomId}`);
      }
    } else if (action === 'stop') {
      if (recipientId) {
        socketManager.sendNotification(recipientId, {
          type: 'typing_stop',
          title: 'User stopped typing',
          message: `${user.id} stopped typing`,
          data: { userId }
        });
      } else if (roomId) {
        console.log(`User ${userId} stopped typing in room ${roomId}`);
      }
    }

    return NextResponse.json({ 
      message: 'Typing indicator sent' 
    });

  } catch (error) {
    console.error('POST /api/realtime/typing error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
