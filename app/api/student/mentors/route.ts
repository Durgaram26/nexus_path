import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student/mentors - Get assigned mentors for student
export async function GET(request: NextRequest) {
  try {
    // TODO: Get student ID from JWT token
    const studentId = '1'; // Mock student ID
    console.log('👥 Fetching mentors for student:', studentId);

    const mentors = await prisma.industryMentor.findMany({
      where: {
        mentorAssignments: {
          some: {
            studentId: studentId,
            isActive: true
          }
        }
      },
      include: {
        mentorAssignments: {
          where: {
            studentId: studentId,
            isActive: true
          },
          select: {
            id: true,
            assignedAt: true,
            notes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedMentors = mentors.map((mentor: any) => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      company: mentor.company,
      position: mentor.position,
      industry: mentor.industry,
      experience: mentor.experience,
      expertise: mentor.expertise,
      bio: mentor.bio,
      profileImage: mentor.profileImage,
      timezone: mentor.timezone,
      assignment: (mentor as any).mentorAssignments?.[0] // Get the assignment for this student
    }));

    console.log(`✅ Found ${mentors.length} mentors for student`);

    return NextResponse.json({
      success: true,
      mentors: transformedMentors
    });
  } catch (error) {
    console.error('❌ Error fetching student mentors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}
