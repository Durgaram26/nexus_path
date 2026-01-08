import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/faculty/mentors - Get all industry mentors
export async function GET(request: NextRequest) {
  try {
    const mentors = await prisma.industryMentor.findMany({
      include: {
        createdByFaculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        mentorAssignments: {
          where: { isActive: true },
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
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      mentors: mentors
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}

// POST /api/faculty/mentors - Create new industry mentor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      position,
      industry,
      experience,
      expertise,
      bio,
      profileImage,
      maxStudents,
      timezone,
      availability,
      preferences
    } = body;

    console.log('👤 Creating industry mentor:', { name, email, company });

    // Check if mentor with email already exists
    const existingMentor = await prisma.industryMentor.findUnique({
      where: { email }
    });

    if (existingMentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor with this email already exists' },
        { status: 400 }
      );
    }

    // TODO: Get faculty ID from JWT token
    const facultyId = '1'; // Mock faculty ID

    // Create new mentor
    const mentor = await prisma.industryMentor.create({
      data: {
        name,
        email,
        phone: phone || null,
        company,
        position,
        industry,
        experience: parseInt(experience),
        expertise: expertise || [],
        bio: bio || null,
        profileImage: profileImage || null,
        maxStudents: parseInt(maxStudents) || 5,
        timezone: timezone || 'UTC',
        availability: availability || '{}',
        preferences: preferences || null,
        createdBy: facultyId
      },
      include: {
        createdByFaculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Mentor created successfully:', mentor.id);

    return NextResponse.json({
      success: true,
      mentor: mentor,
      message: 'Mentor created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating mentor:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create mentor' },
      { status: 500 }
    );
  }
}
