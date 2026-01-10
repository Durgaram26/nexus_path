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

// GET - Get faculty profile
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'faculty') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email: (payload as any).email },
      include: {
        department: {
          include: {
            college: true
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json(faculty, { status: 200 });
  } catch (error) {
    console.error('GET /api/faculty/profile error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// PUT - Update faculty profile
export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'faculty') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, gender, phoneNumber } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      return NextResponse.json({ message: 'Invalid gender value' }, { status: 400 });
    }

    // Update faculty profile
    const updatedFaculty = await prisma.faculty.update({
      where: { email: (payload as any).email },
      data: {
        name,
        gender: gender || undefined,
        phoneNumber: phoneNumber || null
      },
      include: {
        department: {
          include: {
            college: true
          }
        }
      }
    });

    return NextResponse.json(updatedFaculty, { status: 200 });
  } catch (error) {
    console.error('PUT /api/faculty/profile error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
