import { NextRequest, NextResponse } from 'next/server';

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return token;
}

// GET - Check if student has taken daily test today
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const studentId = 1; // TODO: Get from JWT payload

    // Check if test was taken today by looking at recent test sessions
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check for test sessions today
      const todaySessions = await prisma.codeTestSession.findMany({
        where: {
          studentId: studentId,
          sessionDate: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      const testTakenToday = todaySessions.length > 0;

      return NextResponse.json({
        success: true,
        testTakenToday,
        todaySessions: todaySessions.length,
        lastTestDate: todaySessions.length > 0 ? todaySessions[0].sessionDate : null
      });

    } catch (dbError) {
      console.log('Database error, using localStorage fallback');
      
      // Fallback to localStorage check
      const lastTestDate = localStorage?.getItem('lastTestDate');
      const today = new Date().toDateString();
      const testTakenToday = lastTestDate === today;

      return NextResponse.json({
        success: true,
        testTakenToday,
        todaySessions: testTakenToday ? 1 : 0,
        lastTestDate: testTakenToday ? new Date().toISOString() : null
      });
    }

  } catch (error: any) {
    console.error('Error checking daily test status:', error);
    return NextResponse.json(
      { error: 'Failed to check daily test status' },
      { status: 500 }
    );
  }
}
