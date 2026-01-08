import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic database connection
    const studentCount = await prisma.student.count();
    const userCount = await prisma.user.count();
    const departmentCount = await prisma.department.count();
    
    console.log('✅ Database connection successful');
    console.log(`📊 Counts: Students: ${studentCount}, Users: ${userCount}, Departments: ${departmentCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        students: studentCount,
        users: userCount,
        departments: departmentCount
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}