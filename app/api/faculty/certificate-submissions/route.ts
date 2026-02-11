import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Certificate submissions API called');

    // Verify authentication
    const bearer = request.headers.get('authorization');
    const tokenFromHeader = bearer?.startsWith('Bearer ')
      ? bearer.substring('Bearer '.length)
      : undefined;
    const tokenFromCookie = request.cookies.get('access_token')?.value;
    const token = tokenFromHeader || tokenFromCookie;

    console.log('🔍 Token extraction:', {
      hasBearer: !!bearer,
      hasTokenFromHeader: !!tokenFromHeader,
      hasTokenFromCookie: !!tokenFromCookie,
      hasToken: !!token
    });

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('🔍 Verifying token:', token.substring(0, 20) + '...');
    const decoded = verifyToken(token);
    console.log('🔍 Decoded token:', decoded);

    if (!decoded || decoded.role !== 'faculty') {
      console.log('❌ Token verification failed:', { decoded, role: decoded?.role });
      return NextResponse.json({ error: 'Unauthorized - Faculty access required' }, { status: 403 });
    }

    console.log('✅ Faculty authenticated, fetching certificate submissions...');
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const department = searchParams.get('department') || '';
    const year = searchParams.get('year') || '';
    const careerPath = searchParams.get('careerPath') || '';
    const courseProvider = searchParams.get('courseProvider') || '';
    const courseAssignment = searchParams.get('courseAssignment') || '';

    // Validate numeric filters
    const yearNum = year ? parseInt(year) : null;
    const careerPathStr = careerPath || null;

    if (year && isNaN(yearNum!)) {
      return NextResponse.json(
        { error: 'Invalid year filter - must be a number' },
        { status: 400 }
      );
    }

    // Validate status filter
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status filter' },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const where: any = {};
    const studentWhere: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { courseName: { contains: search, mode: 'insensitive' } },
        { courseProvider: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { student: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Department filter
    if (department) {
      studentWhere.departmentId = department;
    }

    // Year filter
    if (yearNum) {
      studentWhere.year = yearNum;
    }

    // Career path filter
    if (careerPathStr) {
      studentWhere.careerPaths = {
        some: {
          careerPathId: careerPathStr
        }
      };
    }

    // Course provider filter
    if (courseProvider) {
      where.courseProvider = courseProvider;
    }

    // Course assignment filter
    if (courseAssignment === 'assigned') {
      studentWhere.roadmapAssignments = {
        some: {
          isActive: true
        }
      };
    } else if (courseAssignment === 'not-assigned') {
      studentWhere.roadmapAssignments = {
        none: {
          isActive: true
        }
      };
    }

    // Add student filters to main where clause if any exist
    if (Object.keys(studentWhere).length > 0) {
      where.student = studentWhere;
    }

    console.log('🔍 Query filters:', JSON.stringify(where, null, 2));

    const submissions = await prisma.certificateSubmission.findMany({
      where,
      select: {
        id: true,
        courseName: true,
        courseProvider: true,
        completionDate: true,
        certificateFileName: true,
        fileMimeType: true,
        fileSize: true,
        description: true,
        courseLink: true,
        courseType: true,
        status: true,
        submittedAt: true,
        evaluatedAt: true,
        evaluatedBy: true,
        facultyComments: true,
        grade: true,
        student: {
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
            },
            careerPaths: {
              include: {
                careerPath: true
              }
            },
            roadmapAssignments: {
              where: {
                isActive: true
              },
              include: {
                roadmap: true
              }
            }
          }
        },
        evaluator: {
          select: {
            id: true,
            email: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    console.log(`📊 Found ${submissions.length} certificate submissions`);

    // Get unique values for filter dropdowns
    const [departments, careerPaths, courseProviders, years] = await Promise.all([
      prisma.department.findMany({
        select: { id: true, name: true }
      }),
      prisma.careerPath.findMany({
        select: { id: true, name: true }
      }),
      prisma.certificateSubmission.findMany({
        select: { courseProvider: true },
        distinct: ['courseProvider']
      }),
      prisma.student.findMany({
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'asc' }
      })
    ]);

    console.log('✅ Returning certificate submissions:', {
      submissionCount: submissions.length,
      departments: departments.length,
      careerPaths: careerPaths.length,
      courseProviders: courseProviders.length,
      years: years.length
    });

    return NextResponse.json({
      submissions,
      filterOptions: {
        departments,
        careerPaths,
        courseProviders: courseProviders.map((cp: any) => cp.courseProvider),
        years: years.map((y: any) => y.year)
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching certificate submissions:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch certificate submissions',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, grade, comments, evaluatedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.certificateSubmission.update({
      where: { id: id },
      data: {
        status,
        grade: grade || null,
        facultyComments: comments || null,
        evaluatedBy: evaluatedBy ? evaluatedBy : null,
        evaluatedAt: new Date()
      },
      include: {
        student: {
          include: {
            department: true,
            careerPaths: {
              include: {
                careerPath: true
              }
            }
          }
        },
        evaluator: {
          include: {
            department: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    });

  } catch (error: any) {
    console.error('Error updating certificate submission:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate submission' },
      { status: 500 }
    );
  }
}
