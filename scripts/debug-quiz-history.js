const { PrismaClient } = require('@prisma/client');

async function debugQuizHistory() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging quiz history...');
    
    // Check if there are any quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      orderBy: { completedAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 Total quiz attempts: ${quizAttempts.length}`);
    
    if (quizAttempts.length > 0) {
      console.log('📝 Recent quiz attempts:');
      quizAttempts.forEach((attempt, index) => {
        console.log(`${index + 1}. Student ID: ${attempt.studentId}, Score: ${attempt.score}, Date: ${attempt.completedAt}`);
      });
    } else {
      console.log('❌ No quiz attempts found in database');
    }
    
    // Check students table
    const students = await prisma.student.findMany({
      select: { id: true, name: true, email: true }
    });
    
    console.log(`👥 Total students: ${students.length}`);
    if (students.length > 0) {
      console.log('👤 Students in database:');
      students.forEach(student => {
        console.log(`  - ID: ${student.id}, Name: ${student.name}, Email: ${student.email}`);
      });
    }
    
    // Check if there are any adaptive quizzes
    const adaptiveQuizzes = await prisma.adaptiveQuiz.findMany({
      orderBy: { quizDate: 'desc' },
      take: 5
    });
    
    console.log(`📚 Total adaptive quizzes: ${adaptiveQuizzes.length}`);
    
    if (adaptiveQuizzes.length > 0) {
      console.log('📝 Recent adaptive quizzes:');
      adaptiveQuizzes.forEach((quiz, index) => {
        console.log(`${index + 1}. Date: ${quiz.quizDate}, Questions: ${quiz.questions ? JSON.parse(quiz.questions).length : 0}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging quiz history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuizHistory();
