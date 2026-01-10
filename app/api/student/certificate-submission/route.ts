import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Certificate submission API called');
    
    // Verify authentication
    const bearer = request.headers.get('authorization');
    const tokenFromHeader = bearer?.startsWith('Bearer ')
      ? bearer.substring('Bearer '.length)
      : undefined;
    const tokenFromCookie = request.cookies.get('access_token')?.value;
    const token = tokenFromHeader || tokenFromCookie;
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('🔍 Decoded token:', decoded);
    
    if (!decoded || decoded.role !== 'student') {
      console.log('❌ Token verification failed:', { decoded, role: decoded?.role });
      return NextResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 });
    }

    // Handle file upload with FormData
    const formData = await request.formData();
    const file = formData.get('certificateFile') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No certificate file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to buffer for MongoDB storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('✅ Certificate file prepared for MongoDB storage:', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    const body = {
      courseName: (formData.get('courseName') as string) || '',
      courseProvider: (formData.get('courseProvider') as string) || '',
      completionDate: (formData.get('completionDate') as string) || new Date().toISOString(),
      description: (formData.get('description') as string) || '',
      courseLink: (formData.get('courseLink') as string) || '',
      courseType: (formData.get('courseType') as string) || 'online',
      certificateFile: buffer,
      certificateFileName: file.name,
      fileMimeType: file.type,
      fileSize: file.size
    };
    
    console.log('📝 Certificate submission data:', {
      courseName: body.courseName,
      courseProvider: body.courseProvider,
      fileName: body.certificateFileName,
      fileSize: body.fileSize
    });

    // Get student information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log('✅ Student found:', student.name);

    // Create certificate submission
    const certificateSubmission = await prisma.certificateSubmission.create({
      data: {
        studentId: student.id,
        courseName: body.courseName,
        courseProvider: body.courseProvider,
        completionDate: new Date(body.completionDate),
        certificateFile: body.certificateFile,
        certificateFileName: body.certificateFileName,
        fileMimeType: body.fileMimeType,
        fileSize: body.fileSize,
        description: body.description || '',
        courseLink: body.courseLink || '',
        courseType: body.courseType || 'online',
        status: 'pending'
      }
    });

    console.log('✅ Certificate submission created in MongoDB:', certificateSubmission.id);

    return NextResponse.json({
      success: true,
      message: 'Certificate submitted successfully',
      submission: {
        id: certificateSubmission.id,
        courseName: certificateSubmission.courseName,
        courseProvider: certificateSubmission.courseProvider,
        status: certificateSubmission.status,
        submittedAt: certificateSubmission.submittedAt,
        certificateFileName: certificateSubmission.certificateFileName
      }
    });

  } catch (error: any) {
    console.error('❌ Error creating certificate submission:', error);
    return NextResponse.json(
      { error: `Failed to submit certificate: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching certificate submissions');
    
    // Verify authentication
    const bearer = request.headers.get('authorization');
    const tokenFromHeader = bearer?.startsWith('Bearer ')
      ? bearer.substring('Bearer '.length)
      : undefined;
    const tokenFromCookie = request.cookies.get('access_token')?.value;
    const token = tokenFromHeader || tokenFromCookie;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get student information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get student's certificate submissions with full details including student info
    const submissions = await prisma.certificateSubmission.findMany({
      where: { studentId: student.id },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        courseName: true,
        courseProvider: true,
        completionDate: true,
        certificateFile: true,
        certificateFileName: true,
        fileMimeType: true,
        fileSize: true,
        description: true,
        courseLink: true,
        courseType: true,
        status: true,
        submittedAt: true,
        evaluatedAt: true,
        evaluatedBy: true,
        facultyComments: true,
        grade: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Found ${submissions.length} certificate submissions for student ${student.name}`);

    return NextResponse.json({
      success: true,
      submissions
    });

  } catch (error: any) {
    console.error('❌ Error fetching certificate submissions:', error);
    return NextResponse.json(
      { error: `Failed to fetch certificate submissions: ${error.message}` },
      { status: 500 }
    );
  }
}
