const axios = require('axios');

async function testAIDailyQuiz() {
  try {
    console.log('🧪 Testing AI daily quiz generation...');
    
    // First, let's test the roadmap quiz API directly
    console.log('\n1. Testing roadmap quiz API...');
    const roadmapResponse = await axios.post('http://localhost:3000/api/student/roadmap-quiz', {
      studentId: 1,
      quizType: 'general',
      count: 3
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Roadmap Quiz Response:');
    console.log('- Success:', roadmapResponse.data.success);
    console.log('- Questions generated:', roadmapResponse.data.count);
    console.log('- Quiz type:', roadmapResponse.data.quizType);
    console.log('- Department:', roadmapResponse.data.roadmapInfo.department);
    console.log('- Skills:', roadmapResponse.data.roadmapInfo.skills.slice(0, 5));
    
    if (roadmapResponse.data.questions && roadmapResponse.data.questions.length > 0) {
      console.log('\n📝 Sample question:');
      const question = roadmapResponse.data.questions[0];
      console.log('- Question:', question.question);
      console.log('- Options:', question.options);
      console.log('- Correct answer:', question.correctAnswer);
      console.log('- Difficulty:', question.difficulty);
    }
    
    // Now test the daily quiz generation
    console.log('\n2. Testing daily quiz generation...');
    const dailyQuizResponse = await axios.post('http://localhost:3000/api/student/daily-quiz-generate', {
      // No body needed, uses auth token
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This might fail auth, but let's see
      }
    });
    
    console.log('✅ Daily Quiz Generation Response:');
    console.log('- Success:', dailyQuizResponse.data.success);
    console.log('- Quiz ID:', dailyQuizResponse.data.quizId);
    console.log('- Total questions:', dailyQuizResponse.data.totalQuestions);
    console.log('- General questions:', dailyQuizResponse.data.generalQuestions);
    console.log('- Coding questions:', dailyQuizResponse.data.codingQuestions);
    
  } catch (error) {
    console.error('❌ Error testing AI daily quiz:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required - this is expected for protected endpoints');
    }
  }
}

testAIDailyQuiz();
