import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get details with career paths
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty', 'student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Check if student is accessing their own profile or if user is admin/faculty
    if ((payload as any).role === 'student' && (payload as any).userId !== studentId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: {
          include: {
            college: true
          }
        },
        careerPaths: {
          include: {
            careerPath: true,
            assignedByUser: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/[id] error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// PUT - Update profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty', 'student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Check if student is updating their own profile or if user is admin/faculty
    if ((payload as any).role === 'student' && (payload as any).userId !== studentId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { name, phoneNumber } = await request.json();

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(name && { name }),
        ...(phoneNumber !== undefined && { phoneNumber })
      },
      include: {
        department: {
          include: {
            college: true
          }
        },
        careerPaths: {
          include: {
            careerPath: true,
            assignedByUser: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('PUT /api/student/[id] error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}