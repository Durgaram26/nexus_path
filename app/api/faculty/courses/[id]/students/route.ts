import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/faculty/courses/[id]/students - Fetch course students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;

    // Fetch students enrolled in this course from database
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        courseId: courseId
      },
      include: {
        student: true
      }
    });

    // Transform to match frontend expectations
    const students = enrollments.map((enrollment: any) => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      phone: enrollment.student.phoneNumber,
      studentId: enrollment.student.registerNumber,
      enrollmentDate: enrollment.enrolledAt.toISOString(),
      status: enrollment.status,
      grade: enrollment.grade,
      assignmentsCompleted: enrollment.assignmentsCompleted,
      totalAssignments: enrollment.totalAssignments,
      lastActivity: enrollment.lastActivity.toISOString(),
      attendance: enrollment.attendance
    }));

    return NextResponse.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/faculty/courses/[id]/students - Add student to course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = id;
    const body = await request.json();

    // First, find or create the student
    let student = await prisma.student.findUnique({
      where: { email: body.email }
    });

    if (!student) {
      // Create new student if doesn't exist
      student = await prisma.student.create({
        data: {
          name: body.name,
          email: body.email,
          phoneNumber: body.phone || '',
          registerNumber: body.studentId,
          gender: 'OTHER', // Default gender
          departmentId: '1', // TODO: Get from context
          year: 1 // TODO: Get from context
        }
      });
    }

    // Create course enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: courseId,
        studentId: student.id,
        status: body.status || 'enrolled',
        grade: body.grade,
        assignmentsCompleted: body.assignmentsCompleted || 0,
        totalAssignments: body.totalAssignments || 0
      },
      include: {
        student: true
      }
    });

    // Update course enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledStudents: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      student: {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        phone: enrollment.student.phoneNumber,
        studentId: enrollment.student.registerNumber,
        enrollmentDate: enrollment.enrolledAt.toISOString(),
        status: enrollment.status,
        grade: enrollment.grade,
        assignmentsCompleted: enrollment.assignmentsCompleted,
        totalAssignments: enrollment.totalAssignments,
        lastActivity: enrollment.lastActivity.toISOString()
      },
      message: 'Student added to course successfully'
    });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add student' },
      { status: 500 }
    );
  }
}
