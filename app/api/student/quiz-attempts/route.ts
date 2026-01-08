import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    console.log('Quiz attempts API called');
    
    const payload = getAuthPayload(request);
    if (!payload || !['student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const quizIdParam = searchParams.get('quizId');
    
    if (!quizIdParam) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    const quizId = parseInt(quizIdParam);
    console.log('Fetching attempts for quiz ID:', quizId);

    // Get the student first
    const user = await prisma.user.findUnique({
      where: { id: (payload as any).userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get quiz attempts for this specific quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        adaptiveQuizId: quizId,
        studentId: student.id
      },
      orderBy: {
        attemptedAt: 'desc'
      }
    });

    console.log(`Found ${attempts.length} attempts for quiz ${quizId}`);

    // Transform the attempts data
    const transformedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
      attemptedAt: attempt.attemptedAt,
      completedAt: attempt.completedAt,
      isCorrect: attempt.isCorrect
    }));

    return NextResponse.json({
      success: true,
      attempts: transformedAttempts,
      totalAttempts: attempts.length,
      quizId: quizId
    });

  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: `Failed to fetch quiz attempts: ${error.message}` },
      { status: 500 }
    );
  }
}
