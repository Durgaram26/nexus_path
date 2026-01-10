import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Create CareerPath
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Career path name is required' }, { status: 400 });
    }

    const existingCareerPath = await prisma.careerPath.findUnique({ where: { name } });
    if (existingCareerPath) {
      return NextResponse.json({ message: 'Career path with this name already exists' }, { status: 409 });
    }

    const careerPath = await prisma.careerPath.create({ data: { name, description } });
    return NextResponse.json(careerPath, { status: 201 });
  } catch (error: unknown) {
    console.error('Career path error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Get all CareerPaths
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || !['admin', 'faculty', 'student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const careerPaths = await prisma.careerPath.findMany({
      orderBy: { name: 'asc' }});
    return NextResponse.json(careerPaths, { status: 200 });
  } catch (error: unknown) {
    console.error('Career path error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Update CareerPath
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id, name, description } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ message: 'Career path ID and name are required' }, { status: 400 });
    }

    const existingCareerPath = await prisma.careerPath.findUnique({ where: { name } });
    if (existingCareerPath && existingCareerPath.id !== id) {
      return NextResponse.json({ message: 'Career path with this name already exists' }, { status: 409 });
    }

    const careerPath = await prisma.careerPath.update({
      where: { id },
      data: { name, description }});
    return NextResponse.json(careerPath, { status: 200 });
  } catch (error: unknown) {
    console.error('Career path error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// Delete CareerPath
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Career path ID is required' }, { status: 400 });
    }

    // Check for associated career paths before deleting
    const associatedStudents = await prisma.studentCareerPath.findMany({
      where: { careerPathId: id }
    });
    
    if (associatedStudents.length > 0) {
      return NextResponse.json({ message: 'Cannot delete career path with associated students' }, { status: 409 });
    }

    await prisma.careerPath.delete({ where: { id } });
    return NextResponse.json({ message: 'Career path deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Career path error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
