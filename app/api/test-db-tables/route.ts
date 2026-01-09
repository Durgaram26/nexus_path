import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Database Tables...');

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('CodeTestSession', 'CodeTestQuestionResult', 'CodeExecutionHistory')
    `;
    
    console.log('✅ Available tables:', tables);

    // Test if we can query the tables
    try {
      const sessions = await prisma.codeTestSession.findMany({ take: 1 });
      console.log('✅ CodeTestSession table accessible:', sessions.length, 'records');
    } catch (error: any) {
      console.log('❌ CodeTestSession table error:', error.message);
    }

    try {
      const questionResults = await prisma.codeTestQuestionResult.findMany({ take: 1 });
      console.log('✅ CodeTestQuestionResult table accessible:', questionResults.length, 'records');
    } catch (error: any) {
      console.log('❌ CodeTestQuestionResult table error:', error.message);
    }

    try {
      const executionHistory = await prisma.codeExecutionHistory.findMany({ take: 1 });
      console.log('✅ CodeExecutionHistory table accessible:', executionHistory.length, 'records');
    } catch (error: any) {
      console.log('❌ CodeExecutionHistory table error:', error.message);
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Database tables test completed!',
      tables: tables
    });

  } catch (error: any) {
    console.error('❌ Database tables test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database tables test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

