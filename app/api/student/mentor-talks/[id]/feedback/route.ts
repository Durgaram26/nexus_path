import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/student/mentor-talks/[id]/feedback - Submit feedback for mentor talk
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talkId = parseInt(id);
    const body = await request.json();
    const { rating, feedback } = body;
    
    // TODO: Get student ID from JWT token
    const studentId = 1; // Mock student ID

    console.log('💬 Submitting feedback for mentor talk:', { talkId, studentId, rating });

    // Check if talk exists
    const talk = await prisma.mentorTalk.findUnique({
      where: { id: talkId }
    });

    if (!talk) {
      return NextResponse.json(
        { success: false, message: 'Mentor talk not found' },
        { status: 404 }
      );
    }

    // Check if student attended the talk
    const attendance = await prisma.mentorTalkAttendance.findUnique({
      where: {
        talkId_studentId: {
          talkId: talkId,
          studentId: studentId
        }
      }
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'You must be registered for this talk to provide feedback' },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.mentorTalkFeedback.findUnique({
      where: {
        talkId_studentId: {
          talkId: talkId,
          studentId: studentId
        }
      }
    });

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback already submitted for this talk' },
        { status: 400 }
      );
    }

    // Create feedback record
    const feedbackRecord = await prisma.mentorTalkFeedback.create({
      data: {
        talkId: talkId,
        studentId: studentId,
        rating: rating,
        feedback: feedback || null
      }
    });

    console.log('✅ Feedback submitted successfully');

    return NextResponse.json({
      success: true,
      feedback: feedbackRecord,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
