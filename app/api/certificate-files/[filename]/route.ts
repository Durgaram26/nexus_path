import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    console.log('🔍 Certificate file download requested:', params.filename);
    
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

    // Serve the actual uploaded PDF file
    const filePath = path.join(process.cwd(), 'uploads', 'certificates', params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ Certificate file not found:', filePath);
      
      // Return a placeholder PDF for missing files
      const placeholderPdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = placeholderPdf.internal.pageSize.getWidth();
      const pageHeight = placeholderPdf.internal.pageSize.getHeight();
      
      // Add background
      placeholderPdf.setFillColor(248, 250, 252);
      placeholderPdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add border
      placeholderPdf.setDrawColor('#2563eb');
      placeholderPdf.setLineWidth(2);
      placeholderPdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Add message
      placeholderPdf.setFontSize(24);
      placeholderPdf.setTextColor('#64748b');
      placeholderPdf.setFont('helvetica', 'bold');
      placeholderPdf.text('Certificate File Not Found', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
      placeholderPdf.setFontSize(16);
      placeholderPdf.setTextColor('#64748b');
      placeholderPdf.setFont('helvetica', 'normal');
      placeholderPdf.text('The certificate file for this submission', pageWidth / 2, pageHeight / 2, { align: 'center' });
      placeholderPdf.text('could not be found or was not uploaded.', pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
      
      const pdfBuffer = Buffer.from(placeholderPdf.output('arraybuffer'));
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="missing-${params.filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Get file stats for content length
    const stats = fs.statSync(filePath);
    
    console.log('✅ Serving certificate file:', params.filename, 'Size:', stats.size, 'bytes');
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${params.filename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error: any) {
    console.error('❌ Error serving certificate file:', error);
    return NextResponse.json(
      { error: `Failed to serve certificate file: ${error.message}` },
      { status: 500 }
    );
  }
}
