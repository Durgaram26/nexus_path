import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
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

// GET - Get students assigned to faculty
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get faculty information
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

    // Get students based on faculty's department and assigned career paths
    const assignedCareerPaths = faculty.careerPaths.map((cp: any) => cp.careerPath.name);

    let students;
    if (assignedCareerPaths.length === 0) {
      // Faculty manages all students in their department
      students = await prisma.student.findMany({
        where: {
          departmentId: faculty.departmentId
        },
        include: {
          department: true,
          careerPaths: {
            include: {
              careerPath: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    } else {
      // Faculty manages students with specific career paths
      students = await prisma.student.findMany({
        where: {
          departmentId: faculty.departmentId,
          careerPaths: {
            some: {
              careerPath: {
                name: {
                  in: assignedCareerPaths
                }
              }
            }
          }
        },
        include: {
          department: true,
          careerPaths: {
            include: {
              careerPath: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      students: students,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        department: faculty.department.name,
        assignedCareerPaths
      }
    });

  } catch (error) {
    console.error('GET /api/faculty/assigned-students:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}