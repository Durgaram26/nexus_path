import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/faculty/courses/[id] - Fetch specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;
    console.log('🔍 Fetching course with ID:', courseId);
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: true,
        enrollments: {
          include: {
            student: true
          }
        },
        assignments: true
      }
    });
    
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Course found:', course.title);
    return NextResponse.json({
      success: true,
      course: course
    });
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// DELETE /api/faculty/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;
    console.log('🗑️ Deleting course with ID:', courseId);
    
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      console.log('❌ Course not found for deletion:', courseId);
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Delete course (this will cascade delete enrollments and assignments)
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    console.log('✅ Course deleted successfully:', courseId);
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
