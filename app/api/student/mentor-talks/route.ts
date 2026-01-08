import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/mentor-talks - Get mentor talks for student
export async function GET(request: NextRequest) {
  try {
    // TODO: Get student ID from JWT token
    const studentId = 1; // Mock student ID

    console.log('🎤 Fetching mentor talks for student:', studentId);

    // Simple query without complex relations
    const talks = await prisma.mentorTalk.findMany({
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    const transformedTalks = talks.map(talk => ({
      id: talk.id,
      title: talk.title,
      speakerName: talk.speakerName,
      company: talk.company,
      designation: talk.designation,
      topic: talk.topic,
      description: talk.description,
      scheduledDate: talk.scheduledDate.toISOString(),
      scheduledTime: talk.scheduledTime,
      mode: talk.mode,
      meetingLink: talk.meetingLink,
      venue: talk.venue,
      maxAttendees: talk.maxAttendees,
      currentAttendees: talk.currentAttendees,
      status: talk.status,
      assignedTo: talk.assignedTo,
      isRegistered: false, // Will implement later
      feedback: null // Will implement later
    }));

    console.log(`✅ Found ${talks.length} mentor talks for student`);

    return NextResponse.json({
      success: true,
      talks: transformedTalks
    });
  } catch (error) {
    console.error('❌ Error fetching student mentor talks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mentor talks' },
      { status: 500 }
    );
  }
}
