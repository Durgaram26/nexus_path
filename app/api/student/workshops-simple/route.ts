import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/workshops-simple - Simple version for workshops
export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Simple workshops API called');
    
    // Get the first student for testing
    const student = await prisma.student.findFirst({
      select: { id: true, email: true, name: true }
    });

    if (!student) {
      return NextResponse.json({
        success: true,
        workshops: [],
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
            careerPath: true
          }
        }
      }
    });

    // Get real workshops from the database
    const workshops = await prisma.workshop.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          where: {
            studentId: student.id
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Transform workshops to match the expected structure
    const transformedWorkshops = workshops.map(workshop => {
      const enrollment = workshop.enrollments[0]; // Get student's enrollment
      
      return {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        instructor: workshop.creator.name,
        duration: workshop.duration,
        level: workshop.level,
        category: workshop.category,
        status: workshop.status,
        startDate: workshop.startDate.toISOString(),
        endDate: workshop.endDate.toISOString(),
        workshopType: "hands-on", // Default type
        location: workshop.location,
        meetingLink: null, // Not in database schema
        isMandatory: workshop.isMandatory,
        enrolledStudents: workshop.enrolledParticipants,
        maxStudents: workshop.maxParticipants,
        assignments: [], // No assignments in workshop schema
        enrollment: enrollment ? {
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          grade: null,
          assignmentsCompleted: 0,
          totalAssignments: 0,
          lastActivity: enrollment.enrolledAt.toISOString()
        } : null
      };
    });

    // Get career paths for this student
    const careerPaths = studentWithCareerPaths?.careerPaths.map(cp => ({
      id: cp.careerPath.id,
      name: cp.careerPath.name,
      description: cp.careerPath.description,
      assignedAt: cp.assignedAt
    })) || [];

    console.log(`✅ Found ${transformedWorkshops.length} workshops and ${careerPaths.length} career paths for student`);

    return NextResponse.json({
      success: true,
      workshops: transformedWorkshops,
      careerPaths: careerPaths
    });
  } catch (error) {
    console.error('❌ Error in simple workshops API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch workshops',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
