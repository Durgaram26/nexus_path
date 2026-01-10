import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { 
      studentId, 
      language, 
      languageId, 
      questions, 
      questionResults, 
      totalScore, 
      timeSpent 
    } = body;

    if (!studentId || !language || !questions || !questionResults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create code test session
    const session = await prisma.codeTestSession.create({
      data: {
        studentId,
        language,
        languageId,
        totalQuestions: questions.length,
        questions: JSON.stringify(questions),
        totalScore,
        maxScore: questions.length * 5, // 5 marks per question
        timeSpent,
        isCompleted: true,
        completedAt: new Date(),
      }
    });

    // Create question results
    const results = await Promise.all(
      questionResults.map((result: any, index: number) =>
        prisma.codeTestQuestionResult.create({
          data: {
            sessionId: session.id,
            questionId: result.questionId,
            questionTitle: result.questionTitle,
            questionIndex: index,
            studentCode: result.studentCode,
            score: result.score,
            maxScore: 5,
            passedTests: result.passedTests,
            totalTests: result.totalTests,
            testResults: JSON.stringify(result.testResults),
            timeSpent: result.timeSpent,
            hintsUsed: result.hintsUsed || 0,
            attempts: result.attempts || 0,
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      totalScore,
      maxScore: session.maxScore,
      results: results.length
    });

  } catch (error: any) {
    console.error('Error saving code test results:', error);
    return NextResponse.json(
      { error: 'Failed to save test results' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get code test sessions for the student
    const sessions = await prisma.codeTestSession.findMany({
      where: { studentId: studentId },
      include: {
        questionResults: true
      },
      orderBy: { sessionDate: 'desc' },
      take: 20 // Last 20 sessions
    });

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error: any) {
    console.error('Error fetching code test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}
