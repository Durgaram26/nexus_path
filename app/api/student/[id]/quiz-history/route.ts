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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Quiz history API called for student ID:', id);
    
    const payload = getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify the student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    
    // Get all quiz attempts for the student
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        studentId: parseInt(id)
      },
      include: {
        adaptiveQuiz: {
          select: {
            quizDate: true,
            questions: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    // Format the attempts
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.completedAt.toISOString(),
      timeSpent: attempt.timeSpent,
      wrongAnswers: attempt.wrongAnswers ? JSON.parse(attempt.wrongAnswers) : [],
      feedback: attempt.feedback ? JSON.parse(attempt.feedback) : [],
      quizDate: attempt.adaptiveQuiz.quizDate,
      totalQuestionsInQuiz: attempt.adaptiveQuiz.questions ? JSON.parse(attempt.adaptiveQuiz.questions).length : 0
    }));

    // Calculate additional statistics
    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
      : 0;
    const bestScore = totalAttempts > 0 
      ? Math.max(...attempts.map(attempt => attempt.score)) 
      : 0;
    
    // Calculate streak
    let currentStreak = 0;
    for (const attempt of attempts) {
      if (attempt.score >= 70) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get recent performance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttempts = attempts.filter(attempt => 
      attempt.completedAt >= sevenDaysAgo
    );

    const recentAverage = recentAttempts.length > 0
      ? recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / recentAttempts.length
      : 0;

    return NextResponse.json({
      attempts: formattedAttempts,
      statistics: {
        totalAttempts,
        averageScore,
        bestScore,
        currentStreak,
        recentAverage,
        recentAttempts: recentAttempts.length
      },
      message: 'Quiz history retrieved successfully'
    });

  } catch (error) {
    console.error('GET /api/student/[id]/quiz-history error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
