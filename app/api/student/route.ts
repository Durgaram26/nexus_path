import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET /api/student - Fetch all students
export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/student - Create new student
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { email, name, gender, phoneNumber, departmentId, year, registerNumber } = await request.json();

    if (!email || !departmentId || !year || !registerNumber) {
      return NextResponse.json(
        { success: false, message: 'Email, department ID, year, and register number are required' },
        { status: 400 }
      );
    }

    if (gender && !Object.values(Gender).includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gender' },
        { status: 400 }
      );
    }

    // Check if student with this email already exists
    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student with this email already exists' },
        { status: 409 }
      );
    }

    // Check if student with this registerNumber already exists
    const existingByRegNumber = await prisma.student.findUnique({ where: { registerNumber } });
    if (existingByRegNumber) {
      return NextResponse.json(
        { success: false, message: 'Student with this register number already exists' },
        { status: 409 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }

    const student = await prisma.student.create({
      data: {
        email,
        name: name || '',
        gender: gender || 'MALE',
        phoneNumber: phoneNumber || null,
        departmentId,
        year,
        registerNumber
      },
      include: {
        department: true
      }
    });

    return NextResponse.json({
      success: true,
      student: student
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// PUT /api/student - Update student
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id, email, name, gender, phoneNumber, departmentId, year, registerNumber } = await request.json();

    if (!id || !email || !departmentId || !year || !registerNumber) {
      return NextResponse.json(
        { success: false, message: 'Student ID, email, department ID, year, and register number are required' },
        { status: 400 }
      );
    }

    if (gender && !Object.values(Gender).includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gender' },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another student
    const emailTaken = await prisma.student.findFirst({
      where: { email, id: { not: id } }
    });
    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: 'Email is already taken by another student' },
        { status: 409 }
      );
    }

    // Check if registerNumber is already taken by another student
    const regNumberTaken = await prisma.student.findFirst({
      where: { registerNumber, id: { not: id } }
    });
    if (regNumberTaken) {
      return NextResponse.json(
        { success: false, message: 'Register number is already taken by another student' },
        { status: 409 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        email,
        name: name || '',
        gender: gender || 'MALE',
        phoneNumber: phoneNumber || null,
        departmentId,
        year,
        registerNumber
      },
      include: {
        department: true
      }
    });

    return NextResponse.json({
      success: true,
      student: student
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/student - Delete student
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Student deletion requested...');

    // Check authentication
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      console.log('❌ Unauthorized deletion attempt');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    console.log(`🔍 Deleting student with ID: ${id}`);

    if (!id) {
      console.log('❌ No student ID provided');
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) {
      console.log('❌ Student not found');
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    console.log(`👤 Found student: ${existingStudent.name} (${existingStudent.email})`);

    // Also delete the associated user account if it exists
    const associatedUser = await prisma.user.findUnique({
      where: { email: existingStudent.email }
    });

    if (associatedUser) {
      console.log(`🗑️ Deleting associated user account for email: ${existingStudent.email}`);
      await prisma.user.delete({ where: { email: existingStudent.email } });
      console.log('✅ User account deleted successfully');
    } else {
      console.log('ℹ️ No associated user account found');
    }

    // Delete the student record
    console.log('🗑️ Deleting student record...');
    await prisma.student.delete({ where: { id } });
    console.log('✅ Student record deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete student' },
      { status: 500 }
    );
  }
}