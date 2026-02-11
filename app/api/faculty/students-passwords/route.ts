import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get passwords for students with accounts
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentIds = searchParams.get('studentIds');

    if (!studentIds) {
      return NextResponse.json({
        message: 'Student IDs are required'
      }, { status: 400 });
    }

    const ids = studentIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json({
        message: 'No valid student IDs provided'
      }, { status: 400 });
    }

    // Get students with their department information
    const students = await prisma.student.findMany({
      where: { id: { in: ids } },
      include: {
        department: true
      }
    });

    // Get student emails
    const studentEmails = students.map((s: any) => s.email);

    // Find users with matching emails (like admin account creation approach)
    const users = await prisma.user.findMany({
      where: {
        email: { in: studentEmails }
      },
      select: {
        id: true,
        email: true,
        plainPassword: true,
        createdAt: true
      }
    });

    // Create a map of email to user for quick lookup
    const userMap = new Map(users.map((u: any) => [u.email, u]));

    const results = students.map((student: any) => {
      const user: any = userMap.get(student.email);
      const result = {
        studentId: student.id,
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        password: user?.plainPassword || null,
        department: student.department!.name,
        year: student.year,
        createdAt: user?.createdAt || null
      };
      return result;
    }); // Include all students, even those without passwords

    const summary = {
      total: results.length,
      withPasswords: results.filter((r: any) => r.password).length,
      withoutPasswords: results.filter((r: any) => !r.password).length
    };

    return NextResponse.json({
      success: true,
      results,
      summary
    });

  } catch (error) {
    console.error('GET /api/faculty/students-passwords:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
