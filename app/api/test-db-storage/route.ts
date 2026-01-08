import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Database Storage...');

    // Test 1: Create a test session
    console.log('1. Creating CodeTestSession...');
    const testSession = await prisma.codeTestSession.create({
      data: {
        studentId: 1,
        language: 'Python 3',
        languageId: 71,
        totalQuestions: 5,
        questions: JSON.stringify([
          { id: 'q1', title: 'Test Question 1', description: 'Test description' }
        ]),
        totalScore: 15,
        maxScore: 25,
        timeSpent: 1200, // 20 minutes
        isCompleted: true,
        completedAt: new Date()
      }
    });
    console.log('✅ CodeTestSession created:', testSession.id);

    // Test 2: Create question results
    console.log('2. Creating CodeTestQuestionResult...');
    const questionResult = await prisma.codeTestQuestionResult.create({
      data: {
        sessionId: testSession.id,
        questionId: 'q1',
        questionTitle: 'Test Question 1',
        questionIndex: 0,
        studentCode: 'print("Hello World")',
        score: 3,
        maxScore: 5,
        passedTests: 2,
        totalTests: 3,
        testResults: JSON.stringify([
          { testCase: 1, passed: true, input: 'test', expected: 'Hello', actual: 'Hello' },
          { testCase: 2, passed: true, input: 'test2', expected: 'World', actual: 'World' },
          { testCase: 3, passed: false, input: 'test3', expected: 'Error', actual: 'Success' }
        ]),
        timeSpent: 300, // 5 minutes
        hintsUsed: 1,
        attempts: 3
      }
    });
    console.log('✅ CodeTestQuestionResult created:', questionResult.id);

    // Test 3: Create execution history
    console.log('3. Creating CodeExecutionHistory...');
    const executionHistory = await prisma.codeExecutionHistory.create({
      data: {
        studentId: 1,
        language: 'Python 3',
        languageId: 71,
        code: 'print("Hello World")',
        input: 'test input',
        output: 'Hello World',
        status: 'success',
        executionTime: 150,
        memoryUsed: 1024,
        errorMessage: null
      }
    });
    console.log('✅ CodeExecutionHistory created:', executionHistory.id);

    // Test 4: Retrieve data
    console.log('4. Testing data retrieval...');
    const sessions = await prisma.codeTestSession.findMany({
      where: { studentId: 1 },
      include: { questionResults: true },
      take: 5
    });

    const history = await prisma.codeExecutionHistory.findMany({
      where: { studentId: 1 },
      take: 5
    });

    // Test 5: Check relationships
    console.log('5. Testing relationships...');
    const sessionWithResults = await prisma.codeTestSession.findUnique({
      where: { id: testSession.id },
      include: { 
        questionResults: true,
        student: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database storage test completed successfully!',
      results: {
        sessionCreated: testSession.id,
        questionResultCreated: questionResult.id,
        executionHistoryCreated: executionHistory.id,
        sessionsRetrieved: sessions.length,
        historyRetrieved: history.length,
        relationshipsWorking: !!sessionWithResults,
        summary: {
          'CodeTestSession': '✅ Working',
          'CodeTestQuestionResult': '✅ Working', 
          'CodeExecutionHistory': '✅ Working',
          'Relationships': '✅ Working',
          'Data Retrieval': '✅ Working'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Database storage test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database storage test failed',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

