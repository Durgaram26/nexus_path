import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/faculty/mentor-talks/[id] - Update mentor talk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talkId = params.id;
    
    if (!talkId || isNaN(parseInt(talkId))) {
      return NextResponse.json(
        { success: false, message: 'Invalid talk ID' },
        { status: 400 }
      );
    }

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

    console.log('🎤 Updating mentor talk:', { id: talkId, title, speakerName, company });

    // Validate required fields
    if (!title || !speakerName || !company || !topic || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if talk exists
    const existingTalk = await prisma.mentorTalk.findUnique({
      where: { id: parseInt(talkId) }
    });

    if (!existingTalk) {
      return NextResponse.json(
        { success: false, message: 'Mentor talk not found' },
        { status: 404 }
      );
    }

    // Update mentor talk
    const talk = await prisma.mentorTalk.update({
      where: { id: parseInt(talkId) },
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
        assignedTo: assignedTo || null
      }
    });

    console.log('✅ Mentor talk updated successfully:', talk.id);

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
      message: 'Mentor talk updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating mentor talk:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update mentor talk',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/faculty/mentor-talks/[id] - Delete mentor talk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talkId = params.id;
    
    if (!talkId || isNaN(parseInt(talkId))) {
      return NextResponse.json(
        { success: false, message: 'Invalid talk ID' },
        { status: 400 }
      );
    }

    console.log('🎤 Deleting mentor talk:', { id: talkId });

    // Check if talk exists
    const existingTalk = await prisma.mentorTalk.findUnique({
      where: { id: parseInt(talkId) }
    });

    if (!existingTalk) {
      return NextResponse.json(
        { success: false, message: 'Mentor talk not found' },
        { status: 404 }
      );
    }

    // Delete mentor talk (this will cascade delete related records)
    await prisma.mentorTalk.delete({
      where: { id: parseInt(talkId) }
    });

    console.log('✅ Mentor talk deleted successfully:', talkId);

    return NextResponse.json({
      success: true,
      message: 'Mentor talk deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting mentor talk:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete mentor talk',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}
