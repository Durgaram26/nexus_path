import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/mentor-meetings - Get mentor meetings for student
export async function GET(request: NextRequest) {
  try {
    // TODO: Get student ID from JWT token
    const studentId = 1; // Mock student ID

    console.log('📅 Fetching mentor meetings for student:', studentId);

    const meetings = await prisma.mentorMeeting.findMany({
      where: {
        studentId: studentId
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            company: true,
            position: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    });

    const transformedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      meetingType: meeting.meetingType,
      scheduledAt: meeting.scheduledAt.toISOString(),
      duration: meeting.duration,
      meetingLink: meeting.meetingLink,
      location: meeting.location,
      status: meeting.status,
      agenda: meeting.agenda,
      notes: meeting.notes,
      feedback: meeting.feedback,
      studentFeedback: meeting.studentFeedback,
      rating: meeting.rating,
      mentor: meeting.mentor
    }));

    console.log(`✅ Found ${meetings.length} meetings for student`);

    return NextResponse.json({
      success: true,
      meetings: transformedMeetings
    });
  } catch (error) {
    console.error('❌ Error fetching student meetings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
