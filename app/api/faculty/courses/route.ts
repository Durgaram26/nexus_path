import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/faculty/courses - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: true,
        enrollments: {
          include: {
            student: true
          }
        },
        assignments: true
      }
    });

    return NextResponse.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/faculty/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Creating course with data:', body);
    
    // Check if faculty exists
    const faculty = await prisma.faculty.findFirst();
    if (!faculty) {
      console.error('❌ No faculty found in database');
      return NextResponse.json(
        { success: false, message: 'No faculty found. Please create a faculty member first.' },
        { status: 400 }
      );
    }
    
    console.log('✅ Found faculty:', faculty.id);
    
    // Create new course in database
    const newCourse = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        instructor: body.instructor || 'TBD',
        duration: body.duration,
        level: body.level,
        category: body.category,
        maxStudents: body.maxStudents,
        enrolledStudents: 0,
        status: 'active',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        courseType: body.courseType,
        location: body.location || '',
        meetingLink: body.meetingLink || '',
        isMandatory: body.isMandatory || false,
        createdBy: faculty.id
      },
      include: {
        creator: true,
        enrollments: {
          include: {
            student: true
          }
        },
        assignments: true
      }
    });
    
    console.log('✅ Course created successfully:', newCourse.id);
    
    return NextResponse.json({
      success: true,
      course: newCourse,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating course:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', errorMessage);
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      { success: false, message: `Failed to create course: ${errorMessage}` },
      { status: 500 }
    );
  }
}
