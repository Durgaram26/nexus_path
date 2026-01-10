import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty access required' }, { status: 403 });
    }

    // Find the faculty record
    const faculty = await prisma.faculty.findFirst({
      where: { email: payload.email }
    });
    
    if (!faculty) {
      return NextResponse.json({ 
        error: 'Faculty record not found. Please ensure you are properly registered as faculty.' 
      }, { status: 400 });
    }

    const { id } = await params;
    const workshopId = id;
    if (!workshopId) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    const workshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        createdBy: faculty.id
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workshop
    });

  } catch (error) {
    console.error('Error fetching workshop:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch workshop' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty access required' }, { status: 403 });
    }

    const { id } = await params;
    const workshopId = id;
    if (!workshopId) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      description,
      instructor,
      duration,
      level,
      category,
      maxParticipants,
      startDate,
      endDate,
      location,
      prerequisites,
      objectives,
      materials,
      isMandatory,
      status
    } = body;

    // Check if workshop exists and belongs to the faculty
    const existingWorkshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        createdBy: payload.userId
      }
    });

    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Update workshop
    const workshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructor && { instructor }),
        ...(duration && { duration }),
        ...(level && { level }),
        ...(category && { category }),
        ...(maxParticipants && { maxParticipants }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location && { location }),
        ...(prerequisites !== undefined && { prerequisites: prerequisites ? JSON.stringify(prerequisites) : null }),
        ...(objectives !== undefined && { objectives: objectives ? JSON.stringify(objectives) : null }),
        ...(materials !== undefined && { materials: materials ? JSON.stringify(materials) : null }),
        ...(isMandatory !== undefined && { isMandatory }),
        ...(status && { status })
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      workshop
    });

  } catch (error) {
    console.error('Error updating workshop:', error);
    return NextResponse.json({ 
      error: 'Failed to update workshop' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty access required' }, { status: 403 });
    }

    // Find the faculty record
    const faculty = await prisma.faculty.findFirst({
      where: { email: payload.email }
    });
    
    if (!faculty) {
      return NextResponse.json({ 
        error: 'Faculty record not found. Please ensure you are properly registered as faculty.' 
      }, { status: 400 });
    }

    const { id } = await params;
    const workshopId = id;
    if (!workshopId) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }

    // Check if workshop exists and belongs to the faculty
    const existingWorkshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        createdBy: faculty.id
      }
    });

    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Delete workshop (this will cascade delete enrollments)
    await prisma.workshop.delete({
      where: { id: workshopId }
    });

    return NextResponse.json({
      success: true,
      message: 'Workshop deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workshop:', error);
    return NextResponse.json({ 
      error: 'Failed to delete workshop' 
    }, { status: 500 });
  }
}
