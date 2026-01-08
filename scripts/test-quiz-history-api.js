const axios = require('axios');

async function testQuizHistoryAPI() {
  try {
    console.log('🧪 Testing quiz history API...');
    
    // Test the quiz history API endpoint
    const response = await axios.get('http://localhost:3000/api/student/quiz-history', {
      headers: {
        'Authorization': 'Bearer test-token', // This might fail auth, but let's see what happens
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.data);
    console.log('📊 Status:', response.status);
    
  } catch (error) {
    console.error('❌ Error testing quiz history API:', error.response?.data || error.message);
    console.log('📊 Status:', error.response?.status);
  }
}

testQuizHistoryAPI();
