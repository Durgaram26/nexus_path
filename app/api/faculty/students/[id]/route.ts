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

// GET - Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const studentId = id;
    
    if (!studentId) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { department: true }
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can access this student's department
    if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }
      });

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this student's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.allowedDepartments || // Can access all departments
        faculty.allowedDepartments.split(',').map(id => id.trim()).includes(student.departmentId)
      );

      if (!canAccess && faculty.departmentId !== student.departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to access this student' 
        }, { status: 403 });
      }
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error('GET /api/faculty/students/[id] error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// PUT - Update a student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const studentId = id;
    
    if (!studentId) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const { email, name, gender, departmentId, year, registerNumber } = await request.json();

    if (!email || !name || !gender || !departmentId || !year || !registerNumber) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({ where: { id: studentId } });
    if (!existingStudent) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can update this student
    if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }
      });

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this student's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.allowedDepartments || // Can access all departments
        faculty.allowedDepartments.split(',').map(id => id.trim()).includes(existingStudent.departmentId)
      );

      if (!canAccess && faculty.departmentId !== existingStudent.departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to update this student' 
        }, { status: 403 });
      }

      // Check if faculty can move to new department
      if (departmentId !== existingStudent.departmentId) {
        const canMoveToNewDept = faculty.canAssignCrossDepartment && (
          !faculty.allowedDepartments || // Can access all departments
          faculty.allowedDepartments.split(',').map(id => id.trim()).includes(departmentId)
        );

        if (!canMoveToNewDept && faculty.departmentId !== departmentId) {
          return NextResponse.json({ 
            message: 'You do not have permission to move this student to the selected department' 
          }, { status: 403 });
        }
      }
    }

    // Check if email or register number is already taken by another student
    const duplicateStudent = await prisma.student.findFirst({
      where: {
        AND: [
          { id: { not: studentId } },
          {
            OR: [
              { email },
              { registerNumber }
            ]
          }
        ]
      }
    });

    if (duplicateStudent) {
      return NextResponse.json({ 
        message: 'Student with this email or register number already exists' 
      }, { status: 409 });
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        email,
        name,
        gender,
        departmentId: departmentId,
        year: parseInt(year),
        registerNumber},
      include: {
        department: {
          include: {
            college: true}},
        careerPaths: {
          include: {
            careerPath: true}}}});

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('PUT //faculty/students/[id] :');
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// DELETE - Delete a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const studentId = id;
    
    if (!studentId) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can delete this student
    if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }
      });

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this student's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.allowedDepartments || // Can access all departments
        faculty.allowedDepartments.split(',').map(id => id.trim()).includes(student.departmentId)
      );

      if (!canAccess && faculty.departmentId !== student.departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to delete this student' 
        }, { status: 403 });
      }
    }

    // Delete student (this will cascade delete career path assignments)
    await prisma.student.delete({
      where: { id: studentId }
    });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE //faculty/students/[id] :');
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
