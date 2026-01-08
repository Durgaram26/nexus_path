import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for submissions (in a real app, this would be a database)
let submissions: any[] = [];

// POST /api/faculty/assignments/submissions/[submissionId]/grade - Grade submission
export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = parseInt(params.submissionId);
    const body = await request.json();
    const { grade, feedback } = body;
    
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Update submission with grade and feedback
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    
    return NextResponse.json({
      success: true,
      message: 'Submission graded successfully',
      submission: submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}
