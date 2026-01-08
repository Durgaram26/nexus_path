import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Mandatory workshops API called');
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'student') {
      console.log('Invalid token or not a student:', payload);
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    console.log('Token verified, userId:', payload.userId);

    // Get mandatory workshops
    console.log('Fetching workshops from database...');
    let workshops = [];
    try {
      workshops = await prisma.workshop.findMany({
        where: {
          isMandatory: true,
          status: {
            in: ['upcoming', 'ongoing']
          }
        },
        include: {
          creator: {
            select: {
              name: true,
              email: true
            }
          },
          enrollments: {
            where: {
              studentId: payload.userId
            },
            select: {
              status: true,
              enrolledAt: true,
              completedAt: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If there's a database error (like table doesn't exist), return empty array
      workshops = [];
    }

    console.log('Found workshops:', workshops.length);

    // Transform workshops to match the format expected by certificate submission
    const mandatoryCourses = workshops.map(workshop => ({
      title: workshop.title,
      description: workshop.description,
      category: 'workshops',
      provider: workshop.instructor,
      link: '', // Workshops don't have external links
      isMandatory: true,
      workshopId: workshop.id,
      startDate: workshop.startDate,
      endDate: workshop.endDate,
      location: workshop.location,
      level: workshop.level,
      duration: workshop.duration,
      enrollmentStatus: workshop.enrollments[0]?.status || 'not-enrolled'
    }));

    console.log('Transformed mandatory courses:', mandatoryCourses);

    return NextResponse.json({
      success: true,
      mandatoryCourses
    });

  } catch (error) {
    console.error('Error fetching mandatory workshops:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch mandatory workshops',
      details: error.message
    }, { status: 500 });
  }
}
