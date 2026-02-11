import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/faculty/mentors/assign - Assign mentor to students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignments } = body;

    console.log('👥 Assigning mentor to students:', assignments);

    // TODO: Get faculty ID from JWT token
    const facultyId = 1; // Mock faculty ID

    // Validate assignments
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid assignments data' },
        { status: 400 }
      );
    }

    // Check if mentor exists and has capacity
    const mentorId = assignments[0].mentorId;
    const mentor = await prisma.industryMentor.findUnique({
      where: { id: mentorId }
    });

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Get current number of students assigned to this mentor
    const currentAssignmentCount = await prisma.industryMentorAssignment.count({
      where: {
        mentorId: mentorId,
        isActive: true
      }
    });

    if (currentAssignmentCount + assignments.length > mentor.maxStudents) {
      return NextResponse.json(
        { success: false, message: `Mentor can only handle ${mentor.maxStudents} students. Currently has ${currentAssignmentCount}.` },
        { status: 400 }
      );
    }

    // Check for existing assignments
    const existingAssignments = await prisma.industryMentorAssignment.findMany({
      where: {
        mentorId: mentorId,
        studentId: { in: assignments.map(a => a.studentId) },
        isActive: true
      }
    });

    if (existingAssignments.length > 0) {
      const existingStudentIds = existingAssignments.map((a: any) => a.studentId);
      return NextResponse.json(
        { success: false, message: `Some students already have active assignments with this mentor: ${existingStudentIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Create assignments
    const createdAssignments = await prisma.industryMentorAssignment.createMany({
      data: assignments.map(assignment => ({
        mentorId: assignment.mentorId,
        studentId: assignment.studentId,
        assignedBy: String(facultyId),
        goals: assignment.goals || null,
        notes: assignment.notes || null,
        startDate: new Date(assignment.startDate),
        endDate: assignment.endDate ? new Date(assignment.endDate) : null
      }))
    });

    // TODO: If needed to track student count, consider adding a field to IndustryMentor or use count queries
    // Update mentor assignment status
    // (Currently IndustryMentor doesn't have a currentStudents field)

    console.log(`✅ Created ${createdAssignments.count} mentor assignments`);

    return NextResponse.json({
      success: true,
      assignmentsCreated: createdAssignments.count,
      message: `Mentor assigned to ${assignments.length} students successfully`
    });
  } catch (error) {
    console.error('❌ Error assigning mentor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to assign mentor' },
      { status: 500 }
    );
  }
}
