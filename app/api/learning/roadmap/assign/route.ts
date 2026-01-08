import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Assign roadmaps to students
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { assignments } = body;

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid assignments data' 
      }, { status: 400 });
    }

    // Validate assignment data
    for (const assignment of assignments) {
      if (!assignment.roadmapId || !assignment.studentId) {
        return NextResponse.json({ 
          error: 'Each assignment must have roadmapId and studentId' 
        }, { status: 400 });
      }
    }

    // Create roadmap assignments
    const createdAssignments = [];
    
    for (const assignment of assignments) {
      try {
        // First, deactivate any existing assignments for this student
        await prisma.roadmapAssignment.updateMany({
          where: {
            studentId: assignment.studentId,
            isActive: true
          },
          data: {
            isActive: false
          }
        });

        // Create new assignment
        const newAssignment = await prisma.roadmapAssignment.create({
          data: {
            roadmapId: assignment.roadmapId,
            studentId: assignment.studentId,
            assignedBy: parseInt(decoded.userId),
            notes: assignment.notes || null,
            isActive: true
          },
          include: {
            roadmap: {
              select: {
                id: true,
                title: true,
                description: true
              }
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        
        createdAssignments.push(newAssignment);
      } catch (error: any) {
        console.error(`Error creating assignment for student ${assignment.studentId}:`, error);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${createdAssignments.length} roadmap(s)`,
      assignments: createdAssignments
    });

  } catch (error: any) {
    console.error('Roadmap assignment error:', error);
    return NextResponse.json({ 
      error: 'Failed to assign roadmaps',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Get roadmap assignments for a faculty member
export async function GET(request: NextRequest) {
  try {
    console.log('GET /learning/roadmap/assign - Starting request');
    
    // Verify authentication
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Token found, verifying...');
    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('User authorized, fetching assignments for user:', decoded.userId);
    
    const assignments = await prisma.roadmapAssignment.findMany({
      where: {
        assignedBy: parseInt(decoded.userId)
      },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            description: true,
            careerPath: true,
            department: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            year: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    console.log('Found assignments:', assignments.length);

    return NextResponse.json({
      success: true,
      assignments
    });

  } catch (error: any) {
    console.error('Get roadmap assignments error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch roadmap assignments',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// DELETE - Remove roadmap assignment
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json({ 
        error: 'Assignment ID is required' 
      }, { status: 400 });
    }

    // Check if the assignment was created by this faculty member
    const assignment = await prisma.roadmapAssignment.findFirst({
      where: {
        id: parseInt(assignmentId),
        assignedBy: parseInt(decoded.userId)
      }
    });

    if (!assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or unauthorized' 
      }, { status: 404 });
    }

    await prisma.roadmapAssignment.delete({
      where: {
        id: parseInt(assignmentId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Roadmap assignment removed successfully'
    });

  } catch (error: any) {
    console.error('Remove roadmap assignment error:', error);
    return NextResponse.json({ 
      error: 'Failed to remove roadmap assignment',
      details: error.message 
    }, { status: 500 });
  }
}