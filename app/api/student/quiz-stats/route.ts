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

// GET - Get quiz statistics for student
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;

    // Get user information first to get email
    const user = await prisma.user.findUnique({
      where: { id: (payload as any).userId as number }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student information by email
    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });
    
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Try to get quiz attempts for the student
    let quizAttempts: any[] = [];
    try {
      quizAttempts = await prisma.quizAttempt.findMany({
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
    } catch (dbError) {
      console.log('QuizAttempt table not found, using empty data');
      quizAttempts = [];
    }

    // Calculate statistics
    const totalQuizzes = quizAttempts.length;
    const totalQuestions = quizAttempts.reduce((sum, attempt) => sum + (attempt.totalQuestions || 0), 0);
    const correctAnswers = quizAttempts.reduce((sum, attempt) => sum + (attempt.correctAnswers || 0), 0);
    const averageScore = totalQuizzes > 0 ? quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalQuizzes : 0;
    const bestScore = totalQuizzes > 0 ? Math.max(...quizAttempts.map(attempt => attempt.score || 0)) : 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate current streak (consecutive days with quiz attempts)
    const currentStreak = calculateCurrentStreak(quizAttempts);
    const longestStreak = calculateLongestStreak(quizAttempts);

    const stats = {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      currentStreak,
      longestStreak,
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy)
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/quiz-stats error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

function calculateCurrentStreak(attempts: any[]): number {
  if (attempts.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const currentDate = new Date(today);
  
  // Group attempts by date
  const attemptsByDate = new Map();
  attempts.forEach(attempt => {
    const date = new Date(attempt.completedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!attemptsByDate.has(dateKey)) {
      attemptsByDate.set(dateKey, []);
    }
    attemptsByDate.get(dateKey).push(attempt);
  });
  
  // Calculate streak backwards from today
  while (currentDate >= new Date('2020-01-01')) { // Reasonable start date
    const dateKey = currentDate.toISOString().split('T')[0];
    
    if (attemptsByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(attempts: any[]): number {
  if (attempts.length === 0) return 0;
  
  // Group attempts by date
  const attemptsByDate = new Map();
  attempts.forEach(attempt => {
    const date = new Date(attempt.completedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!attemptsByDate.has(dateKey)) {
      attemptsByDate.set(dateKey, []);
    }
    attemptsByDate.get(dateKey).push(attempt);
  });
  
  // Sort dates
  const sortedDates = Array.from(attemptsByDate.keys()).sort();
  
  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const dateKey of sortedDates) {
    const currentDate = new Date(dateKey);
    
    if (lastDate === null) {
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    lastDate = currentDate;
  }
  
  return Math.max(maxStreak, currentStreak);
}
