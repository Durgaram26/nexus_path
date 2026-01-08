import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Faculty workshops API called');
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'faculty') {
      console.log('Invalid token or not faculty:', payload);
      return NextResponse.json({ error: 'Faculty access required' }, { status: 403 });
    }

    console.log('Token verified, userId:', payload.userId);

    // Find the faculty record
    const faculty = await prisma.faculty.findFirst({
      where: { email: payload.email }
    });
    
    if (!faculty) {
      console.log('Faculty not found in database for email:', payload.email);
      return NextResponse.json({ 
        error: 'Faculty record not found. Please ensure you are properly registered as faculty.' 
      }, { status: 400 });
    }

    console.log('Found faculty record:', faculty.id);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const status = searchParams.get('status') || '';

    // Build where clause for filtering
    const where: any = {
      createdBy: faculty.id
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Level filter
    if (level) {
      where.level = level;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    console.log('Fetching workshops with where clause:', where);

    let workshops = [];
    try {
      // First, test if the workshop table exists
      await prisma.workshop.findFirst();
      console.log('Workshop table exists, proceeding with query...');
      
      workshops = await prisma.workshop.findMany({
        where,
        include: {
          creator: {
            select: {
              name: true,
              email: true
            }
          },
          enrollments: {
            include: {
              student: {
                select: {
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      console.error('Database error details:', dbError.message);
      // If there's a database error (like table doesn't exist), return empty array
      workshops = [];
    }

    console.log('Found workshops:', workshops.length);

    return NextResponse.json({
      success: true,
      workshops
    });

  } catch (error) {
    console.error('Error fetching workshops:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch workshops',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating workshop...');
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'faculty') {
      console.log('Invalid token or not faculty:', payload);
      return NextResponse.json({ error: 'Faculty access required' }, { status: 403 });
    }

    console.log('Token verified, userId:', payload.userId);

    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      title,
      description,
      instructor,
      duration,
      level,
      category,
      maxParticipants,
      startDate,
      endDate,
      location,
      prerequisites,
      objectives,
      materials,
      isMandatory
    } = body;

    // Validate required fields
    if (!title || !description || !instructor || !duration || !level || !category || !maxParticipants || !startDate || !endDate || !location) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('All required fields present, creating workshop...');

    // For now, let's use a simple approach - create a faculty record if it doesn't exist
    let faculty;
    try {
      faculty = await prisma.faculty.findFirst({
        where: { email: payload.email }
      });
      
      if (!faculty) {
        console.log('Faculty not found, creating one...');
        faculty = await prisma.faculty.create({
          data: {
            email: payload.email,
            name: payload.firstName + ' ' + payload.lastName || 'Faculty Member',
            gender: 'OTHER', // Default gender
            departmentId: 1 // Default department
          }
        });
        console.log('Created faculty record:', faculty.id);
      } else {
        console.log('Found existing faculty record:', faculty.id);
      }
    } catch (facultyError) {
      console.error('Error with faculty record:', facultyError);
      // If faculty creation fails, use a default faculty ID
      faculty = { id: 1 };
    }

    // Create workshop
    const workshop = await prisma.workshop.create({
      data: {
        title,
        description,
        instructor,
        duration,
        level,
        category,
        maxParticipants,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        prerequisites: prerequisites ? JSON.stringify(prerequisites) : null,
        objectives: objectives ? JSON.stringify(objectives) : null,
        materials: materials ? JSON.stringify(materials) : null,
        isMandatory: isMandatory || false,
        createdBy: faculty.id
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Workshop created successfully:', workshop);

    return NextResponse.json({
      success: true,
      workshop
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating workshop:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create workshop',
      details: error.message
    }, { status: 500 });
  }
}
