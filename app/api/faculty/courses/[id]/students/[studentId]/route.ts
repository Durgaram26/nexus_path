import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/faculty/courses/[id]/students/[studentId] - Remove student from course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id, studentId: studentIdStr } = await params;
    const courseId = parseInt(id);
    const studentId = parseInt(studentIdStr);
    
    // In a real app, you would remove the student from the course enrollment
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Student removed from course successfully'
    });
  } catch (error) {
    console.error('Error removing student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove student' },
      { status: 500 }
    );
  }
}
