import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Gender } from '@prisma/client';

// Create Faculty
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { email, name, gender, departmentId } = await request.json();

    if (!email || !name || !gender || !departmentId) {
      return NextResponse.json({ message: 'Email, name, gender, and department ID are required' }, { status: 400 });
    }
    if (!Object.values(Gender).includes(gender)) {
        return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
    }

    const existingFaculty = await prisma.faculty.findUnique({ where: { email } });
    if (existingFaculty) {
      return NextResponse.json({ message: 'Faculty with this email already exists' }, { status: 409 });
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const faculty = await prisma.faculty.create({ data: { email, name, gender, departmentId } });
    return NextResponse.json(faculty, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /faculty error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Get all Faculties
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const faculties = await prisma.faculty.findMany({
      include: { department: { include: { college: true } } },
      orderBy: { email: 'asc' }});
    return NextResponse.json(faculties, { status: 200 });
  } catch (error: unknown) {
    console.error('GET /faculty error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Update Faculty
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id, email, name, gender, departmentId } = await request.json();

    if (!id || !email || !name || !gender || !departmentId) {
      return NextResponse.json({ message: 'Faculty ID, email, name, gender, and department ID are required' }, { status: 400 });
    }
    if (!Object.values(Gender).includes(gender)) {
        return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
    }

    const existingFaculty = await prisma.faculty.findUnique({ where: { email } });
    if (existingFaculty && existingFaculty.id !== id) {
      return NextResponse.json({ message: 'Faculty with this email already exists' }, { status: 409 });
    }

    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: { email, name, gender, departmentId }});
    return NextResponse.json(faculty, { status: 200 });
  } catch (error: unknown) {
    console.error('PUT /faculty error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Delete Faculty
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Faculty ID is required' }, { status: 400 });
    }

    await prisma.faculty.delete({ where: { id } });
    return NextResponse.json({ message: 'Faculty deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('DELETE /faculty error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
