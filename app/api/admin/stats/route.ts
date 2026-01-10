import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get counts from database
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalColleges,
      totalDepartments,
      totalCareerPaths,
      totalRoadmaps
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'faculty' } }),
      prisma.college.count(),
      prisma.department.count(),
      prisma.careerPath.count(),
      prisma.roadmap.count()
    ]);

    // Debug: Let's also get all users to see what's in the database
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });

    console.log('All users in database:', allUsers);
    console.log('User counts:', {
      totalUsers,
      totalStudents,
      totalFaculty
    });

    const stats = {
      totalUsers,
      totalStudents,
      totalFaculty,
      totalColleges,
      totalDepartments,
      totalCareerPaths,
      totalRoadmaps
    };

    console.log('Admin stats:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admin statistics' 
    }, { status: 500 });
  }
}
