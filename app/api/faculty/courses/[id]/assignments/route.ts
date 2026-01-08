import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for courses (in a real app, this would be a database)
let courses: any[] = [];

// GET /api/faculty/courses/[id]/assignments - Fetch course assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    const course = courses.find(c => c.id === courseId);
    
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
