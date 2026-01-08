import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Create Department
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, description, collegeId } = await request.json();

    if (!name || !collegeId) {
      return NextResponse.json({ message: 'Department name and college ID are required' }, { status: 400 });
    }

    const existingDepartment = await prisma.department.findUnique({ where: { name } });
    if (existingDepartment) {
      return NextResponse.json({ message: 'Department with this name already exists' }, { status: 409 });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return NextResponse.json({ message: 'College not found' }, { status: 404 });
    }

    const department = await prisma.department.create({ data: { name, description, collegeId } });
    return NextResponse.json(department, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /department error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Get all Departments
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const departments = await prisma.department.findMany({
      include: { college: true },
      orderBy: { name: 'asc' }});
    return NextResponse.json(departments, { status: 200 });
  } catch (error: unknown) {
    console.error('GET /department error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Update Department
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id, name, description, collegeId } = await request.json();

    if (!id || !name || !collegeId) {
      return NextResponse.json({ message: 'Department ID, name, and college ID are required' }, { status: 400 });
    }

    const existingDepartment = await prisma.department.findUnique({ where: { name } });
    if (existingDepartment && existingDepartment.id !== id) {
      return NextResponse.json({ message: 'Department with this name already exists' }, { status: 409 });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return NextResponse.json({ message: 'College not found' }, { status: 404 });
    }

    const department = await prisma.department.update({
      where: { id },
      data: { name, description, collegeId }});
    return NextResponse.json(department, { status: 200 });
  } catch (error: unknown) {
    console.error('PUT /department error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Delete Department
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Department ID is required' }, { status: 400 });
    }

    // Check for associated faculties or students before deleting
    const faculties = await prisma.faculty.findMany({ where: { departmentId: id } });
    const students = await prisma.student.findMany({ where: { departmentId: id } });

    if (faculties.length > 0 || students.length > 0) {
      return NextResponse.json({ message: 'Cannot delete department with associated faculties or students' }, { status: 409 });
    }

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: 'Department deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('DELETE /department error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
