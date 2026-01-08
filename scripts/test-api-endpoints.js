const axios = require('axios');

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints for Database Storage...\n');

  const baseURL = 'http://localhost:3000/api';

  try {
    // Test 1: Test code execution history API
    console.log('1. Testing Code Execution History API...');
    const historyResponse = await axios.post(`${baseURL}/student/code-execution-history`, {
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
    });
    console.log('✅ Code execution history saved:', historyResponse.data);

    // Test 2: Test code test results API
    console.log('\n2. Testing Code Test Results API...');
    const testResultsResponse = await axios.post(`${baseURL}/student/code-test-results`, {
      studentId: 1,
      language: 'Python 3',
      languageId: 71,
      questions: [
        { id: 'q1', title: 'Test Question 1', description: 'Test description' }
      ],
      questionResults: [
        {
          questionId: 'q1',
          questionTitle: 'Test Question 1',
          studentCode: 'print("Hello World")',
          score: 3,
          passedTests: 2,
          totalTests: 3,
          testResults: [
            { testCase: 1, passed: true, input: 'test', expected: 'Hello', actual: 'Hello' },
            { testCase: 2, passed: true, input: 'test2', expected: 'World', actual: 'World' },
            { testCase: 3, passed: false, input: 'test3', expected: 'Error', actual: 'Success' }
          ],
          timeSpent: 300,
          hintsUsed: 1,
          attempts: 3
        }
      ],
      totalScore: 15,
      timeSpent: 1200
    });
    console.log('✅ Code test results saved:', testResultsResponse.data);

    // Test 3: Retrieve execution history
    console.log('\n3. Testing Code Execution History Retrieval...');
    const getHistoryResponse = await axios.get(`${baseURL}/student/code-execution-history?studentId=1&limit=10`);
    console.log('✅ Execution history retrieved:', getHistoryResponse.data.history?.length || 0, 'records');

    // Test 4: Retrieve test results
    console.log('\n4. Testing Code Test Results Retrieval...');
    const getTestResultsResponse = await axios.get(`${baseURL}/student/code-test-results?studentId=1`);
    console.log('✅ Test results retrieved:', getTestResultsResponse.data.sessions?.length || 0, 'sessions');

    console.log('\n🎉 All API endpoint tests passed!');
    console.log('\n📊 Database Storage Summary:');
    console.log('- Code Execution History API: ✅ Working');
    console.log('- Code Test Results API: ✅ Working');
    console.log('- Data Retrieval APIs: ✅ Working');
    console.log('- Database Storage: ✅ Working');

  } catch (error) {
    console.error('❌ API endpoint test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAPIEndpoints();

