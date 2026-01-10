import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

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
    console.log('Quiz history API called');
    
    const payload = getAuthPayload(request);
    if (!payload) {
      console.log('No auth payload found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (payload as any).userId;
    console.log('Auth payload:', { userId });

    // Get user information first to get email
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student information by email
    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });
    
    if (!student) {
      console.log('Student not found');
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    console.log('Student found:', student.id);
    
    // Get all quiz attempts for the student
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        studentId: student.id
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

    console.log('Quiz attempts found:', attempts.length);

    // Format the attempts
    const formattedAttempts = attempts.map(attempt => {
      try {
        return {
          id: attempt.id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt?.toISOString() || null,
          timeSpent: attempt.timeSpent,
          wrongAnswers: attempt.wrongAnswers ? JSON.parse(attempt.wrongAnswers) : [],
          feedback: attempt.feedback || '',
          quizDate: attempt.adaptiveQuiz?.quizDate || null,
          totalQuestionsInQuiz: attempt.adaptiveQuiz?.questions ? JSON.parse(attempt.adaptiveQuiz.questions).length : 0
        };
      } catch (error) {
        console.error('Error formatting attempt:', error, attempt);
        return {
          id: attempt.id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt?.toISOString() || null,
          timeSpent: attempt.timeSpent,
          wrongAnswers: [],
          feedback: '',
          quizDate: null,
          totalQuestionsInQuiz: 0
        };
      }
    });

    // Group attempts by date and show only the most recent attempt for each day
    const groupedAttempts = new Map();
    
    formattedAttempts.forEach(attempt => {
      if (attempt.quizDate) {
        const dateKey = new Date(attempt.quizDate).toISOString().split('T')[0];
        
        // Show the most recent attempt (highest attempt number) for each day
        if (!groupedAttempts.has(dateKey) || attempt.attemptNumber > groupedAttempts.get(dateKey).attemptNumber) {
          groupedAttempts.set(dateKey, {
            ...attempt,
            dateKey,
            totalAttemptsForDay: formattedAttempts.filter(a => 
              a.quizDate && new Date(a.quizDate).toISOString().split('T')[0] === dateKey
            ).length
          });
        }
      }
    });

    // Convert back to array and sort by date (newest first)
    const finalAttempts = Array.from(groupedAttempts.values()).sort((a, b) => 
      new Date(b.quizDate).getTime() - new Date(a.quizDate).getTime()
    );

    // Calculate additional statistics using grouped attempts
    const totalAttempts = finalAttempts.length;
    let averageScore = 0;
    let bestScore = 0;
    
    if (totalAttempts > 0) {
      try {
        const scores = finalAttempts.map(attempt => attempt.score || 0);
        averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
        bestScore = Math.max(...scores);
      } catch (error) {
        console.error('Error calculating statistics:', error);
        averageScore = 0;
        bestScore = 0;
      }
    }
    
    // Calculate streak using grouped attempts
    let currentStreak = 0;
    try {
      for (const attempt of finalAttempts) {
        if (attempt.score && attempt.score >= 70) {
          currentStreak++;
        } else {
          break;
        }
      }
    } catch (error) {
      console.error('Error calculating streak:', error);
      currentStreak = 0;
    }

    // Get recent performance (last 7 days) using grouped attempts
    let recentAttempts = [];
    let recentAverage = 0;
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      recentAttempts = finalAttempts.filter(attempt => 
        attempt.completedAt && attempt.completedAt >= sevenDaysAgo
      );

      if (recentAttempts.length > 0) {
        const recentScores = recentAttempts.map(attempt => attempt.score || 0);
        recentAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentAttempts.length;
      }
    } catch (error) {
      console.error('Error calculating recent performance:', error);
      recentAttempts = [];
      recentAverage = 0;
    }

    console.log('Returning quiz history:', {
      originalAttempts: formattedAttempts.length,
      groupedAttempts: finalAttempts.length,
      totalAttempts,
      averageScore,
      bestScore,
      currentStreak
    });

    return NextResponse.json({
      attempts: finalAttempts,
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
    console.error('GET /api/student/quiz-history error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
