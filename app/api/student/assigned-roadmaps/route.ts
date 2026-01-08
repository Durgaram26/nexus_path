import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get assigned roadmaps for a student
export async function GET(request: NextRequest) {
  try {
    console.log('GET ///assigned-roadmaps - Starting request');
    
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
    if (!decoded || decoded.role !== 'student') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the record for this user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
      select: { email: true }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the student record by email
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        name: true,
        email: true,
        year: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!student) {
      console.log('Student record not found for user:', user.email);
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    
    console.log('Student authorized, fetching assignments for:', student.name);

    // Get assigned roadmaps for this student (only active ones)
    const assignments = await prisma.roadmapAssignment.findMany({
      where: {
        studentId: student.id,
        isActive: true
      },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            description: true,
            totalDuration: true,
            year: true,
            careerPath: true,
            department: true,
            studentLevel: true,
            milestones: true,
            learningPath: true,
            careerOutcomes: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            createdByUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        assignedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    console.log('Found assignments:', assignments.length);

    // Transform the data to include assignment details
    const roadmaps = assignments.map(assignment => ({
      ...assignment.roadmap,
      assignmentId: assignment.id,
      assignedAt: assignment.assignedAt,
      progress: assignment.progress,
      notes: assignment.notes,
      assignedBy: assignment.assignedByUser
    }));

    console.log('Returning roadmaps:', roadmaps.length);

    return NextResponse.json({
      success: true,
      roadmaps
    });

  } catch (error: unknown) {
    console.error('Get assigned roadmaps error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assigned roadmaps',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
