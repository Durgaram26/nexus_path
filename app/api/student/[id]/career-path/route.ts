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

// GET - Get career paths for a student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!id || id.length === 0) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const careerPaths = await prisma.studentCareerPath.findMany({
      where: { studentId: id },
      include: {
        careerPath: true,
        assignedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    return NextResponse.json(careerPaths, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/[id]/career-path:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// POST - Assign a career path to a student
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!id || id.length === 0) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const { careerPathId } = await request.json();

    if (!careerPathId) {
      return NextResponse.json({ message: 'Career path ID is required' }, { status: 400 });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if career path exists
    const careerPath = await prisma.careerPath.findUnique({ where: { id: careerPathId } });
    if (!careerPath) {
      return NextResponse.json({ message: 'Career path not found' }, { status: 404 });
    }

    // Check cross-department permissions for faculty
    if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email },
        include: { department: true }
      });

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can assign to this student's department
      const canAssign = faculty.canAssignCrossDepartment && (
        !faculty.allowedDepartments || // Can access all departments
        faculty.allowedDepartments.split(',').map((id: string) => id.trim()).includes(student.departmentId)
      );

      if (!canAssign && faculty.departmentId !== student.departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to assign career paths to students in this department' 
        }, { status: 403 });
      }
    }

    // Check if already assigned
    const existing = await prisma.studentCareerPath.findFirst({
      where: { studentId: id, careerPathId }
    });

    if (existing) {
      return NextResponse.json({ message: 'Career path already assigned to this student' }, { status: 409 });
    }

    // Assign career path
    const assignment = await prisma.studentCareerPath.create({
      data: {
        studentId: id,
        careerPathId,
        assignedBy: (payload as any).userId
      },
      include: {
        careerPath: true,
        student: {
          include: {
            department: true
          }
        }
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('POST /api/student/[id]/career-path:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// DELETE - Remove a career path from a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!id || id.length === 0) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const { careerPathId } = await request.json();

    if (!careerPathId) {
      return NextResponse.json({ message: 'Career path ID is required' }, { status: 400 });
    }

    // Delete the assignment
    await prisma.studentCareerPath.deleteMany({
      where: {
        studentId: id,
        careerPathId
      }
    });

    return NextResponse.json({ message: 'Career path removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/student/[id]/career-path:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}