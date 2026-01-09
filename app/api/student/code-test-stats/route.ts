import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { CodeExecution, CodeTestResult } from '@prisma/client';

function getAuthPayload(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const tokenFromHeader = bearer?.startsWith('Bearer ')
    ? bearer.substring('Bearer '.length)
    : undefined;
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const token = tokenFromHeader || tokenFromCookie;
  return token ? verifyToken(token) : null;
}

// GET - Get code test statistics for student
export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);
    if (!payload || (payload as any).role !== 'student') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const studentId = (payload as any).userId;

    // Try to get code execution history
    let codeExecutions: CodeExecution[] = [];
    try {
      codeExecutions = await prisma.codeExecution.findMany({
        where: {
          studentId: studentId
        },
        orderBy: {
          executedAt: 'desc'
        }
      });
    } catch (dbError) {
      console.log('CodeExecution table not found, using empty data');
      codeExecutions = [];
    }

    // Try to get code test results
    let codeTestResults: CodeTestResult[] = [];
    try {
      codeTestResults = await prisma.codeTestResult.findMany({
        where: {
          studentId: studentId
        },
        orderBy: {
          completedAt: 'desc'
        }
      });
    } catch (dbError) {
      console.log('CodeTestResult table not found, using empty data');
      codeTestResults = [];
    }

    // Calculate statistics
    const totalTests = codeTestResults.length;
    const completedTests = codeTestResults.filter(result => result.status === 'completed').length;
    const totalSessions = codeExecutions.length;
    const codeExecutionsCount = codeExecutions.length;
    
    // Calculate average score
    const scores = codeTestResults.map(result => result.score || 0);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Calculate current streak (consecutive days with code execution)
    const currentStreak = calculateCurrentStreak(codeExecutions);

    // Get unique languages used
    const languages = [...new Set(codeExecutions.map(exec => exec.language))];

    const stats = {
      totalTests,
      completedTests,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      currentStreak,
      languages,
      totalSessions,
      codeExecutions: codeExecutionsCount
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('GET /api/student/code-test-stats error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

function calculateCurrentStreak(executions: any[]): number {
  if (executions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const currentDate = new Date(today);
  
  // Group executions by date
  const executionsByDate = new Map();
  executions.forEach(execution => {
    const date = new Date(execution.executedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!executionsByDate.has(dateKey)) {
      executionsByDate.set(dateKey, []);
    }
    executionsByDate.get(dateKey).push(execution);
  });
  
  // Calculate streak backwards from today
  while (currentDate >= new Date('2020-01-01')) { // Reasonable start date
    const dateKey = currentDate.toISOString().split('T')[0];
    
    if (executionsByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
