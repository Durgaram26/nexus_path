import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get personalized learning resources
export async function GET(request: NextRequest) {
  try {
    console.log('Learning resources API called');
    
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload || !['student'].includes((payload as any).role)) {
      console.log('Access denied - not a student');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    console.log('Student ID:', studentId);
    
    // Get the user first to get their email
    const user = await prisma.user.findUnique({
      where: { id: parseInt(studentId) }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student's basic info and career paths
    let student;
    try {
      student = await prisma.student.findFirst({
        where: { email: user.email },
        include: {
          careerPaths: {
            include: {
              careerPath: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      return NextResponse.json({ message: 'Database error fetching student' }, { status: 500 });
    }
    
    if (!student) {
      console.log('Student not found for email:', user.email);
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    console.log('Student found:', student.name);

    // Get student's career paths
    const careerPathNames = student.careerPaths.map(scp => scp.careerPath.name);
    console.log('Student career paths:', careerPathNames);

    // Get all learning resources assigned to this student or matching their career paths
    console.log('Querying learning resources for career paths:', careerPathNames);
    
    let learningResources;
    try {
      learningResources = await prisma.learningResource.findMany({
        where: {
          OR: [
            // Resources specifically assigned to this student
            {
              studentAccess: {
                some: {
                  studentId: student.id
                }
              }
            },
            // Resources available to student's career paths (general availability)
            {
              careerPath: {
                in: careerPathNames
              },
              isActive: true
            }
          ]
        },
        include: {
          studentAccess: {
            where: {
              studentId: student.id
            }
          },
          roadmap: {
            select: {
              id: true,
              title: true,
              department: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      console.error('Error fetching learning resources:', error);
      return NextResponse.json({ message: 'Database error fetching learning resources' }, { status: 500 });
    }
    
    console.log('Found learning resources:', learningResources.length);

    // Transform to include access information
    const resourcesWithAccess = learningResources.map(resource => ({
      ...resource,
      isAssigned: resource.studentAccess.length > 0,
      accessInfo: resource.studentAccess[0] || null
    }));

    // Group by category
    const resourcesByCategory: { [key: string]: any[] } = {};
    resourcesWithAccess.forEach(resource => {
      if (!resourcesByCategory[resource.category]) {
        resourcesByCategory[resource.category] = [];
      }
      resourcesByCategory[resource.category].push(resource);
    });

    // Separate assigned vs available resources
    const assignedToStudent = resourcesWithAccess.filter(r => r.isAssigned);
    const availableResources = resourcesWithAccess.filter(r => !r.isAssigned);
    
    return NextResponse.json({
      success: true,
      resourcesByCategory,
      assignedResources: assignedToStudent,
      availableResources: availableResources,
      totalResources: resourcesWithAccess.length,
      message: `Found ${resourcesWithAccess.length} learning resources (${assignedToStudent.length} assigned, ${availableResources.length} available)`
    });

  } catch (error) {
    console.error('GET /api/student/learning-resources error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - Track resource access
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;
    const { resourceId, action, rating, notes } = await request.json();

    if (!resourceId || !action) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // Get the user first to get their email
    const user = await prisma.user.findUnique({
      where: { id: parseInt(studentId) }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const student = await prisma.student.findFirst({
      where: { email: user.email }
    });
    
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'access':
        // Record resource access
        await prisma.studentResourceAccess.upsert({
          where: {
            studentId_resourceId: {
              studentId: student.id,
              resourceId: parseInt(resourceId)
            }
          },
          update: {
            accessedAt: new Date()
          },
          create: {
            studentId: student.id,
            resourceId: parseInt(resourceId),
            accessedAt: new Date()
          }
        });
        break;

      case 'complete':
        // Mark resource as completed
        await prisma.studentResourceAccess.upsert({
          where: {
            studentId_resourceId: {
              studentId: student.id,
              resourceId: parseInt(resourceId)
            }
          },
          update: {
            isCompleted: true,
            rating: rating || null,
            notes: notes || null
          },
          create: {
            studentId: student.id,
            resourceId: parseInt(resourceId),
            isCompleted: true,
            rating: rating || null,
            notes: notes || null
          }
        });
        break;

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Resource ${action} recorded successfully`
    });

  } catch (error) {
    console.error('POST /api/student/learning-resources error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}