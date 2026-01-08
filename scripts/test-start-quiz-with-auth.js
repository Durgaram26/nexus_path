const axios = require('axios');

async function testStartQuizWithAuth() {
  try {
    console.log('🧪 Testing start quiz with proper authentication...');
    
    // First, let's get a real auth token by logging in
    console.log('\n1. Getting authentication token...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'keerthanarajaram255@gmail.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log('✅ Authentication successful, token obtained');
      
      // Now test the start-quiz API with proper authentication
      console.log('\n2. Testing start-quiz API with authentication...');
      const startQuizResponse = await axios.post('http://localhost:3000/api/student/start-quiz', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Start Quiz Response:');
      console.log('- Success:', startQuizResponse.data.success);
      console.log('- Quiz ID:', startQuizResponse.data.quizId);
      console.log('- Total questions:', startQuizResponse.data.totalQuestions);
      console.log('- General questions:', startQuizResponse.data.generalQuestions);
      console.log('- Coding questions:', startQuizResponse.data.codingQuestions);
      
      if (startQuizResponse.data.questions && startQuizResponse.data.questions.length > 0) {
        console.log('\n📝 Sample questions:');
        startQuizResponse.data.questions.slice(0, 2).forEach((question, index) => {
          console.log(`\nQuestion ${index + 1}:`);
          console.log('- Question:', question.question);
          console.log('- Options:', question.options);
          console.log('- Correct answer:', question.correctAnswer);
          console.log('- Difficulty:', question.difficulty);
          console.log('- Category:', question.category);
        });
      }
      
    } else {
      console.log('❌ Authentication failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing start quiz:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - check credentials');
    } else if (error.response?.status === 403) {
      console.log('🚫 Authorization failed - check user role');
    }
  }
}

testStartQuizWithAuth();
