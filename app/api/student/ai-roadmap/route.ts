import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

// GET - Get or create AI-generated roadmap for student
export async function GET(request: NextRequest) {
  try {
    console.log('GET /student/ai-roadmap - Starting request');

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

    // Find the user record
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the student record by email
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        careerPaths: {
          include: {
            careerPath: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      console.log('Student record not found for user:', user.email);
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    console.log('Student found:', student.name);

    // Check if student already has any roadmap assignment (AI or manual)
    const existingAssignment = await prisma.roadmapAssignment.findFirst({
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
            isAIGenerated: true,
            createdAt: true,
            updatedAt: true,
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
      }
    });

    // If student already has a roadmap assignment, return it
    if (existingAssignment) {
      console.log('Student already has roadmap:', existingAssignment.roadmap.title, 'AI Generated:', existingAssignment.roadmap.isAIGenerated);
      return NextResponse.json({
        success: true,
        roadmap: {
          ...existingAssignment.roadmap,
          assignmentId: existingAssignment.id,
          assignedAt: existingAssignment.assignedAt,
          progress: existingAssignment.progress,
          notes: existingAssignment.notes,
          assignedBy: existingAssignment.assignedByUser
        },
        isNew: false
      });
    }

    // Student doesn't have any roadmap assignment, need to find an AI roadmap to assign
    console.log('Student needs AI roadmap, checking for available AI roadmaps...');

    // Get student's career paths
    const careerPathNames = student.careerPaths.map((scp: any) => scp.careerPath.name);
    console.log('Student career paths:', careerPathNames);

    if (careerPathNames.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No career paths assigned. Please contact your faculty to assign career paths first.',
        requiresCareerPath: true
      }, { status: 400 });
    }

    // Find an AI-generated roadmap that matches student's criteria
    const availableRoadmap = await prisma.roadmap.findFirst({
      where: {
        isAIGenerated: true,
        year: student.year,
        careerPath: {
          in: careerPathNames
        },
        department: student.department.name
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!availableRoadmap) {
      console.log('No matching AI roadmap found for student - returning empty state');
      return NextResponse.json({
        success: true,
        roadmap: null,
        isNew: false,
        requiresRoadmapCreation: true
      }, { status: 200 });
    }

    console.log('Found matching AI roadmap:', availableRoadmap.title);

    // Create assignment for this student
    const newAssignment = await prisma.roadmapAssignment.create({
      data: {
        roadmapId: availableRoadmap.id,
        studentId: student.id,
        assignedBy: availableRoadmap.createdBy, // Assign by the roadmap creator
        isActive: true,
        progress: 0,
        notes: 'Auto-assigned AI-generated roadmap'
      },
      include: {
        assignedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('Created new roadmap assignment:', newAssignment.id);

    return NextResponse.json({
      success: true,
      roadmap: {
        ...availableRoadmap,
        assignmentId: newAssignment.id,
        assignedAt: newAssignment.assignedAt,
        progress: newAssignment.progress,
        notes: newAssignment.notes,
        assignedBy: newAssignment.assignedByUser
      },
      isNew: true
    });

  } catch (error: unknown) {
    console.error('Get AI roadmap error:', error);
    return NextResponse.json({
      error: 'Failed to get AI roadmap',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Manually assign AI roadmap to student (for faculty use)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /student/ai-roadmap - Starting request');

    // Verify authentication - only faculty can assign
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

    const { studentId, roadmapId } = await request.json();

    if (!studentId || !roadmapId) {
      return NextResponse.json({
        error: 'Missing required fields: studentId, roadmapId'
      }, { status: 400 });
    }

    // Verify the roadmap is AI-generated
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { isAIGenerated: true }
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    if (!roadmap.isAIGenerated) {
      return NextResponse.json({
        error: 'Only AI-generated roadmaps can be assigned through this endpoint'
      }, { status: 400 });
    }

    // Check if student already has an AI roadmap
    const existingAssignment = await prisma.roadmapAssignment.findFirst({
      where: {
        studentId: studentId,
        isActive: true,
        roadmap: {
          isAIGenerated: true
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json({
        error: 'Student already has an AI-generated roadmap assigned'
      }, { status: 409 });
    }

    // Create the assignment
    const assignment = await prisma.roadmapAssignment.create({
      data: {
        roadmapId: roadmapId,
        studentId: studentId,
        assignedBy: decoded.userId,
        isActive: true,
        progress: 0,
        notes: 'Manually assigned by faculty'
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
            isAIGenerated: true,
            createdAt: true,
            updatedAt: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
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
      }
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        roadmap: assignment.roadmap,
        student: assignment.student,
        assignedBy: assignment.assignedByUser,
        assignedAt: assignment.assignedAt,
        progress: assignment.progress,
        notes: assignment.notes
      }
    });

  } catch (error: unknown) {
    console.error('Assign AI roadmap error:', error);
    return NextResponse.json({
      error: 'Failed to assign AI roadmap',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
