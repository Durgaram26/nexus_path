const fetch = require('node-fetch');

async function testQuizAPI() {
  try {
    console.log('🧪 Testing Quiz API endpoints...');
    
    // Test daily quiz API
    console.log('\n📝 Testing /student/daily-quiz...');
    const quizResponse = await fetch('http://localhost:3000/api/student/daily-quiz', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log('✅ Daily Quiz API Response:', JSON.stringify(quizData, null, 2));
    } else {
      console.log('❌ Daily Quiz API Error:', quizResponse.status, quizResponse.statusText);
    }
    
    // Test quiz history API
    console.log('\n📝 Testing /student/quiz-history...');
    const historyResponse = await fetch('http://localhost:3000/api/student/quiz-history', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Quiz History API Response:', JSON.stringify(historyData, null, 2));
    } else {
      console.log('❌ Quiz History API Error:', historyResponse.status, historyResponse.statusText);
    }
    
    console.log('\n💡 To fix "Loading quiz data..." issue:');
    console.log('1. Check browser console for "Quiz status:" logs');
    console.log('2. Verify API responses in Network tab');
    console.log('3. Make sure you have a valid authentication token');
    console.log('4. Check if the backend server is running');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testQuizAPI();
