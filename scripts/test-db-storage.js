const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseStorage() {
  console.log('🧪 Testing Database Storage for Code Test Results...\n');

  try {
    // Test 1: Check if we can create a test session
    console.log('1. Testing CodeTestSession creation...');
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

    // Test 2: Check if we can create question results
    console.log('\n2. Testing CodeTestQuestionResult creation...');
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

    // Test 3: Check if we can create execution history
    console.log('\n3. Testing CodeExecutionHistory creation...');
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

    // Test 4: Check if we can retrieve data
    console.log('\n4. Testing data retrieval...');
    const sessions = await prisma.codeTestSession.findMany({
      where: { studentId: 1 },
      include: { questionResults: true },
      take: 5
    });
    console.log('✅ Retrieved sessions:', sessions.length);

    const history = await prisma.codeExecutionHistory.findMany({
      where: { studentId: 1 },
      take: 5
    });
    console.log('✅ Retrieved execution history:', history.length);

    // Test 5: Check relationships
    console.log('\n5. Testing relationships...');
    const sessionWithResults = await prisma.codeTestSession.findUnique({
      where: { id: testSession.id },
      include: { 
        questionResults: true,
        student: true
      }
    });
    console.log('✅ Session with relationships:', {
      sessionId: sessionWithResults?.id,
      questionResultsCount: sessionWithResults?.questionResults.length,
      studentId: sessionWithResults?.studentId
    });

    console.log('\n🎉 All database storage tests passed!');
    console.log('\n📊 Database Storage Summary:');
    console.log('- CodeTestSession: ✅ Working');
    console.log('- CodeTestQuestionResult: ✅ Working');
    console.log('- CodeExecutionHistory: ✅ Working');
    console.log('- Relationships: ✅ Working');
    console.log('- Data Retrieval: ✅ Working');

  } catch (error) {
    console.error('❌ Database storage test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseStorage();

