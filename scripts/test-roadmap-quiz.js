const axios = require('axios');

async function testRoadmapQuiz() {
  try {
    console.log('🧪 Testing roadmap-based quiz generation...');
    
    // Test the roadmap quiz API
    const response = await axios.post('http://localhost:3000/api/student/roadmap-quiz', {
      studentId: 1, // Use the first student
      quizType: 'general',
      count: 5
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Roadmap Quiz API Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Questions generated:', response.data.count);
    console.log('Quiz type:', response.data.quizType);
    console.log('Roadmap info:', response.data.roadmapInfo);
    
    if (response.data.questions && response.data.questions.length > 0) {
      console.log('\n📝 Sample question:');
      console.log('Question:', response.data.questions[0].question);
      console.log('Options:', response.data.questions[0].options);
      console.log('Correct answer:', response.data.questions[0].correctAnswer);
      console.log('Explanation:', response.data.questions[0].explanation);
    }
    
  } catch (error) {
    console.error('❌ Error testing roadmap quiz:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testRoadmapQuiz();
