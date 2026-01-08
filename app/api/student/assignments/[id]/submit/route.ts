import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/student/assignments/[id]/submit - Submit assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id);
    const body = await request.json();
    const { textSubmission, codeSubmission, submissionType } = body;

    // TODO: Get student ID from JWT token
    const studentId = 1; // Mock student ID

    console.log('📝 Submitting assignment:', { assignmentId, studentId });

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: assignment.courseId,
          studentId: studentId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if assignment is overdue
    const isOverdue = new Date() > assignment.dueDate;
    const status = isOverdue ? 'late' : 'submitted';

    // Create submission
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignmentId,
        studentId: studentId,
        status: status,
        textSubmission: textSubmission || null,
        codeSubmission: codeSubmission || null,
        fileUrl: null // TODO: Handle file uploads
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxPoints: true
          }
        }
      }
    });

    // Update course enrollment progress
    await prisma.courseEnrollment.update({
      where: {
        courseId_studentId: {
          courseId: assignment.courseId,
          studentId: studentId
        }
      },
      data: {
        assignmentsCompleted: {
          increment: 1
        },
        lastActivity: new Date()
      }
    });

    console.log('✅ Assignment submitted successfully');

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        submittedAt: submission.submittedAt.toISOString(),
        status: submission.status,
        textSubmission: submission.textSubmission,
        codeSubmission: submission.codeSubmission,
        fileUrl: submission.fileUrl
      },
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error submitting assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}
