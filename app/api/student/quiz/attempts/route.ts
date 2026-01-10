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

// GET - Get student's quiz attempts and statistics
export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass authentication for testing
    // const payload = getAuthPayload(request);
    // if (!payload || ![''].includes((payload as any).role)) {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    //      // Mock ID for testing
    
    // For now, return empty array since we don't have a QuizAttempt model yet
    // In a real implementation, you would query the database
    const attempts: unknown[] = [];
    
    // Add adaptive learning logic - analyze weak areas
    const weakAreas = ['Technical Skills', 'Problem Solving']; // Mock weak areas
    const strongAreas = ['Communication', 'Leadership']; // Mock strong areas

    // Calculate statistics
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a: any) => a.isCorrect).length;
    const totalPoints = attempts.reduce((sum: number, a: any) => sum + a.earnedPoints, 0);
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    return NextResponse.json({
      attempts,
      statistics: {
        totalAttempts,
        correctAttempts,
        totalPoints,
        accuracy: Math.round(accuracy * 100) / 100
      }
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/quiz/attempts error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

// POST - Record a new quiz attempt
export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass authentication for testing
    // const payload = getAuthPayload(request);
    // if (!payload || ![''].includes((payload as any).role)) {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    //      // Mock ID for testing
    const { quizId, selectedAnswer, isCorrect, earnedPoints, category, difficulty, question, options, correctAnswer, explanation } = await request.json();

    if (!quizId || selectedAnswer === undefined) {
      return NextResponse.json({ message: 'Quiz ID and selected answer are required' }, { status: 400 });
    }

    // Create new attempt record with more detailed information
    const attempt = {
      id: Date.now(),
      quizId,
      
      selectedAnswer,
      isCorrect,
      earnedPoints: earnedPoints || 0,
      attemptedAt: new Date().toISOString(),
      category,
      difficulty,
      question,
      options,
      correctAnswer,
      explanation,
      // Add learning insights
      learningInsights: {
        weakAreas: !isCorrect ? [category] : [],
        strongAreas: isCorrect ? [category] : [],
        recommendedFocus: !isCorrect ? `Focus on ${category.toLowerCase()} concepts` : `Great job with ${category.toLowerCase()}!`
      }
    };

    // Generate personalized feedback based on performance
    let feedback = '';
    if (isCorrect) {
      feedback = `Excellent! You correctly answered the ${difficulty.toLowerCase()} ${category.toLowerCase()} question. Keep up the great work!`;
    } else {
      feedback = `Good attempt! The correct answer was "${options[correctAnswer]}". ${explanation} Consider reviewing ${category.toLowerCase()} concepts to strengthen your understanding.`;
    }

    return NextResponse.json({ 
      attempt,
      feedback,
      message: 'Quiz attempt recorded successfully',
      // Add recommendations for next steps
      recommendations: {
        nextQuizFocus: !isCorrect ? category : 'Continue with current level',
        studySuggestions: !isCorrect ? [
          `Review ${category.toLowerCase()} fundamentals`,
          'Practice more questions in this area',
          'Consider seeking additional '
        ] : [
          'Great ! Try more challenging questions',
          'Explore advanced topics in this area'
        ]
      }
    }, { status: 201 });
  } catch (error) {
    console.error('POST ///quiz/attempts :');
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
