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

// PUT - Update assigned years for a faculty
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
    
    const facultyId = id;
    if (!facultyId) {
      return NextResponse.json({ message: 'Invalid faculty ID' }, { status: 400 });
    }

    const { assignedYears } = await request.json();

    // assignedYears can be null (all years) or a comma-separated string like "1,2,3"
    if (assignedYears !== null && typeof assignedYears !== 'string') {
      return NextResponse.json({ message: 'Assigned years must be a string or null' }, { status: 400 });
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
    }

    // Update assigned years
    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data: { assignedYears }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/faculty/[id]/years error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}