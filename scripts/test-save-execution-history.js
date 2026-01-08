const axios = require('axios');

async function testSaveExecutionHistory() {
  try {
    console.log('🧪 Testing save execution history API...');
    
    const testData = {
      studentId: 1, // Use student ID 1 for testing
      language: 'JavaScript',
      languageId: 63,
      code: 'console.log("Hello World");',
      input: '',
      output: 'Hello World',
      status: 'success',
      executionTime: 100,
      memoryUsed: 1024,
      errorMessage: null
    };
    
    console.log('📝 Test data:', testData);
    
    const response = await axios.post('http://localhost:3000/api/student/code-execution-history', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.data);
    console.log('📊 Status:', response.status);
    
  } catch (error) {
    console.error('❌ Error testing save execution history:', error.response?.data || error.message);
  }
}

testSaveExecutionHistory();
