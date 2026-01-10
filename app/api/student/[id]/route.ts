import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

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
    const studentId = id;

    if (!studentId || studentId.length === 0) {
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
    const studentId = id;

    if (!studentId || studentId.length === 0) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Check if student is updating their own profile or if user is admin/faculty
    if ((payload as any).role === 'student' && (payload as any).userId !== studentId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const { name, phoneNumber, email, gender, departmentId, year, registerNumber } = await request.json();

    // Validate required fields
    if (!email || !departmentId || !year || !registerNumber) {
      return NextResponse.json(
        { message: 'Email, department ID, year, and register number are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another student
    const emailTaken = await prisma.student.findFirst({ 
      where: { email, id: { not: studentId } } 
    });
    if (emailTaken) {
      return NextResponse.json(
        { message: 'Email is already taken by another student' },
        { status: 409 }
      );
    }

    // Check if registerNumber is already taken by another student
    const regNumberTaken = await prisma.student.findFirst({
      where: { registerNumber, id: { not: studentId } }
    });
    if (regNumberTaken) {
      return NextResponse.json(
        { message: 'Register number is already taken by another student' },
        { status: 409 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(name && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        email,
        ...(gender && { gender }),
        departmentId,
        year,
        registerNumber
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
