import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/faculty/courses/[id]/assignments - Fetch course assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { assignments: true }
    });
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      assignments: course.assignments || []
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/faculty/courses/[id]/assignments - Create a new assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;
    const body = await request.json();
    
    const { title, description, dueDate, maxPoints, isMandatory, submissionType } = body;
    
    // Validate required fields
    if (!title || !dueDate) {
      return NextResponse.json(
        { success: false, message: 'Title and due date are required' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        maxPoints: maxPoints || 100,
        isMandatory: isMandatory || false,
        submissionType: submissionType || 'file',
        courseId: courseId
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create assignment',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
