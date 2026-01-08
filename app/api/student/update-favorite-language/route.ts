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

// PUT - Update favorite language
export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { favoriteLanguage } = await request.json();

    if (!favoriteLanguage) {
      return NextResponse.json({ message: 'Favorite language is required' }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: (payload as any).userId },
      data: {
        favoriteLanguage: favoriteLanguage
      },
      include: {
        department: {
          include: {
            college: true
          }
        },
        careerPaths: {
          include: {
            careerPath: true,
            assignedByUser: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('PUT /api/student/update-favorite-language error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
