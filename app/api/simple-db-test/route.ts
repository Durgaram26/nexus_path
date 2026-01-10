import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Simple Database Test...');

    // Dynamic import to avoid issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    console.log('✅ Prisma client created successfully');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Test simple query
    const result = await (prisma as any).$queryRaw`SELECT 1 as test`;
    console.log('✅ Raw query successful:', result);

    // Test if tables exist
    const tables = await (prisma as any).$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('CodeTestSession', 'CodeTestQuestionResult', 'CodeExecutionHistory')
    `;
    console.log('✅ Tables found:', tables);

    // Test creating a simple record
    try {
      const testRecord = await prisma.codeExecutionHistory.create({
        data: {
          studentId: '1',
          language: 'Python 3',
          languageId: 71,
          code: 'print("test")',
          status: 'success'
        }
      });
      console.log('✅ Record created successfully:', testRecord.id);

      // Clean up test record
      await prisma.codeExecutionHistory.delete({
        where: { id: testRecord.id }
      });
      console.log('✅ Test record cleaned up');

    } catch (createError) {
      console.error('❌ Failed to create record:', createError);
      const errorMessage = createError instanceof Error ? createError.message : String(createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create record',
        details: errorMessage
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Simple database test passed!',
      tables: tables
    });

  } catch (error: any) {
    console.error('❌ Simple database test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple database test failed',
      details: error.message,
      stack: error.stack
    });
  }
}

