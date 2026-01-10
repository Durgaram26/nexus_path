import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Create College
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'College name is required' }, { status: 400 });
    }

    const existingCollege = await prisma.college.findUnique({ where: { name } });
    if (existingCollege) {
      return NextResponse.json({ message: 'College with this name already exists' }, { status: 409 });
    }

    const college = await prisma.college.create({ data: { name } });
    return NextResponse.json(college, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /college error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Get all Colleges
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' }});
    return NextResponse.json(colleges, { status: 200 });
  } catch (error: unknown) {
    console.error('GET /college error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Update College
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ message: 'College ID and name are required' }, { status: 400 });
    }

    const existingCollege = await prisma.college.findUnique({ where: { name } });
    if (existingCollege && existingCollege.id !== id) {
      return NextResponse.json({ message: 'College with this name already exists' }, { status: 409 });
    }

    const college = await prisma.college.update({
      where: { id },
      data: { name }});
    return NextResponse.json(college, { status: 200 });
  } catch (error: unknown) {
    console.error('PUT /college error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Delete College
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'College ID is required' }, { status: 400 });
    }

    // Check if there are any departments associated with this college
    const departments = await prisma.department.findMany({ where: { collegeId: id } });
    if (departments.length > 0) {
      return NextResponse.json({ message: 'Cannot delete college with associated departments' }, { status: 409 });
    }

    await prisma.college.delete({ where: { id } });
    return NextResponse.json({ message: 'College deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('DELETE /college error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
