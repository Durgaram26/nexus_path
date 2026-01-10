import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

console.log('📦 API MODULE LOADED - /learning/roadmap/manual');
const prisma = new PrismaClient();
console.log('🗄️ Prisma client initialized');

export async function POST(request: NextRequest) {
  console.log('🚀 API ROUTE CALLED - /learning/roadmap/manual');
  try {
    console.log('=== ROADMAP CREATION START ===');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token length:', token.length);
    
    const decoded = verifyToken(token);
    console.log('Token decoded:', !!decoded);
    
    if (!decoded?.userId) {
      console.log('No userId in decoded token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received roadmap data:', JSON.stringify(body, null, 2));
    
    const {
      title,
      description,
      careerPath,
      department,
      year,
      totalDuration,
      semesters
    } = body;

    // Validate required fields
    if (!title || !careerPath || !department || !semesters || semesters.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, careerPath, department, and semesters are required' 
      }, { status: 400 });
    }

    // Get user first to get email, then find faculty by email
    console.log('Looking for user with userId:', decoded.userId);
    let user, faculty;
    
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { email: true }
      });
      console.log('User lookup result:', user ? 'Found' : 'Not found');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      console.log('Looking for faculty with email:', user.email);
      faculty = await prisma.faculty.findUnique({
        where: { email: user.email },
        include: { department: true }
      });
      console.log('Faculty lookup result:', faculty ? 'Found' : 'Not found');
    } catch (dbError) {
      console.error('Database error during user/faculty lookup:', dbError);
      throw dbError;
    }

    console.log('Faculty found:', faculty ? 'Yes' : 'No');
    if (faculty) {
      console.log('Faculty ID:', faculty.id);
    }

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Create the roadmap
    console.log('Creating roadmap with data:', {
      title,
      careerPath,
      department,
      year,
      createdBy: decoded.userId,
      isAIGenerated: false,
      semestersCount: semesters.length
    });
    
    try {
      const roadmap = await prisma.roadmap.create({
      data: {
        title,
        description,
        totalDuration,
        year,
        careerPath,
        department,
        createdBy: String(decoded.userId),
        isAIGenerated: false, // Manual creation
        milestones: JSON.stringify(semesters.map((semester: any) => ({
          id: semester.id,
          title: semester.title,
          description: semester.description,
          number: semester.number,
          activities: semester.activities.map((activity: any) => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            timeline: activity.timeline,
            tool: activity.tool,
            link: activity.link,
            outcome: activity.outcome,
            category: activity.category
          }))
        }))),
        learningPath: `Manual roadmap for ${careerPath} in ${department}`,
        careerOutcomes: JSON.stringify([
          `Master ${careerPath} fundamentals`,
          `Develop practical skills through projects`,
          `Build professional portfolio`,
          `Prepare for industry opportunities`
        ])
      },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Roadmap created successfully with ID:', roadmap.id);
    
    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        totalDuration: roadmap.totalDuration,
        year: roadmap.year,
        careerPath: roadmap.careerPath,
        department: roadmap.department,
        studentLevel: 'beginner', // Default for manual roadmaps
        milestones: JSON.parse(roadmap.milestones),
        learningPath: roadmap.learningPath,
        careerOutcomes: JSON.parse(roadmap.careerOutcomes),
        createdAt: roadmap.createdAt.toISOString(),
        createdBy: roadmap.createdByUser
      }
    });
    
    } catch (createError) {
      console.error('Database error during roadmap creation:', createError);
      throw createError;
    }

  } catch (error) {
    console.error('Error creating manual roadmap:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to create roadmap',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const careerPath = searchParams.get('careerPath');
    const department = searchParams.get('department');
    const year = searchParams.get('year');

    // Get user first to get email, then find faculty by email
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { email: user.email }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Build filter conditions
    const where: any = {
      createdBy: faculty.id,
      isAIGenerated: false // Only manual roadmaps
    };

    if (careerPath) {
      where.careerPath = { contains: careerPath, mode: 'insensitive' };
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (year) {
      where.year = parseInt(year);
    }

    // Get roadmaps with pagination
    const [roadmaps, total] = await Promise.all([
      prisma.roadmap.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.roadmap.count({ where })
    ]);

    const formattedRoadmaps = roadmaps.map(roadmap => ({
      id: roadmap.id,
      title: roadmap.title,
      description: roadmap.description,
      totalDuration: roadmap.totalDuration,
      year: roadmap.year,
      careerPath: roadmap.careerPath,
      department: roadmap.department,
      studentLevel: 'beginner',
      milestones: JSON.parse(roadmap.milestones),
      learningPath: roadmap.learningPath,
      careerOutcomes: JSON.parse(roadmap.careerOutcomes),
      createdAt: roadmap.createdAt.toISOString(),
      createdBy: roadmap.createdByUser
    }));

    return NextResponse.json({
      success: true,
      roadmaps: formattedRoadmaps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching manual roadmaps:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch roadmaps',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
