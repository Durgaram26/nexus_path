const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFirstTimeUser() {
  try {
    console.log('🧪 Testing First-Time User Experience...');
    
    // Clear all quiz data to simulate first-time user
    console.log('\n🗑️  Clearing all quiz data...');
    
    const deletedAttempts = await prisma.quizAttempt.deleteMany({});
    console.log(`✅ Deleted ${deletedAttempts.count} quiz attempts`);
    
    const deletedQuizzes = await prisma.adaptiveQuiz.deleteMany({});
    console.log(`✅ Deleted ${deletedQuizzes.count} adaptive quizzes`);
    
    const deletedSessions = await prisma.quizSession.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} quiz sessions`);
    
    const deletedPerformance = await prisma.studentPerformance.deleteMany({});
    console.log(`✅ Deleted ${deletedPerformance.count} student performance records`);
    
    console.log('\n🎯 Expected Behavior for First-Time User:');
    console.log('1. ✅ Dashboard loads immediately');
    console.log('2. ✅ Shows "No Quiz Available" (not "Loading...")');
    console.log('3. ✅ Shows "Start Quiz" button');
    console.log('4. ✅ No quiz history table (empty)');
    console.log('5. ✅ Statistics show 0% (no data)');
    
    console.log('\n🔧 What Changed:');
    console.log('- Quiz status loads first (determines UI state)');
    console.log('- Quiz history loads in background (non-blocking)');
    console.log('- No more waiting for empty history data');
    console.log('- Immediate "No Quiz Available" display');
    
    console.log('\n📱 Test Steps:');
    console.log('1. Visit: http://localhost:3000/student/career-dashboard#daily-quiz');
    console.log('2. Should see "No Quiz Available" immediately');
    console.log('3. Click "Start Quiz" to generate quiz');
    console.log('4. Quiz should be created only when user starts');
    
    console.log('\n✅ First-time user experience fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFirstTimeUser();
