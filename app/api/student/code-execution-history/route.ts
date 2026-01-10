import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 POST /api/student/code-execution-history - Saving execution history');
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { 
      studentId, 
      language, 
      languageId, 
      code, 
      input, 
      output, 
      status, 
      executionTime, 
      memoryUsed, 
      errorMessage 
    } = body;

    if (!studentId || !language || !code) {
      console.log('❌ Missing required fields:', { studentId: !!studentId, language: !!language, code: !!code });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ All required fields present, saving to database...');

    // Save execution history
    const history = await prisma.codeExecutionHistory.create({
      data: {
        studentId,
        language,
        languageId,
        code,
        input: input || null,
        output: output || null,
        status,
        executionTime: executionTime || null,
        memoryUsed: memoryUsed || null,
        errorMessage: errorMessage || null,
      }
    });

    console.log('✅ Execution history saved successfully with ID:', history.id);

    return NextResponse.json({
      success: true,
      historyId: history.id
    });

  } catch (error: any) {
    console.error('❌ Error saving execution history:', error);
    return NextResponse.json(
      { error: 'Failed to save execution history' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📚 GET /api/student/code-execution-history - Fetching execution history');
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('👤 Student ID from params:', studentId);
    console.log('📊 Limit:', limit);

    if (!studentId) {
      console.log('❌ No student ID provided');
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying database for execution history...');

    // Get execution history for the student
    const history = await prisma.codeExecutionHistory.findMany({
      where: { studentId: studentId },
      orderBy: { executedAt: 'desc' },
      take: limit
    });

    console.log(`📝 Found ${history.length} execution history records for student ${studentId}`);

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error: any) {
    console.error('❌ Error fetching execution history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution history' },
      { status: 500 }
    );
  }
}
