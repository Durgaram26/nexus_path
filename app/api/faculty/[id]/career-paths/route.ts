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

// Helper to parse and validate faculty ID
function parseFacultyId(id: string): string | null {
  return id && id.length > 0 ? id : null;
}

// GET - Get career paths assigned to a faculty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const facultyId = parseFacultyId(id);
    if (facultyId === null) {
      return NextResponse.json({ message: 'Invalid faculty ID' }, { status: 400 });
    }

    const careerPaths = await prisma.facultyCareerPath.findMany({
      where: { facultyId },
      include: {
        careerPath: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json(careerPaths, { status: 200 });
  } catch (error) {
    console.error('GET /faculty/[id]/career-paths error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Assign career paths to a faculty
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const facultyId = parseFacultyId(id);
    if (facultyId === null) {
      return NextResponse.json({ message: 'Invalid faculty ID' }, { status: 400 });
    }

    const { careerPathId } = await request.json();

    if (!careerPathId || typeof careerPathId !== 'string') {
      return NextResponse.json({ message: 'Valid career path ID is required' }, { status: 400 });
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
    }

    // Check if career path exists
    const careerPath = await prisma.careerPath.findUnique({ where: { id: careerPathId } });
    if (!careerPath) {
      return NextResponse.json({ message: 'Career path not found' }, { status: 404 });
    }

    // Check if already assigned
    const existing = await prisma.facultyCareerPath.findFirst({
      where: { facultyId, careerPathId },
    });

    if (existing) {
      return NextResponse.json({ message: 'Career path already assigned to this faculty' }, { status: 409 });
    }

    // Assign career path
    const assignment = await prisma.facultyCareerPath.create({
      data: {
        facultyId,
        careerPathId,
      },
      include: {
        careerPath: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('POST /faculty/[id]/career-paths error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Remove a career path from a faculty
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const facultyId = parseFacultyId(id);
    if (facultyId === null) {
      return NextResponse.json({ message: 'Invalid faculty ID' }, { status: 400 });
    }

    const { careerPathId } = await request.json();

    if (!careerPathId || typeof careerPathId !== 'string') {
      return NextResponse.json({ message: 'Valid career path ID is required' }, { status: 400 });
    }

    // Delete only the specific assignment
    const deleted = await prisma.facultyCareerPath.deleteMany({
      where: {
        facultyId,
        careerPathId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ message: 'No assignment found to delete' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Career path removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /faculty/[id]/career-paths error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}