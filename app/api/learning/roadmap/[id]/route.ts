import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 API ROUTE CALLED - /learning/roadmap/[id]');
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 API ROUTE CALLED - PUT /learning/roadmap/[id]');
    const { id } = await params;
    console.log('Roadmap ID:', id);
    
    // Verify authentication
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Token verification result:', decoded);
    
    if (!decoded || (decoded.role !== 'faculty' && decoded.role !== 'admin')) {
      console.log('Unauthorized access attempt:', { decoded, role: decoded?.role });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const roadmapId = parseInt(id);
    
    if (isNaN(roadmapId)) {
      return NextResponse.json({ message: 'Invalid roadmap ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, careerPath, department, year, totalDuration, semesters } = body;

    // Validate required fields
    if (!title || !careerPath || !department) {
      return NextResponse.json({ 
        message: 'Missing required fields: title, careerPath, department' 
      }, { status: 400 });
    }

    // Check if roadmap exists and belongs to the faculty
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { id: true, createdBy: true }
    });

    if (!existingRoadmap) {
      return NextResponse.json({ message: 'Roadmap not found' }, { status: 404 });
    }

    // Check if faculty owns this roadmap (unless admin)
    console.log('Checking ownership:', {
      decodedUserId: decoded.userId,
      decodedRole: decoded.role,
      roadmapCreatedBy: existingRoadmap.createdBy,
      userIdMatch: existingRoadmap.createdBy === decoded.userId
    });
    
    // Allow faculty to edit any roadmap (remove ownership restriction)
    // if (decoded.role === 'faculty' && existingRoadmap.createdBy !== decoded.userId) {
    //   console.log('Access denied: Faculty does not own this roadmap');
    //   return NextResponse.json({ message: 'You can only edit your own roadmaps' }, { status: 403 });
    // }

    // Update the roadmap
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: {
        title,
        description,
        careerPath,
        department,
        year: parseInt(year),
        totalDuration,
        milestones: JSON.stringify(semesters),
        createdBy: decoded.userId, // Transfer ownership to current user
        updatedAt: new Date()
      },
      include: {
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

    console.log('Roadmap updated successfully:', updatedRoadmap.title);

    return NextResponse.json({
      success: true,
      message: 'Roadmap updated successfully',
      roadmap: {
        ...updatedRoadmap,
        milestones: JSON.parse(updatedRoadmap.milestones),
        createdBy: updatedRoadmap.createdByUser
      }
    });

  } catch (error: unknown) {
    console.error('Error updating roadmap:', error);
    return NextResponse.json({ 
      message: 'Failed to update roadmap',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}