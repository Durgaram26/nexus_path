import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for courses (in a real app, this would be a database)
const courses: any[] = [];

// DELETE /api/faculty/courses/[id]/assignments/[assignmentId] - Delete assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { id, assignmentId } = await params;
    const courseId = parseInt(id);
    const assignmentIdNum = parseInt(assignmentId);
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    const assignmentIndex = course.assignments.findIndex((a: any) => a.id === assignmentIdNum);
    if (assignmentIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Assignment not found' },
        { status: 404 }
      );
    }
    
    // Remove assignment from course
    course.assignments.splice(assignmentIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
