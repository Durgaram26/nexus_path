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

// GET - Get learning for faculty management
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

        
    // Get faculty information to determine their department and assigned career paths
    const faculty = await prisma.faculty.findUnique({
      where: { email: (payload as any).email },
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
    }

    // Get all learning for the faculty's assigned career paths
    const assignedCareerPaths = faculty.careerPaths.map(cp => cp.careerPath.name);
    
    // If no specific career paths assigned, get all for their department
    let learningResources;
    if (assignedCareerPaths.length === 0) {
      // Faculty manages all career paths in their department
      learningResources = await prisma.learningResource.findMany({
        include: {
          roadmap: {
            select: {
              id: true,
              title: true,
              department: true
            }
          },
          studentAccess: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Faculty manages specific career paths
      learningResources = await prisma.learningResource.findMany({
        where: {
          careerPath: {
            in: assignedCareerPaths
          }
        },
        include: {
          roadmap: {
            select: {
              id: true,
              title: true,
              department: true
            }
          },
          studentAccess: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Get students assigned to this faculty for resource assignment
    const students = await prisma.student.findMany({
      where: {
        departmentId: faculty.departmentId,
        careerPaths: assignedCareerPaths.length > 0 ? {
          some: {
            careerPath: {
              name: {
                in: assignedCareerPaths
              }
            }
          }
        } : undefined
      },
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    // Get available career paths for the dropdown
    let availableCareerPaths;
    if (assignedCareerPaths.length === 0) {
      // Faculty can manage all career paths
      availableCareerPaths = await prisma.careerPath.findMany({
        orderBy: { name: 'asc' }
      });
    } else {
      // Faculty can only manage their assigned career paths
      availableCareerPaths = await prisma.careerPath.findMany({
        where: {
          name: {
            in: assignedCareerPaths
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      learningResources,
      students,
      availableCareerPaths,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        department: faculty?.department?.name,
        assignedCareerPaths
      }
    });

  } catch (error) {
    console.error('GET /api/faculty/learning-resources:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - Create or assign learning resource
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { action, ...data } = await request.json();

    if (action === 'create') {
      // Create new learning resource
      const { title, description, url, category, difficulty, careerPath, studentIds } = data;

      if (!title || !description || !url || !category || !careerPath) {
        return NextResponse.json({ 
          message: 'Missing required fields: title, description, url, category, careerPath' 
        }, { status: 400 });
      }

      // Create the learning resource
      const resource = await prisma.learningResource.create({
        data: {
          title,
          description,
          url,
          category,
          difficulty: difficulty || 'beginner',
          careerPath,
          isActive: true
        }
      });

      // If specific students are selected, create access records for them
      if (studentIds && studentIds.length > 0) {
        const accessRecords = studentIds.map((studentId: number) => ({
        studentId: studentId.toString(),
        }));

        await prisma.studentResourceAccess.createMany({
          data: accessRecords,
          skipDuplicates: true
        });
      }

      return NextResponse.json({
        success: true,
        resource,
        message: `Learning resource created and assigned to ${studentIds?.length || 0} (s)`
      });

    } else if (action === 'assign') {
      // Assign existing resource to students
      const { resourceId, studentIds } = data;

      if (!resourceId || !studentIds || studentIds.length === 0) {
        return NextResponse.json({ 
          message: 'Missing resourceId or studentIds' 
        }, { status: 400 });
      }

      const accessRecords = studentIds.map((studentId: number) => ({
        studentId: studentId.toString(),
        resourceId
      }));

      await prisma.studentResourceAccess.createMany({
        data: accessRecords,
        skipDuplicates: true
      });

      return NextResponse.json({
        success: true,
        message: `Resource assigned to ${studentIds.length} (s)`
      });

    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('POST /api/faculty/learning-resources:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PUT - Update learning resource
export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { resourceId, title, description, url, category, difficulty, careerPath, isActive } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 });
    }

    const updatedResource = await prisma.learningResource.update({
      where: { id: resourceId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(url && { url }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(careerPath && { careerPath }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });

    return NextResponse.json({
      success: true,
      resource: updatedResource,
      message: 'Learning resource updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/faculty/learning-resources:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - Remove learning resource or assignment
export async function DELETE(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId');
    const studentId = url.searchParams.get('studentId');

    if (resourceId && studentId) {
      // Remove assignment from specific student
      await prisma.studentResourceAccess.deleteMany({
        where: {
          resourceId,
          studentId
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Resource assignment removed from student'
      });

    } else if (resourceId) {
      // Delete the entire resource (and all its assignments)
      await prisma.learningResource.delete({
        where: { id: resourceId }
      });

      return NextResponse.json({
        success: true,
        message: 'Learning resource deleted successfully'
      });

    } else {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('DELETE /api/faculty/learning-resources:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
