import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/faculty/mentor-talks - Get all mentor talks
export async function GET(request: NextRequest) {
  try {
    console.log('🎤 Fetching mentor talks...');

    // First, try a simple query without relations
    const talks = await prisma.mentorTalk.findMany({
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    console.log(`✅ Found ${talks.length} mentor talks`);

    // Transform the data to include basic info
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
      createdAt: talk.createdAt.toISOString(),
      updatedAt: talk.updatedAt.toISOString(),
      // Add empty arrays for now to avoid relation errors
      attendees: [],
      feedback: []
    }));

    return NextResponse.json({
      success: true,
      talks: transformedTalks
    });
  } catch (error) {
    console.error('❌ Error fetching mentor talks:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch mentor talks',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// POST /api/faculty/mentor-talks - Create new mentor talk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      speakerName,
      company,
      designation,
      topic,
      description,
      scheduledDate,
      scheduledTime,
      mode,
      meetingLink,
      venue,
      maxAttendees,
      assignedTo
    } = body;

    console.log('🎤 Creating mentor talk:', { title, speakerName, company });

    // TODO: Get faculty ID from JWT token
    // For now, find the first faculty member or create a default one
    let facultyId = '1';
    
    try {
      const faculty = await prisma.faculty.findFirst();
      if (faculty) {
        facultyId = faculty.id;
      } else {
        // Create a default faculty member if none exists
        const defaultFaculty = await prisma.faculty.create({
          data: {
            name: 'Default Faculty',
            email: 'faculty@example.com',
            gender: 'OTHER',
            departmentId: '1'
          }
        });
        facultyId = defaultFaculty.id;
      }
    } catch (facultyError) {
      console.log('Using default faculty ID:', facultyId);
    }

    // Validate required fields
    if (!title || !speakerName || !company || !topic || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new mentor talk
    const talk = await prisma.mentorTalk.create({
      data: {
        title,
        speakerName,
        company,
        designation: designation || '',
        topic,
        description: description || null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        mode: mode || 'online',
        meetingLink: mode === 'online' ? meetingLink : null,
        venue: mode === 'offline' ? venue : null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        assignedTo: assignedTo || null,
        createdBy: facultyId
      }
    });

    console.log('✅ Mentor talk created successfully:', talk.id);

    return NextResponse.json({
      success: true,
      talk: {
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
        createdAt: talk.createdAt.toISOString(),
        updatedAt: talk.updatedAt.toISOString()
      },
      message: 'Mentor talk created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating mentor talk:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create mentor talk',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

