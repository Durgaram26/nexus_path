import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/courses-simple - Simple version without authentication
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Simple courses API called');

    // Get the first student for testing
    const student = await prisma.student.findFirst({
      select: { id: true, email: true, name: true }
    });

    if (!student) {
      return NextResponse.json({
        success: true,
        courses: [],
        careerPaths: [],
        message: 'No students found in database'
      });
    }

    console.log('Using student:', student.email);

    // Get student's career paths
    const studentWithCareerPaths = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        careerPaths: {
          include: {
            careerPath: true,
            assignedByUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // For now, let's get courses directly without roadmaps
    // This is a simplified approach that should work with existing data
    const courses: any[] = [];

    // Get all courses and create mock data for testing
    const allCourses = await prisma.course.findMany({
      include: {
        creator: true,
        assignments: {
          include: {
            submissions: {
              where: { studentId: student.id }
            }
          },
          orderBy: { dueDate: 'asc' }
        }
      },
      take: 5 // Limit to 5 courses for testing
    });

    for (const course of allCourses) {
      // Check if student is enrolled in this course
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: course.id,
            studentId: student.id
          }
        }
      });

      // If not enrolled, auto-enroll the student
      if (!enrollment) {
        await prisma.courseEnrollment.create({
          data: {
            courseId: course.id,
            studentId: student.id,
            status: 'enrolled',
            assignmentsCompleted: 0,
            totalAssignments: course.assignments.length
          }
        });

        // Update course enrolled students count
        await prisma.course.update({
          where: { id: course.id },
          data: {
            enrolledStudents: {
              increment: 1
            }
          }
        });
      }

      // Get updated enrollment
      const updatedEnrollment = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: course.id,
            studentId: student.id
          }
        }
      });

      // Get actual enrollment count for this course
      const actualEnrollmentCount = await prisma.courseEnrollment.count({
        where: { courseId: course.id }
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
        enrolledStudents: actualEnrollmentCount,
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

    // Get career paths for this student with faculty names
    const careerPathsWithFacultyNames = await Promise.all(
      (studentWithCareerPaths?.careerPaths || []).map(async (cp: any) => {
        let facultyName = null;

        if (cp.assignedByUser) {
          // Check if this user is a faculty member
          const faculty = await prisma.faculty.findUnique({
            where: { email: cp.assignedByUser.email },
            select: { name: true }
          });

          if (faculty) {
            facultyName = faculty.name;
          }
        }

        return {
          id: cp.careerPath.id,
          name: cp.careerPath.name,
          description: cp.careerPath.description,
          assignedAt: cp.assignedAt,
          assignedByUser: cp.assignedByUser ? {
            id: cp.assignedByUser.id,
            firstName: cp.assignedByUser.firstName,
            lastName: cp.assignedByUser.lastName,
            email: cp.assignedByUser.email,
            name: facultyName || (cp.assignedByUser.firstName && cp.assignedByUser.lastName
              ? `${cp.assignedByUser.firstName} ${cp.assignedByUser.lastName}`
              : cp.assignedByUser.email)
          } : null
        };
      })
    );

    const careerPaths = careerPathsWithFacultyNames;

    console.log(`✅ Found ${courses.length} courses and ${careerPaths.length} career paths for student`);
    console.log('Career paths data:', JSON.stringify(careerPaths, null, 2));

    return NextResponse.json({
      success: true,
      courses: courses,
      careerPaths: careerPaths
    });
  } catch (error) {
    console.error('❌ Error in simple courses API:', error);
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
