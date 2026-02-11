import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET endpoint: Download existing user accounts with their credentials
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // '' or 'faculty' or null (all)
    const departmentIdParam = searchParams.get('departmentId');
    const yearParam = searchParams.get('year');
    const format = searchParams.get('format') || 'csv'; // 'csv' or 'json'

    const departmentId = departmentIdParam ? departmentIdParam : null;
    const year = yearParam ? parseInt(yearParam) : null;

    // Build filter for User table
    const whereClause: any = {};
    if (role && ['student', 'faculty'].includes(role)) {
      whereClause.role = role;
    }
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    // Fetch all users (or filtered by role/department)
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        role: true,
        plainPassword: true,
        firstName: true,
        lastName: true,
        departmentId: true
      },
      orderBy: { id: 'asc' }
    });

    // For students, fetch register number and year from table, then filter by year if needed
    const enrichedAccounts = await Promise.all(
      users.map(async (user: any) => {
        let registerNumber = '';
        let departmentName = '';
        let studentYear: number | null = null;
        let userName = '';

        if (user.role === 'student') {
          const studentRecord = await prisma.student.findUnique({
            where: { email: user.email },
            include: { department: true }
          });
          if (studentRecord) {
            registerNumber = studentRecord.registerNumber;
            departmentName = studentRecord?.department.name;
            studentYear = studentRecord.year;
            userName = studentRecord.name;
          }
        } else if (user.role === 'faculty') {
          const facultyRecord = await prisma.faculty.findUnique({
            where: { email: user.email },
            include: { department: true }
          });
          if (facultyRecord) {
            departmentName = facultyRecord?.department.name;
            userName = facultyRecord.name;
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: userName,
          department: departmentName,
          registerNumber,
          year: studentYear,
          password: user.plainPassword ?? ''
        };
      })
    );

    // Apply year filter if specified (only applies to students)
    let filteredAccounts = enrichedAccounts;
    if (year !== null) {
      filteredAccounts = enrichedAccounts.filter(account => {
        if (account.role === 'student') {
          return account.year === year;
        }
        return true; // keep faculty regardless
      });
    }

    // Return JSON if requested
    if (format === 'json') {
      return NextResponse.json(filteredAccounts, { status: 200 });
    }

    // Generate CSV
    const headers = ['id', 'email', 'role', 'name', 'department', 'registerNumber', 'password'];
    const rows = filteredAccounts.map(account => [
      String(account.id),
      account.email,
      account.role,
      account.name,
      account.department,
      account.registerNumber,
      account.password,
    ]);

    const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=existing-accounts-${role || 'all'}.csv`
      }
    });
  } catch (error: unknown) {
    console.error("Account Download Error:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
