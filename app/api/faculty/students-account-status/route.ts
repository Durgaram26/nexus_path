import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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

// GET - Check account status for students
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking account status for students...');
    
    const payload = getAuthPayload(request);
    if (!payload || !['faculty', 'admin'].includes((payload as any).role)) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentIds = searchParams.get('studentIds');
    console.log('📝 Student IDs requested:', studentIds);

    if (!studentIds) {
      console.log('❌ No student IDs provided');
      return NextResponse.json({ 
        message: 'Student IDs are required' 
      }, { status: 400 });
    }

    const ids = studentIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    console.log('🔢 Parsed student IDs:', ids);

    if (ids.length === 0) {
      console.log('❌ No valid student IDs found');
      return NextResponse.json({ 
        message: 'No valid student IDs provided' 
      }, { status: 400 });
    }

    // Get students with their account status
    console.log('🔍 Fetching students from database...');
    console.log('🔍 Querying for student IDs:', ids);
    
    const students = await prisma.student.findMany({
      where: { id: { in: ids } },
      include: {
        department: true
      }
    });
    console.log(`✅ Found ${students.length} students`);
    console.log('📝 Students found:', students.map(s => ({ id: s.id, name: s.name, email: s.email })));

    // Also check if there are any users with these emails (in case admin created accounts)
    const studentEmails = students.map(s => s.email);
    console.log('📧 Student emails:', studentEmails);
    
    const usersWithEmails = await prisma.user.findMany({
      where: {
        email: { in: studentEmails }
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    console.log(`👥 Found ${usersWithEmails.length} users with matching emails`);

    // Create a map of email to user for quick lookup
    const userMap = new Map(usersWithEmails.map(u => [u.email, u]));

    console.log('🔄 Processing results...');
    const results = students.map(student => {
      // Check if there's a user account for this student's email
      const hasUserAccount = userMap.has(student.email);
      const userAccount = userMap.get(student.email);
      
      // Determine account source based on current user's role
      let accountSource = null;
      if (hasUserAccount && userAccount) {
        // For now, determine source based on who is checking the status
        const currentUserRole = (payload as any).role;
        if (currentUserRole === 'faculty') {
          // If faculty is checking, assume they created it (for faculty portal)
          accountSource = 'faculty';
        } else {
          // If admin is checking, assume admin created it
          accountSource = 'admin';
        }
      }
      
      const result = {
        studentId: student.id,
        email: student.email,
        name: student.name,
        registerNumber: student.registerNumber,
        department: student.department?.name || 'Unknown',
        year: student.year,
        hasAccount: hasUserAccount,
        accountCreatedAt: userAccount?.createdAt || null,
        accountSource: accountSource
      };
      
      console.log(`👤 Student ${student.name}: hasAccount=${result.hasAccount}, source=${result.accountSource}`);
      return result;
    });

    const summary = {
      total: results.length,
      withAccounts: results.filter(r => r.hasAccount).length,
      withoutAccounts: results.filter(r => !r.hasAccount).length
    };
    
    console.log('📊 Summary:', summary);
    console.log('✅ Returning results successfully');

    return NextResponse.json({
      success: true,
      results,
      summary
    });

  } catch (error) {
    console.error('GET /api/faculty/students-account-status:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
