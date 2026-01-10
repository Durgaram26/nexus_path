import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/student/mentor-talks/[id]/register - Register for mentor talk
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talkId = id;
    // TODO: Get student ID from JWT token
    const studentId = '1'; // Mock student ID

    console.log('📝 Registering student for mentor talk:', { talkId, studentId });

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

    // Check if student is already registered
    const existingAttendance = await prisma.mentorTalkAttendance.findUnique({
      where: {
        talkId_studentId: {
          talkId: talkId,
          studentId: studentId
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'You are already registered for this talk' },
        { status: 400 }
      );
    }

    // Check if talk has reached max attendees
    if (talk.maxAttendees && talk.currentAttendees >= talk.maxAttendees) {
      return NextResponse.json(
        { success: false, message: 'This talk has reached maximum capacity' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await prisma.mentorTalkAttendance.create({
      data: {
        talkId: talkId,
        studentId: studentId,
        status: 'registered'
      }
    });

    // Update talk's current attendees count
    await prisma.mentorTalk.update({
      where: { id: talkId },
      data: {
        currentAttendees: {
          increment: 1
        }
      }
    });

    console.log('✅ Student registered for mentor talk successfully');

    return NextResponse.json({
      success: true,
      attendance: attendance,
      message: 'Successfully registered for the mentor talk'
    });
  } catch (error) {
    console.error('❌ Error registering for mentor talk:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register for mentor talk' },
      { status: 500 }
    );
  }
}
