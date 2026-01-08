import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthPayload(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyToken(token) : null;
}

// GET - Get rooms for a user
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((payload as any).userId);
    const userRole = (payload as any).role;

    let rooms;

    if (userRole === 'faculty') {
      // Faculty can see all rooms they created or are members of
      rooms = await prisma.messageRoom.findMany({
        where: {
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } }
          ],
          isActive: true
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              room: false // Avoid circular reference
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userRole === 'student') {
      // Students can only see rooms they are members of
      rooms = await prisma.messageRoom.findMany({
        where: {
          members: { some: { userId } },
          isActive: true
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              room: false
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ 
        message: 'Access denied' 
      }, { status: 403 });
    }

    const formattedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      roomType: room.roomType,
      createdBy: room.createdBy,
      creatorName: room.creator.name,
      createdAt: room.createdAt.toISOString(),
      memberCount: room._count.members,
      isMember: room.members.some(member => member.userId === userId)
    }));

    return NextResponse.json({ rooms: formattedRooms });

  } catch (error) {
    console.error('GET /api/realtime/rooms error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (payload as any).role;
    if (userRole !== 'faculty') {
      return NextResponse.json({ 
        message: 'Only faculty can create rooms' 
      }, { status: 403 });
    }

    const { name, description, roomType = 'general', memberIds = [] } = await request.json();
    const userId = parseInt((payload as any).userId);

    if (!name?.trim()) {
      return NextResponse.json({ 
        message: 'Room name is required' 
      }, { status: 400 });
    }

    // Create room
    const room = await prisma.messageRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        roomType,
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Add creator as admin member
    await prisma.messageRoomMember.create({
      data: {
        roomId: room.id,
        userId,
        userRole: 'admin'
      }
    });

    // Add other members if specified
    if (memberIds.length > 0) {
      const memberData = memberIds.map((memberId: number) => ({
        roomId: room.id,
        userId: memberId,
        userRole: 'member'
      }));

      await prisma.messageRoomMember.createMany({
        data: memberData
      });
    }

    return NextResponse.json({
      message: 'Room created successfully',
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        roomType: room.roomType,
        createdBy: room.createdBy,
        creatorName: room.creator.name,
        createdAt: room.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('POST /api/realtime/rooms error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: String(error) 
    }, { status: 500 });
  }
}
