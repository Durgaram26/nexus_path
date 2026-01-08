import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  ';
  return token ? verifyToken(token) : null;
}

// GET - Get a specific export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    if (isNaN()) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    

    if (!) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can access this if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }});

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this 's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.|| // Can access all departments
        faculty..split(',').map(id => parseInt(id.trim())).includes(.departmentId)
      );

      if (!canAccess && faculty.departmentId !== .departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to access this ' 
        }, { status: 403 });
      }
    }

    return NextResponse.json( { status: 200 });
  } catch (error) {
    console.error('GET //faculty/students/[id] :');
    return NextResponse.json({ message: 'Internal Server Error', : String(error) }, { status: 500 });
  }
}

// PUT - Update a export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    if (isNaN()) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const { email, name, gender, departmentId, year, registerNumber } = await request.json();

    if (!email || !name || !gender || !departmentId || !year || !registerNumber) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Check if exists
    const existingStudent = await prisma..findUnique({ where: { id: } });
    if (!existingStudent) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can update this if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }});

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this 's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.|| // Can access all departments
        faculty..split(',').map(id => parseInt(id.trim())).includes(existingStudent.departmentId)
      );

      if (!canAccess && faculty.departmentId !== existingStudent.departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to update this ' 
        }, { status: 403 });
      }

      // Check if faculty can move to new department
      if (parseInt(departmentId) !== existingStudent.departmentId) {
        const canMoveToNewDept = faculty.canAssignCrossDepartment && (
          !faculty.|| // Can access all departments
          faculty..split(',').map(id => parseInt(id.trim())).includes(parseInt(departmentId))
        );

        if (!canMoveToNewDept && faculty.departmentId !== parseInt(departmentId)) {
          return NextResponse.json({ 
            message: 'You do not have permission to move this to the selected department' 
          }, { status: 403 });
        }
      }
    }

    // Check if email or register number is already taken by another const duplicateStudent = await prisma..findFirst({
      where: {
        AND: [
          { id: { not: } },
          {
            OR: [
              { email },
              { registerNumber }
            ]
          }
        ]
      }
    });

    if (duplicateStudent) {
      return NextResponse.json({ 
        message: 'Student with this email or register number already exists' 
      }, { status: 409 });
    }

    // Update const updatedStudent = await prisma..update({
      where: { id: },
      data: {
        email,
        name,
        gender,
        departmentId: parseInt(departmentId),
        year: parseInt(year),
        registerNumber},
      include: {
        department: {
          include: {
            college: true}},
        careerPaths: {
          include: {
            careerPath: true}}}});

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('PUT //faculty/students/[id] :');
    return NextResponse.json({ message: 'Internal Server Error', : String(error) }, { status: 500 });
  }
}

// DELETE - Delete a export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['admin', 'faculty'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    if (isNaN()) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Check if exists
    
    if (!) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Check if faculty can delete this if ((payload as any).role === 'faculty') {
      const faculty = await prisma.faculty.findUnique({
        where: { email: (payload as any).email }});

      if (!faculty) {
        return NextResponse.json({ message: 'Faculty not found' }, { status: 404 });
      }

      // Check if faculty can access this 's department
      const canAccess = faculty.canAssignCrossDepartment && (
        !faculty.|| // Can access all departments
        faculty..split(',').map(id => parseInt(id.trim())).includes(.departmentId)
      );

      if (!canAccess && faculty.departmentId !== .departmentId) {
        return NextResponse.json({ 
          message: 'You do not have permission to delete this ' 
        }, { status: 403 });
      }
    }

    // Delete (this will cascade delete career path assignments)
    await prisma..delete({
      where: { id: }});

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE //faculty/students/[id] :');
    return NextResponse.json({ message: 'Internal Server Error', : String(error) }, { status: 500 });
  }
}
