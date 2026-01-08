import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 API ROUTE CALLED - /learning/roadmap-details/[id]');
    const { id } = await params;
    console.log('Roadmap ID:', id);
    
    // Verify authentication
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token from header:', !!token);
    
    if (!token) {
      token = request.cookies.get('access_token')?.value;
      console.log('Token from cookie:', !!token);
    }
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin' && decoded.role !== 'student')) {
      console.log('Unauthorized - role:', decoded?.role);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const roadmapId = parseInt(id);
    
    if (isNaN(roadmapId)) {
      return NextResponse.json({ message: 'Invalid roadmap ID' }, { status: 400 });
    }

    // Get roadmap details
    console.log('Fetching roadmap with ID:', roadmapId);
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
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

    console.log('Roadmap found:', !!roadmap);
    if (!roadmap) {
      console.log('Roadmap not found for ID:', roadmapId);
      return NextResponse.json({ message: 'Roadmap not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedRoadmap = {
      ...roadmap,
      milestones: roadmap.milestones ? JSON.parse(roadmap.milestones) : [],
      careerOutcomes: roadmap.careerOutcomes ? JSON.parse(roadmap.careerOutcomes) : [],
      createdBy: roadmap.createdByUser || { 
        id: roadmap.createdBy, 
        firstName: 'Unknown', 
        lastName: 'User', 
        email: 'unknown@example.com' 
      }
    };

    console.log('Returning roadmap:', parsedRoadmap.title);
    return NextResponse.json({ roadmap: parsedRoadmap });

  } catch (error: unknown) {
    console.error('Error fetching roadmap details:', error);
    return NextResponse.json({ 
      message: 'Failed to fetch roadmap details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
