import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// PUT - Update student's favorite programming language
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/student/favorite-language - Request received');
    
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload) {
      console.log('No payload found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!['student'].includes((payload as any).role)) {
      console.log('Authentication failed - invalid role:', (payload as any).role);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get the request body
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    const { favoriteLanguage } = requestBody;

    // Validate the favorite language
    if (!favoriteLanguage || typeof favoriteLanguage !== 'string') {
      return NextResponse.json(
        { message: 'Valid favorite language is required' },
        { status: 400 }
      );
    }

    // Validate that it's a supported programming language
    const supportedLanguages = [
      'Python 3',
      'Java',
      'C++',
      'C',
      'JavaScript',
      'TypeScript',
      'PHP',
      'Ruby',
      'Rust',
      'Go',
      'Swift',
      'Kotlin'
    ];

    if (!supportedLanguages.includes(favoriteLanguage)) {
      return NextResponse.json(
        { message: 'Unsupported programming language' },
        { status: 400 }
      );
    }

    // Get the user first to get their email
    const user = await prisma.user.findUnique({
      where: { id: parseInt((payload as any).userId) }
    });
    
    if (!user) {
      console.log('User not found for ID:', (payload as any).userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find the student by email
    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });
    
    if (!student) {
      console.log('Student not found for email:', user.email);
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Update the student's favorite language
    const updatedStudent = await prisma.student.update({
      where: {
        id: student.id
      },
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
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Favorite language updated successfully',
      student: updatedStudent
    });

  } catch (error: unknown) {
    console.error('Error updating favorite language:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - Get student's current favorite language
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/student/favorite-language - Request received');
    
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload) {
      console.log('No payload found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!['student'].includes((payload as any).role)) {
      console.log('Authentication failed - invalid role:', (payload as any).role);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get the user first to get their email
    const user = await prisma.user.findUnique({
      where: { id: parseInt((payload as any).userId) }
    });
    
    if (!user) {
      console.log('User not found for ID:', (payload as any).userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find the student by email
    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });
    
    if (!student) {
      console.log('Student not found for email:', user.email);
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      favoriteLanguage: student.favoriteLanguage
    });

  } catch (error: unknown) {
    console.error('Error fetching favorite language:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}