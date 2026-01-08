import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// POST - Create user account for student
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { studentId, password, passwordPrefix, passwordType, createAccount = true } = await request.json();

    if (!studentId) {
      return NextResponse.json({ 
        message: 'Student ID is required' 
      }, { status: 400 });
    }

    // Get faculty information for permission check
    const faculty = await prisma.faculty.findUnique({
      where: { email: (payload as any).email },
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ 
        message: 'Faculty not found' 
      }, { status: 404 });
    }

    // Get the student record
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: { 
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ 
        message: 'Student not found' 
      }, { status: 404 });
    }

    // Check faculty permissions
    const hasPermission = await checkFacultyPermission(faculty, student);
    if (!hasPermission.allowed) {
      return NextResponse.json({ 
        message: hasPermission.reason,
        details: hasPermission.details
      }, { status: 403 });
    }

    // Check if user account already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: student.email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User account already exists for this student',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role
        }
      }, { status: 409 });
    }

    if (!createAccount) {
      return NextResponse.json({
        success: true,
        message: 'Account creation skipped',
        student: {
          id: student.id,
          email: student.email,
          name: student.name
        }
      });
    }

    // Generate password based on method
    let finalPassword: string;
    if (password) {
      finalPassword = password;
    } else if (passwordType === 'simple') {
      finalPassword = generateSimplePassword(student.registerNumber, passwordPrefix || 'student');
    } else if (passwordType === 'name+reg') {
      finalPassword = generateNameRegPassword(student.name, student.registerNumber);
    } else {
      finalPassword = generateDefaultPassword(student.registerNumber, passwordPrefix || 'student');
    }
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: student.email,
        password: hashedPassword,
        plainPassword: finalPassword,
        role: 'student',
        departmentId: student.departmentId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        password: finalPassword
      },
      student: {
        id: student.id,
        email: student.email,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department.name,
        year: student.year
      },
      credentials: {
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        password: finalPassword,
        department: student.department.name,
        year: student.year,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('POST /api/faculty/create-student-account:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - Bulk create user accounts for multiple students
export async function PUT(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { studentIds, passwordPrefix = 'student', password, passwordType } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ 
        message: 'Student IDs array is required' 
      }, { status: 400 });
    }

    // Get faculty information for permission checks
    const faculty = await prisma.faculty.findUnique({
      where: { email: (payload as any).email },
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ 
        message: 'Faculty not found' 
      }, { status: 404 });
    }

    const results = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        // Get the student record
        const student = await prisma.student.findUnique({
          where: { id: parseInt(studentId) },
          include: { 
            department: true,
            careerPaths: {
              include: {
                careerPath: true
              }
            }
          }
        });

        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Check faculty permissions for this student
        const hasPermission = await checkFacultyPermission(faculty, student);
        if (!hasPermission.allowed) {
          errors.push({ 
            studentId, 
            error: hasPermission.reason,
            details: hasPermission.details
          });
          continue;
        }

        // Check if user account already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: student.email }
        });

        if (existingUser) {
          results.push({
            studentId,
            success: false,
            message: 'Account already exists',
            email: student.email
          });
          continue;
        }

        // Generate password based on method
        let finalPassword: string;
        if (password) {
          finalPassword = password;
        } else if (passwordType === 'simple') {
          finalPassword = generateSimplePassword(student.registerNumber, passwordPrefix);
        } else if (passwordType === 'name+reg') {
          finalPassword = generateNameRegPassword(student.name, student.registerNumber);
        } else {
          finalPassword = generateDefaultPassword(student.registerNumber, passwordPrefix);
        }
        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        // Create user account
        const user = await prisma.user.create({
          data: {
            email: student.email,
            password: hashedPassword,
            plainPassword: finalPassword,
            role: 'student',
            departmentId: student.departmentId
          }
        });

        results.push({
          studentId,
          success: true,
          message: 'Account created successfully',
          email: student.email,
          password: finalPassword,
          credentials: {
            registerNumber: student.registerNumber,
            name: student.name,
            email: student.email,
            password: finalPassword,
            department: student.department.name,
            year: student.year,
            createdAt: new Date().toISOString()
          }
        });

      } catch (error) {
        errors.push({ 
          studentId, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${studentIds.length} students`,
      results,
      errors,
      summary: {
        total: studentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length + errors.length
      }
    });

  } catch (error) {
    console.error('PUT /api/faculty/create-student-account:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Check if faculty has permission to create account for student
async function checkFacultyPermission(faculty: any, student: any) {
  // Admin can create accounts for any student
  if (faculty.role === 'admin') {
    return { allowed: true };
  }

  // Check department permission
  if (faculty.departmentId !== student.departmentId) {
    if (!faculty.canAssignCrossDepartment) {
      return {
        allowed: false,
        reason: 'You can only create accounts for students in your department',
        details: {
          facultyDepartment: faculty.department.name,
          studentDepartment: student.department.name
        }
      };
    }
  }

  // Check year permission
  const assignedYears = faculty.assignedYears ? JSON.parse(faculty.assignedYears) : [];
  if (assignedYears.length > 0 && !assignedYears.includes(student.year)) {
    return {
      allowed: false,
      reason: 'You can only create accounts for students in your assigned years',
      details: {
        facultyYears: assignedYears,
        studentYear: student.year
      }
    };
  }

  // Check career path permission
  const facultyCareerPaths = faculty.careerPaths.map((cp: any) => cp.careerPath.name);
  if (facultyCareerPaths.length > 0) {
    const studentCareerPaths = student.careerPaths.map((cp: any) => cp.careerPath.name);
    const hasMatchingCareerPath = studentCareerPaths.some((cp: string) => 
      facultyCareerPaths.includes(cp)
    );
    
    if (!hasMatchingCareerPath) {
      return {
        allowed: false,
        reason: 'You can only create accounts for students with your assigned career paths',
        details: {
          facultyCareerPaths,
          studentCareerPaths
        }
      };
    }
  }

  return { allowed: true };
}

function generateDefaultPassword(registerNumber: string, prefix: string = 'student'): string {
  // Generate a more secure password similar to admin account creation
  const cleanRegNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '');
  
  // Create a more secure password with mixed case, numbers, and special characters
  const basePassword = `${prefix}${cleanRegNumber}`;
  const specialChars = '@#$%';
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Mix case for better security
  const mixedCasePassword = basePassword
    .split('')
    .map((char, index) => index % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
    .join('');
  
  return `${mixedCasePassword}${randomSpecial}${randomNumber}`;
}

function generateSimplePassword(registerNumber: string, prefix: string = 'student'): string {
  // Generate a simple password: prefix + register number only
  const cleanRegNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '');
  return `${prefix}${cleanRegNumber}`;
}

function generateNameRegPassword(studentName: string, registerNumber: string): string {
  // Generate a password using student name + register number
  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanRegNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '');
  return `${cleanName}${cleanRegNumber}`;
}
