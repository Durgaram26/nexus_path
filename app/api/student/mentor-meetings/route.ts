import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/mentor-meetings - Get mentor meetings for student
export async function GET(request: NextRequest) {
  try {
    // TODO: Get student ID from JWT token
    const studentId = 1; // Mock student ID

    console.log('📅 Fetching mentor meetings for student:', studentId);

    const meetings = await prisma.mentorTalk.findMany({
      where: {
        createdAt: undefined // MentorTalk doesn't have studentId, using attendance instead
      },
      include: {
        createdByFaculty: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      meetingType: meeting.mode,
      scheduledAt: meeting.scheduledDate.toISOString(),
      duration: undefined,
      meetingLink: meeting.meetingLink,
      location: meeting.venue,
      status: meeting.status,
      agenda: meeting.topic,
      notes: undefined,
      feedback: meeting.feedback,
      studentFeedback: undefined,
      rating: undefined,
      mentor: meeting.createdByFaculty
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
