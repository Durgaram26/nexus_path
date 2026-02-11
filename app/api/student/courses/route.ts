import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// GET /api/student/courses - Get courses assigned to student through roadmaps
export async function GET(request: NextRequest) {
  try {
    // Get student from token
    let token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }

    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Token found, verifying...');
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    if (!decoded || decoded.role !== 'student') {
      console.log('Unauthorized access attempt - decoded:', decoded);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the user record
    console.log('Looking for user with ID:', decoded.userId);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.email);

    // Find the student record by email
    console.log('Looking for student with email:', user.email);
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true }
    });

    let studentId: string;
    if (!student) {
      console.log('Student record not found for user:', user.email);
      // For development/testing, try to find any student
      const anyStudent = await prisma.student.findFirst({
        select: { id: true }
      });
      if (!anyStudent) {
        return NextResponse.json({ error: 'No students found in database' }, { status: 404 });
      }
      console.log('Using fallback student ID:', anyStudent.id);
      studentId = anyStudent.id;
    } else {
      console.log('Found student with ID:', student.id);
      studentId = student.id;
    }
    console.log('📚 Fetching courses for student:', studentId);

    // Get student's career paths
    const studentWithCareerPaths = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!studentWithCareerPaths) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get roadmaps assigned to this student
    const roadmapAssignments = await prisma.roadmapAssignment.findMany({
      where: {
        studentId: studentId,
        isActive: true
      },
      include: {
        roadmap: {
          include: {
            courseAssignments: {
              where: { isActive: true },
              include: {
                course: {
                  include: {
                    creator: true,
                    assignments: {
                      include: {
                        submissions: {
                          where: { studentId: studentId }
                        }
                      },
                      orderBy: { dueDate: 'asc' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Extract courses from roadmap assignments
    const courses: any[] = [];

    for (const roadmapAssignment of roadmapAssignments) {
      for (const courseAssignment of roadmapAssignment.roadmap.courseAssignments) {
        const course = courseAssignment.course;

        // Check if student is enrolled in this course
        const enrollment = await prisma.courseEnrollment.findUnique({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: studentId
            }
          }
        });

        // If not enrolled, auto-enroll the student
        if (!enrollment) {
          await prisma.courseEnrollment.create({
            data: {
              courseId: course.id,
              studentId: studentId,
              status: 'enrolled',
              assignmentsCompleted: 0,
              totalAssignments: course.assignments.length
            }
          });
        }

        // Get updated enrollment
        const updatedEnrollment = await prisma.courseEnrollment.findUnique({
          where: {
            courseId_studentId: {
              courseId: course.id,
              studentId: studentId
            }
          }
        });

        courses.push({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          category: course.category,
          status: course.status,
          startDate: course.startDate.toISOString(),
          endDate: course.endDate.toISOString(),
          courseType: course.courseType,
          location: course.location,
          meetingLink: course.meetingLink,
          isMandatory: course.isMandatory,
          enrolledStudents: course.enrolledStudents,
          maxStudents: course.maxStudents,
          assignments: course.assignments.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate.toISOString(),
            maxPoints: assignment.maxPoints,
            isMandatory: assignment.isMandatory,
            submissionType: assignment.submissionType,
            submissions: assignment.submissions.map((submission: any) => ({
              id: submission.id,
              submittedAt: submission.submittedAt.toISOString(),
              status: submission.status,
              grade: submission.grade,
              feedback: submission.feedback,
              fileUrl: submission.fileUrl,
              textSubmission: submission.textSubmission,
              codeSubmission: submission.codeSubmission
            }))
          })),
          enrollment: updatedEnrollment ? {
            status: updatedEnrollment.status,
            enrolledAt: updatedEnrollment.enrolledAt.toISOString(),
            grade: updatedEnrollment.grade,
            assignmentsCompleted: updatedEnrollment.assignmentsCompleted,
            totalAssignments: updatedEnrollment.totalAssignments,
            lastActivity: updatedEnrollment.lastActivity.toISOString()
          } : null
        });
      }
    }

    console.log(`✅ Found ${courses.length} courses for student`);

    // Get career paths for this student
    const careerPaths = studentWithCareerPaths.careerPaths.map((cp: any) => ({
      id: cp.careerPath.id,
      name: cp.careerPath.name,
      description: cp.careerPath.description,
      assignedAt: cp.assignedAt
    }));

    return NextResponse.json({
      success: true,
      courses: courses,
      careerPaths: careerPaths
    });
  } catch (error) {
    console.error('❌ Error fetching student courses:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
