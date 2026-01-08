import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { GeminiAIService, type RoadmapRequest } from '@/lib/gemini-ai';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - check both Authorization header and cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { year, careerPath, department, studentLevel = 'beginner' } = body;

    // Validate required fields
    if (!year || !careerPath || !department) {
      return NextResponse.json({ 
        error: 'Missing required fields: year, careerPath, department' 
      }, { status: 400 });
    }

    // Generate roadmap using Gemini AI
        
    // Get faculty info for creator details
    const faculty = await prisma.faculty.findUnique({
      where: { email: decoded.email },
      include: { department: true }
    });

    if (!faculty) {
      return NextResponse.json({ 
        error: 'Faculty record not found' 
      }, { status: 404 });
    }

    const roadmapRequest: RoadmapRequest = {
      year: parseInt(year),
      careerPath,
      department: department,
      studentLevel
    };

    const geminiService = new GeminiAIService();
    const generatedRoadmap = await geminiService.generateRoadmap(roadmapRequest);

    // Generate learning resources for this roadmap
    const learningResources: any[] = [];

    // roadmap to database
    try {
      const savedRoadmap = await prisma.roadmap.create({
        data: {
          title: generatedRoadmap.title,
          description: generatedRoadmap.description,
          totalDuration: generatedRoadmap.totalDuration,
          year: parseInt(year),
          careerPath,
          department: department,
          studentLevel,
          milestones: JSON.stringify(generatedRoadmap.milestones),
          learningPath: generatedRoadmap.learningPath,
          careerOutcomes: JSON.stringify(generatedRoadmap.careerOutcomes),
          createdBy: parseInt(decoded.userId),
          createdAt: new Date(),
          updatedAt: new Date(),
          learningResources: {
            create: learningResources.map((resource: any) => ({
              title: resource.title,
              description: resource.description,
              url: resource.url,
              category: resource.category,
              difficulty: resource.difficulty,
              careerPath: careerPath
            }))
          }
        }
      });

      return NextResponse.json({
        success: true,
        roadmap: {
          id: savedRoadmap.id,
          ...generatedRoadmap,
          year: parseInt(year),
          careerPath,
          department,
          studentLevel,
          createdAt: savedRoadmap.createdAt.toISOString(),
          createdBy: {
            id: parseInt(decoded.userId),
            email: decoded.email,
            firstName: faculty.name?.split(' ')[0] || 'Faculty',
            lastName: faculty.name?.split(' ').slice(1).join(' ') || 'Member'
          }
        }
      });
    } catch (dbError) {
      console.error('Database :', dbError);
      // Return the generated roadmap even if database save fails
      return NextResponse.json({
        success: true,
        roadmap: {
          id: Date.now(), // Temporary ID
          ...generatedRoadmap,
          year: parseInt(year),
          careerPath,
          department: department,
          studentLevel,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: parseInt(decoded.userId),
            email: decoded.email,
            firstName: faculty.name?.split(' ')[0] || 'Faculty',
            lastName: faculty.name?.split(' ').slice(1).join(' ') || 'Member'
          }
        }
      });
    }

  } catch (error: unknown) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate roadmap',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - check both Authorization header and cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    console.log('Token found:', !!token);
    console.log('Token from header:', !!request.headers.get('authorization'));
    console.log('Token from cookie:', !!request.cookies.get('access_token')?.value);
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin' && decoded.role !== 'student')) {
      console.log('Unauthorized - decoded:', decoded, 'role:', decoded?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const careerPath = searchParams.get('careerPath');
    const department = searchParams.get('department');

    // Build query filters
    const where: any = {};
    if (year) where.year = parseInt(year);
    if (careerPath) where.careerPath = careerPath;
    if (department) where.department = department;

    // If user is faculty, only show their roadmaps
    if (decoded.role === 'faculty') {
      // Get faculty info to check both user ID and faculty ID
      const faculty = await prisma.faculty.findUnique({
        where: { email: decoded.email }
      });
      
      if (faculty) {
        // Show roadmaps created by either the user ID or faculty ID
        where.createdBy = { in: [parseInt(decoded.userId), faculty.id] };
      } else {
        where.createdBy = parseInt(decoded.userId);
      }
    }
    
    // If user is student, show roadmaps based on their career paths
    if (decoded.role === 'student') {
      // Get student's career paths to filter roadmaps
      const student = await prisma.student.findUnique({
        where: { email: decoded.email },
        include: { careerPaths: { include: { careerPath: true } } }
      });
            
      if (student && student.careerPaths.length > 0) {
        const careerPathNames = student.careerPaths.map(cp => cp.careerPath.name);
        where.careerPath = { in: careerPathNames };
      }
    }

    const roadmaps = await prisma.roadmap.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        totalDuration: true,
        year: true,
        careerPath: true,
        department: true,
        studentLevel: true,
        milestones: true,
        learningPath: true,
        careerOutcomes: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        createdByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Parse JSON fields for each roadmap
    const parsedRoadmaps = roadmaps.map(roadmap => ({
      ...roadmap,
      milestones: roadmap.milestones ? JSON.parse(roadmap.milestones) : [],
      careerOutcomes: roadmap.careerOutcomes ? JSON.parse(roadmap.careerOutcomes) : [],
      createdBy: (roadmap as any).createdByUser || { id: roadmap.createdBy, firstName: 'Unknown', lastName: 'User', email: 'unknown@example.com' }
    }));

    return NextResponse.json({ roadmaps: parsedRoadmaps });

  } catch (error: unknown) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch roadmaps',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication - check both Authorization header and cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get('id');
    
    if (!roadmapId) {
      return NextResponse.json({ error: 'Roadmap ID is required' }, { status: 400 });
    }

    // Check if roadmap exists and belongs to the faculty
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: parseInt(roadmapId) },
      select: { id: true, createdBy: true }
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    // Check if faculty owns this roadmap (unless admin)
    if (decoded.role === 'faculty') {
      // Get faculty info to check both user ID and faculty ID
      const faculty = await prisma.faculty.findUnique({
        where: { email: decoded.email }
      });
      
      if (faculty) {
        // Check if roadmap was created by either the user ID or faculty ID
        if (roadmap.createdBy !== parseInt(decoded.userId) && roadmap.createdBy !== faculty.id) {
          return NextResponse.json({ error: 'You can only delete your own roadmaps' }, { status: 403 });
        }
      } else {
        // Fallback to user ID check
        if (roadmap.createdBy !== parseInt(decoded.userId)) {
          return NextResponse.json({ error: 'You can only delete your own roadmaps' }, { status: 403 });
        }
      }
    }

    // Delete the roadmap
    await prisma.roadmap.delete({
      where: { id: parseInt(roadmapId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap deleted successfully' 
    });

  } catch (error: unknown) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json({ 
      error: 'Failed to delete roadmap',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
