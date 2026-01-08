import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

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

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    
    // Save file to uploads directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'certificates');
    const filePath = path.join(uploadDir, filename);
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));
    
    console.log('✅ Certificate file saved:', filename);

    const body = {
      courseName: formData.get('courseName'),
      courseProvider: formData.get('courseProvider'),
      completionDate: formData.get('completionDate'),
      description: formData.get('description'),
      courseLink: formData.get('courseLink'),
      courseType: formData.get('courseType'),
      certificateFile: filename
    };
    
    console.log('📝 Certificate submission data:', body);

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
        description: body.description || '',
        courseLink: body.courseLink || '',
        courseType: body.courseType || 'online',
        status: 'pending'
      }
    });

    console.log('✅ Certificate submission created:', certificateSubmission.id);

    return NextResponse.json({
      success: true,
      message: 'Certificate submitted successfully',
      submission: certificateSubmission
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

    // Get student's certificate submissions
    const submissions = await prisma.certificateSubmission.findMany({
      where: { studentId: student.id },
      orderBy: { submittedAt: 'desc' }
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
