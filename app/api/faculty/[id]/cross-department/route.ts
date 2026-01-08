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

// Helper to safely parse faculty ID (assuming it's a number)
function parseFacultyId(id: string): number | null {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

// PUT - Update cross-department permissions for a faculty
export async function PUT(
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

    const { canAssignCrossDepartment } = await request.json();

    // Validate input
    if (typeof canAssignCrossDepartment !== 'boolean') {
      return NextResponse.json(
        { message: 'canAssignCrossDepartment must be a boolean' },
        { status: 400 }
      );
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
    }

    // Update cross-department permission
    const updatedFaculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        canAssignCrossDepartment, // Direct boolean assignment
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(updatedFaculty, { status: 200 });
  } catch (error) {
    console.error('PUT /faculty/[id]/cross-department error:', error);
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}