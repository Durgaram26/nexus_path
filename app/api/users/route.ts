import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { email, password, role } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    let derivedRole: string;
    let departmentId: number | undefined;

    // If role is explicitly provided and it's admin, use it directly
    if (role === 'admin') {
      derivedRole = 'admin';
      departmentId = undefined; // Admin doesn't need department
    } else {
      // Determine role by looking up existing faculty/student records
      const [studentRecord, facultyRecord] = await Promise.all([
        prisma.student.findUnique({ where: { email } }),
        prisma.faculty.findUnique({ where: { email } }),
      ]);

      if (!studentRecord && !facultyRecord) {
        return NextResponse.json({ message: 'Email not found in student or faculty records' }, { status: 404 });
      }

      derivedRole = studentRecord ? 'student' : 'faculty';
      departmentId = studentRecord?.departmentId ?? facultyRecord?.departmentId ?? undefined;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        plainPassword: password,
        role: derivedRole,
        departmentId: departmentId}});

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /users error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const format = searchParams.get('format') || 'csv'; // 'csv' or 'json'
    
    if (!role || !['faculty', 'student'].includes(role)) {
      return NextResponse.json({ message: 'role must be faculty or student' }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true, email: true, role: true, plainPassword: true, createdAt: true },
      orderBy: { id: 'asc' },
      take: 1000});

    // Return JSON if requested
    if (format === 'json') {
      return NextResponse.json(users, { status: 200 });
    }

    // Return CSV by default
    const headers = ['id', 'email', 'role', 'password', 'createdAt'];
    const rows = users.map(u => [
      String(u.id),
      u.email,
      u.role,
      u.plainPassword ?? '',
      u.createdAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${role}-users.csv`}});
  } catch (error: unknown) {
    console.error('GET /users error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
