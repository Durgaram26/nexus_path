import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, ensureFacultyRecord } from '@/lib/auth';
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

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      console.log('No auth payload found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (payload as any).userId;
    const role = (payload as any).role;
    const email = (payload as any).email;

    console.log('Auth payload:', { userId, role, email });

    if (role === 'faculty') {
      let facultyEmail = email;
      
      // If email is not in  get it from the user table
      if (!facultyEmail) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: { email: true }
        });
        
        if (!user) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        facultyEmail = user.email;
      }

      // Get faculty information
      const faculty = await prisma.faculty.findUnique({
        where: { email: facultyEmail },
        include: {
          department: {
            include: {
              college: true
            }
          },
          careerPaths: {
            include: {
              careerPath: true
            }
          }
        }
      });

      if (!faculty) {
        console.log(`Faculty not found for email: ${facultyEmail}, attempting to create...`);
        // Try to create a Faculty record automatically
        try {
          // Get the first department as default
          const defaultDepartment = await prisma.department.findFirst();
          if (!defaultDepartment) {
            console.log('No departments found in database');
            throw new Error('No departments found in database');
          }
          console.log(`Using default department: ${defaultDepartment.name}`);

          // Create faculty record
          const newFaculty = await prisma.faculty.create({
            data: {
              email: facultyEmail,
              name: facultyEmail.split('@')[0], // Use email prefix as name
              departmentId: defaultDepartment.id,
              canAssignCrossDepartment: false,
              assignedYears: JSON.stringify([1, 2, 3, 4]), // Default to all years
              gender: 'OTHER' // Default gender
            },
            include: {
              department: {
                include: {
                  college: true
                }
              },
              careerPaths: {
                include: {
                  careerPath: true
                }
              }
            }
          });
          
          console.log(`Successfully created faculty record for: ${facultyEmail}`);
          return NextResponse.json({
            id: newFaculty.id,
            name: newFaculty.name,
            email: newFaculty.email,
            department: newFaculty.department,
            canAssignCrossDepartment: newFaculty.canAssignCrossDepartment,
            college: newFaculty.department.college,
            assignedYears: newFaculty.assignedYears,
            careerPaths: newFaculty.careerPaths.map((fcp: any) => fcp.careerPath)
          }, { status: 200 });
        } catch (error) {
          console.log(`Failed to create Faculty record for email: ${facultyEmail}`, error);
          return NextResponse.json({ 
            message: 'Faculty record not found. Please contact administrator to set up your faculty profile.',
            email: facultyEmail,
            error: error instanceof Error ? error.message : String(error)
          }, { status: 404 });
        }
      }

      return NextResponse.json({
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        canAssignCrossDepartment: faculty.canAssignCrossDepartment,
        college: faculty.department.college,
        assignedYears: faculty.assignedYears,
        careerPaths: faculty.careerPaths.map(fcp => fcp.careerPath)}, { status: 200 });
    } else if (role === 'admin') {
      // Get admin information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          department: {
            include: {
              college: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        role: user.role,
        department: user.department
      }, { status: 200 });
    } else if (role === 'student') {
      // Get student information
      const student = await prisma.student.findUnique({
        where: { email },
        include: {
          department: {
            include: {
              college: true
            }
          },
          careerPaths: {
            include: {
              careerPath: true,
              assignedByUser: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // For each career path, get the faculty name if assignedByUser is a faculty
      const careerPathsWithFacultyNames = await Promise.all(
        (student?.careerPaths || []).map(async (cp) => {
          let facultyName = null;
          
          if (cp.assignedByUser) {
            // Check if this user is a faculty member
            const faculty = await prisma.faculty.findUnique({
              where: { email: cp.assignedByUser.email },
              select: { name: true }
            });
            
            if (faculty) {
              facultyName = faculty.name;
            }
          }
          
          return {
            ...cp,
            facultyName: facultyName
          };
        })
      );
      
      if (!student) {
        return NextResponse.json({ message: 'Student not found' }, { status: 404 });
      }

      console.log('Student career paths data:', JSON.stringify(student.careerPaths, null, 2));

      // Transform career paths to match the expected structure
      const transformedCareerPaths = careerPathsWithFacultyNames.map(cp => ({
        id: cp.careerPath.id,
        name: cp.careerPath.name,
        description: cp.careerPath.description,
        assignedAt: cp.assignedAt,
        assignedByUser: cp.assignedByUser ? {
          id: cp.assignedByUser.id,
          firstName: cp.assignedByUser.firstName,
          lastName: cp.assignedByUser.lastName,
          email: cp.assignedByUser.email,
          name: cp.facultyName || (cp.assignedByUser.firstName && cp.assignedByUser.lastName 
            ? `${cp.assignedByUser.firstName} ${cp.assignedByUser.lastName}` 
            : cp.assignedByUser.email)
        } : null
      }));

      return NextResponse.json({
        id: student.id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        gender: student.gender,
        department: student.department,
        year: student.year,
        registerNumber: student.registerNumber,
        careerPaths: transformedCareerPaths,
        favoriteLanguage: student.favoriteLanguage,
        role: 'student'
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid role' }, { status: 403 });
    }
  } catch (error: unknown) {
    console.error('GET /auth/me error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
