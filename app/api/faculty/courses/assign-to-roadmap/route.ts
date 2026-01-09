import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/faculty/courses/assign-to-roadmap - Assign course to roadmap
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, roadmapId, notes } = body;

    console.log('🔗 Assigning course to roadmap:', { courseId, roadmapId });

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { creator: true }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if roadmap exists
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId }
    });

    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.courseRoadmapAssignment.findUnique({
      where: {
        courseId_roadmapId: {
          courseId: courseId,
          roadmapId: roadmapId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: 'Course is already assigned to this roadmap' },
        { status: 400 }
      );
    }

    // Create the assignment
    const assignment = await prisma.courseRoadmapAssignment.create({
      data: {
        courseId: courseId,
        roadmapId: roadmapId,
        assignedBy: course.createdBy,
        notes: notes || null
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            instructor: true,
            duration: true,
            level: true,
            category: true
          }
        },
        roadmap: {
          select: {
            id: true,
            title: true,
            description: true,
            careerPath: true,
            department: true
          }
        },
        assignedByFaculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Course assigned to roadmap successfully');

    return NextResponse.json({
      success: true,
      assignment: assignment,
      message: 'Course assigned to roadmap successfully'
    });
  } catch (error) {
    console.error('❌ Error assigning course to roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to assign course to roadmap' },
      { status: 500 }
    );
  }
}

// GET /api/faculty/courses/assign-to-roadmap - Get available roadmaps for assignment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { 
        creator: {
          include: { department: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all roadmaps that match the course criteria
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        department: course.creator.department.name, // Match department
        year: { lte: course.level === 'beginner' ? 1 : course.level === 'intermediate' ? 2 : 3 }
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        courseAssignments: {
          where: { courseId: parseInt(courseId) },
          select: { id: true, isActive: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out roadmaps that already have this course assigned
    const availableRoadmaps = roadmaps.filter(roadmap => 
      roadmap.courseAssignments.length === 0
    );

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        level: course.level,
        category: course.category
      },
      roadmaps: availableRoadmaps.map(roadmap => ({
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        careerPath: roadmap.careerPath,
        department: roadmap.department,
        year: roadmap.year,
        studentLevel: roadmap.studentLevel,
        createdBy: roadmap.createdByUser,
        isAIGenerated: roadmap.isAIGenerated
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching roadmaps:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch roadmaps' },
      { status: 500 }
    );
  }
}
