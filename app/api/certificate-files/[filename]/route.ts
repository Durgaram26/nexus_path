import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    let filename: string;
    
    // Safely extract and handle params
    try {
      const resolvedParams = await params;
      filename = resolvedParams?.filename || '';
      console.log('✅ Resolved params successfully');
    } catch (paramsError) {
      console.error('Error resolving params:', paramsError);
      filename = '';
    }
    
    if (!filename) {
      console.error('❌ No filename provided in request');
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }
    
    console.log('🔍 Certificate file download requested:', filename);
    
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
    
    if (!decoded || !['student', 'faculty'].includes(decoded.role)) {
      console.log('❌ Token verification failed:', { decoded, role: decoded?.role });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch certificate from MongoDB using certificateFileName
    const submission = await prisma.certificateSubmission.findFirst({
      where: { certificateFileName: decodeURIComponent(filename) },
      select: {
        id: true,
        certificateFile: true,
        certificateFileName: true,
        fileMimeType: true,
        fileSize: true,
        studentId: true,
        student: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (!submission) {
      console.log('❌ Certificate not found in MongoDB:', filename);
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    console.log('✅ Certificate found in MongoDB:', submission.id, 'Size:', submission.fileSize);

    // Handle MongoDB binary data conversion
    let fileBuffer: any = submission.certificateFile;
    let contentLength = submission.fileSize;
    
    try {
      // If certificateFile is a string (base64 encoded by Prisma)
      if (typeof submission.certificateFile === 'string') {
        console.log('Converting base64 string to Buffer...');
        fileBuffer = Buffer.from(submission.certificateFile, 'base64');
        contentLength = fileBuffer.length;
      }
      // If it's already a Buffer
      else if (Buffer.isBuffer(submission.certificateFile)) {
        console.log('Using Buffer directly...');
        contentLength = submission.certificateFile.length;
      }
      // If it's Uint8Array
      else if (submission.certificateFile instanceof Uint8Array) {
        console.log('Converting Uint8Array to Buffer...');
        fileBuffer = Buffer.from(submission.certificateFile);
        contentLength = fileBuffer.length;
      }
      
      console.log('Final buffer size:', contentLength, 'bytes');
    } catch (conversionError) {
      console.error('Error converting file buffer:', conversionError);
      throw new Error('Failed to process certificate file data');
    }

    // Return the binary data from MongoDB with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': submission.fileMimeType || 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(submission.certificateFileName)}"`,
        'Content-Length': contentLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes'
      }
    });

  } catch (error: any) {
    console.error('❌ Error downloading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to download certificate', details: error.message },
      { status: 500 }
    );
  }
}
