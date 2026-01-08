const { GeminiAIService } = require('../lib/gemini-ai');

async function testGeminiQuizGeneration() {
  try {
    console.log('🧪 Testing Gemini AI quiz generation...');
    
    const geminiService = new GeminiAIService();
    
    const testRequest = {
      studentYear: 2,
      department: 'Computer Science',
      careerPath: 'Software Development',
      currentWeek: 1,
      count: 5 // Generate only 5 questions for testing
    };
    
    console.log('📝 Generating quiz questions with parameters:', testRequest);
    
    const questions = await geminiService.generateQuestionsWithGemini(testRequest);
    
    console.log(`✅ Successfully generated ${questions.length} questions using Gemini AI`);
    console.log('📋 Sample questions:');
    
    questions.slice(0, 2).forEach((question, index) => {
      console.log(`\n${index + 1}. ${question.question}`);
      console.log(`   Options: ${question.options.join(', ')}`);
      console.log(`   Correct Answer: ${question.options[question.correctAnswer]}`);
      console.log(`   Category: ${question.category}, Difficulty: ${question.difficulty}`);
    });
    
    console.log('\n🎉 Gemini AI quiz generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error.message);
    console.log('💡 This might be due to:');
    console.log('   - Missing GEMINI_API_KEY environment variable');
    console.log('   - Network connectivity issues');
    console.log('   - API rate limits');
    console.log('   - Invalid API key');
  }
}

// Run the test
testGeminiQuizGeneration();
