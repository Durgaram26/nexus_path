import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';
import { GeminiAIService } from '../../../../lib/gemini-ai';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get or generate daily quiz
export async function GET(request: NextRequest) {
  try {
    console.log('Daily quiz API called');
    
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload) {
      console.log('No payload found - checking headers and cookies');
      console.log('Authorization header:', request.headers.get('authorization'));
      console.log('Cookies:', request.headers.get('cookie'));
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!['student'].includes((payload as any).role)) {
      console.log('Authentication failed - invalid role:', (payload as any).role);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if a specific quizId is requested
    const { searchParams } = new URL(request.url);
    const quizIdParam = searchParams.get('quizId');
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log('Student ID:', (payload as any).userId, 'Today:', todayString);
    
    if (quizIdParam) {
      console.log('Specific quiz requested:', quizIdParam);
      // Return the specific quiz
      const specificQuiz = await prisma.adaptiveQuiz.findUnique({
        where: { id: parseInt(quizIdParam) },
        include: {
          student: true,
          quizAttempts: true
        }
      });
      
      if (!specificQuiz) {
        return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
      }
      
      const questions = JSON.parse(specificQuiz.questions);
      const totalAttempts = specificQuiz.totalAttempts || 0;
      const bestScore = specificQuiz.bestScore || 0;
      
      return NextResponse.json({
        success: true,
        quiz: {
          id: specificQuiz.id,
          questions: questions,
          totalQuestions: questions.length,
          totalAttempts: totalAttempts,
          bestScore: bestScore,
          isCompleted: specificQuiz.isCompleted,
          quizDate: specificQuiz.quizDate
        },
        attempts: {
          quizAttempts: specificQuiz.quizAttempts.length,
          todayAttempts: 0
        },
        isNew: false
      });
    }
    
    // Get the user first to get their email
    console.log('Looking up user with ID:', (payload as any).userId);
    const user = await prisma.user.findUnique({
      where: { id: parseInt((payload as any).userId) }
    });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for ID:', (payload as any).userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student's learning plan and career paths
    console.log('Looking up student with email:', user.email);
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      console.log('Student not found for email:', user.email);
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    
    // Check if daily quiz already exists for today
    const existingQuiz = await prisma.adaptiveQuiz.findFirst({
      where: {
        studentId: student.id,
        quizDate: {
          gte: new Date(todayString + 'T00:00:00.000Z'),
          lt: new Date(todayString + 'T23:59:59.999Z')
        }
      }
    });

    if (existingQuiz) {
      console.log('Existing quiz found, returning it');
      
      // Get attempt count for this quiz
      const attemptCount = await prisma.quizAttempt.count({
        where: {
          adaptiveQuizId: existingQuiz.id,
          studentId: student.id
        }
      });
      
      // Also check if there are any attempts for today (regardless of quiz ID)
      const todayAttempts = await prisma.quizAttempt.count({
        where: {
          studentId: student.id,
          completedAt: {
            gte: new Date(todayString + 'T00:00:00.000Z'),
            lt: new Date(todayString + 'T23:59:59.999Z')
          }
        }
      });
      
      console.log('Quiz attempts for this quiz:', attemptCount);
      console.log('Today attempts for student:', todayAttempts);
      
      return NextResponse.json({
        success: true,
        quiz: {
          ...existingQuiz,
          totalAttempts: Math.max(attemptCount, todayAttempts)
        },
        attempts: {
          quizAttempts: attemptCount,
          todayAttempts: todayAttempts
        },
        isNew: false
      });
    }

    // No quiz exists for today - return ready state for AI generation
    console.log('No quiz exists for today, ready for AI generation...');
    
    return NextResponse.json({
      success: true,
      quiz: null,
      isNew: false,
      readyForGeneration: true,
      message: 'Ready to generate AI quiz'
    });

  } catch (error: unknown) {
    console.error('Daily quiz error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST - Submit quiz answers
export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || !['student'].includes((payload as any).role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { quizId, answers, timeSpent } = await request.json();

    // Get the user first to get their email
    const user = await prisma.user.findUnique({
      where: { id: parseInt((payload as any).userId) }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { email: user.email }
    });
    
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Get the quiz
    const quiz = await prisma.adaptiveQuiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    const questions = JSON.parse(quiz.questions);
    let correctAnswers = 0;
    const wrongAnswers: any[] = [];

    questions.forEach((question: any, index: number) => {
      // Handle both question structures: correctAnswer (number) and correct (string)
      const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : question.correct;
      const userAnswer = answers[index];
      
      console.log(`Question ${index + 1}:`, {
        questionId: question.id,
        userAnswer,
        correctAnswer,
        correctAnswerType: typeof correctAnswer,
        question: question.question?.substring(0, 50) + '...'
      });
      
      // Compare based on the type of correct answer
      let isCorrect = false;
      if (typeof correctAnswer === 'number') {
        // correctAnswer is an index (0, 1, 2, 3)
        isCorrect = userAnswer === correctAnswer;
        console.log(`Number comparison: ${userAnswer} === ${correctAnswer} = ${isCorrect}`);
      } else {
        // correctAnswer is a string value, need to find the index
        const correctIndex = question.options ? question.options.indexOf(correctAnswer) : -1;
        isCorrect = userAnswer === correctIndex;
        console.log(`String comparison: ${userAnswer} === ${correctIndex} (index of "${correctAnswer}") = ${isCorrect}`);
      }
      
      if (isCorrect) {
        correctAnswers++;
        console.log(`✓ Correct answer for question ${index + 1}`);
      } else {
        wrongAnswers.push({
          questionId: question.id,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          explanation: question.explanation || 'No explanation available'
        });
        console.log(`✗ Wrong answer for question ${index + 1}`);
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    
    console.log('Quiz scoring summary:', {
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers: wrongAnswers.length,
      score,
      wrongAnswersDetails: wrongAnswers.map(wa => ({
        questionId: wa.questionId,
        userAnswer: wa.userAnswer,
        correctAnswer: wa.correctAnswer
      }))
    });

    // Get current attempt count
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        adaptiveQuizId: quizId,
        studentId: student.id
      }
    });

    const attemptNumber = existingAttempts + 1;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        adaptiveQuizId: quizId,
        studentId: student.id,
        attemptNumber: attemptNumber,
        answers: JSON.stringify(answers),
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: questions.length,
        timeSpent: timeSpent || 0,
        wrongAnswers: JSON.stringify(wrongAnswers),
        feedback: score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practicing!',
        completedAt: new Date()
      }
    });

    // Get best score from all attempts
    const allAttempts = await prisma.quizAttempt.findMany({
      where: {
        adaptiveQuizId: quizId,
        studentId: student.id
      },
      select: {
        score: true
      }
    });

    const bestScore = Math.max(...allAttempts.map(attempt => attempt.score));

    // Update quiz status
    await prisma.adaptiveQuiz.update({
      where: { id: quizId },
      data: {
        isCompleted: attemptNumber >= 2,
        totalAttempts: attemptNumber,
        bestScore: bestScore,
        lastAttemptAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      attempt: attempt,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: questions.length,
      wrongAnswers: wrongAnswers,
      isNewBestScore: score > (allAttempts.length > 1 ? Math.max(...allAttempts.slice(0, -1).map(a => a.score)) : 0),
      previousScore: allAttempts.length > 1 ? Math.max(...allAttempts.slice(0, -1).map(a => a.score)) : null,
      improvement: allAttempts.length > 1 ? score - Math.max(...allAttempts.slice(0, -1).map(a => a.score)) : null,
      canRetake: attemptNumber < 2
    });

  } catch (error: unknown) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}