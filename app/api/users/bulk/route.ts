import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcrypt';

// Utility to generate a random password
const generateRandomPassword = (length = 10) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || (payload as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { facultyIds, studentIds, mode = 'auto', manualPassword } = await request.json();

    if (!facultyIds && !studentIds) {
      return NextResponse.json({ message: 'At least one of facultyIds or studentIds must be provided' }, { status: 400 });
    }

    const provisionedAccounts: { id: string; email: string; role: string; plainPassword: string; name: string; }[] = [];

    const buildPassword = async (user: { email: string; name: string; role: string }, extra?: { registerNumber?: string; departmentName?: string }) => {
      if (mode === 'manual') {
        if (!manualPassword) throw new Error('manualPassword is required when mode is manual');
        return { plain: manualPassword, hash: await bcrypt.hash(manualPassword, 10) };
      }
      
      // Smart mode: automatically choose based on role
      if (mode === 'smart') {
        if (user.role === 'student' && extra?.registerNumber) {
          const raw = `${(user.name || '').toLowerCase()}${extra.registerNumber}`.replace(/\s+/g, '');
          return { plain: raw, hash: await bcrypt.hash(raw, 10) };
        }
        if (user.role === 'faculty' && extra?.departmentName) {
          const raw = `${(user.name || '').toLowerCase()}@${extra.departmentName.toLowerCase()}`.replace(/\s+/g, '');
          return { plain: raw, hash: await bcrypt.hash(raw, 10) };
        }
      }
      
      // Role-specific modes
      if (mode === 'nameReg' && user.role === 'student' && extra?.registerNumber) {
        const raw = `${(user.name || '').toLowerCase()}${extra.registerNumber}`.replace(/\s+/g, '');
        return { plain: raw, hash: await bcrypt.hash(raw, 10) };
      }
      if (mode === 'nameDept' && user.role === 'faculty' && extra?.departmentName) {
        const raw = `${(user.name || '').toLowerCase()}@${extra.departmentName.toLowerCase()}`.replace(/\s+/g, '');
        return { plain: raw, hash: await bcrypt.hash(raw, 10) };
      }
      
      // default auto mode: random strong password
      const plain = generateRandomPassword();
      return { plain, hash: await bcrypt.hash(plain, 10) };
    };

    // Provision Faculty accounts
    if (facultyIds && facultyIds.length > 0) {
      for (const facultyId of facultyIds) {
        const faculty = await prisma.faculty.findUnique({ 
          where: { id: facultyId },
          include: { department: true }
        });
        if (faculty && faculty.email) {
          const existingUser = await prisma.user.findUnique({ where: { email: faculty.email } });

          const pass = await buildPassword(
            { email: faculty.email, name: faculty.name, role: 'faculty' },
            { departmentName: faculty?.department?.name }
          );

          if (existingUser) {
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                password: pass.hash, 
                plainPassword: pass.plain, 
                role: 'faculty',
                departmentId: faculty.departmentId}});
            provisionedAccounts.push({ 
              id: updatedUser.id, 
              email: updatedUser.email, 
              role: updatedUser.role, 
              plainPassword: pass.plain,
              name: faculty.name});
          } else {
            const newUser = await prisma.user.create({
              data: { 
                email: faculty.email, 
                password: pass.hash, 
                plainPassword: pass.plain, 
                role: 'faculty',
                departmentId: faculty.departmentId}});
            provisionedAccounts.push({ 
              id: newUser.id, 
              email: newUser.email, 
              role: newUser.role, 
              plainPassword: pass.plain,
              name: faculty.name});
          }
        }
      }
    }

    // Provision Student accounts
    if (studentIds && studentIds.length > 0) {
      for (const studentId of studentIds) {
        const student = await prisma.student.findUnique({ 
          where: { id: studentId }
        });
        if (student && student.email) {
          const existingUser = await prisma.user.findUnique({ where: { email: student.email } });

          const pass = await buildPassword({ email: student.email, name: student.name, role: 'student' }, { registerNumber: student.registerNumber });

          if (existingUser) {
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                password: pass.hash, 
                plainPassword: pass.plain, 
                role: 'student',
                departmentId: student.departmentId}});
            provisionedAccounts.push({ 
              id: updatedUser.id, 
              email: updatedUser.email, 
              role: updatedUser.role, 
              plainPassword: pass.plain,
              name: student.name});
          } else {
            const newUser = await prisma.user.create({
              data: { 
                email: student.email, 
                password: pass.hash, 
                plainPassword: pass.plain, 
                role: 'student',
                departmentId: student.departmentId}});
            provisionedAccounts.push({ 
              id: newUser.id, 
              email: newUser.email, 
              role: newUser.role, 
              plainPassword: pass.plain,
              name: student.name});
          }
        }
      }
    }

    // Return as CSV
    const headers = ['id', 'email', 'role', 'name', 'password'];
    const rows = provisionedAccounts.map(account => [
      String(account.id),
      account.email,
      account.role,
      account.name,
      account.plainPassword,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=bulk-created-accounts.csv'}});
  } catch (error: unknown) {
    console.error("Bulk Account Creation Error:", error);
    return NextResponse.json({ message: (error as Error)?.message || 'Internal Server Error' }, { status: 500 });
  }
}