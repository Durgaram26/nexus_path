const { PrismaClient } = require('@prisma/client');

async function createSampleQuizHistory() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Creating sample quiz history...');
    
    // Get the first student
    const student = await prisma.student.findFirst();
    if (!student) {
      console.log('❌ No students found in database');
      return;
    }
    
    console.log('👤 Using student:', student.name, '(ID:', student.id, ')');
    
    // Create sample quiz attempts
    const sampleAttempts = [
      {
        studentId: student.id,
        attemptNumber: 1,
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        timeSpent: 1200, // 20 minutes
        wrongAnswers: JSON.stringify([3, 7, 12]),
        answers: JSON.stringify({}), // Empty answers object
        feedback: 'Great job! Keep up the good work.',
        adaptiveQuizId: 1
      },
      {
        studentId: student.id,
        attemptNumber: 2,
        score: 90,
        correctAnswers: 18,
        totalQuestions: 20,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        timeSpent: 1100, // 18 minutes
        wrongAnswers: JSON.stringify([5, 15]),
        answers: JSON.stringify({}), // Empty answers object
        feedback: 'Excellent performance!',
        adaptiveQuizId: 1
      },
      {
        studentId: student.id,
        attemptNumber: 1,
        score: 75,
        correctAnswers: 15,
        totalQuestions: 20,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        timeSpent: 1300, // 22 minutes
        wrongAnswers: JSON.stringify([2, 8, 11, 16, 19]),
        answers: JSON.stringify({}), // Empty answers object
        feedback: 'Good effort, review the wrong answers.',
        adaptiveQuizId: 1
      }
    ];
    
    // Create the quiz attempts
    for (const attempt of sampleAttempts) {
      const createdAttempt = await prisma.quizAttempt.create({
        data: attempt
      });
      console.log('✅ Created quiz attempt:', createdAttempt.id, 'Score:', attempt.score);
    }
    
    console.log('🎉 Sample quiz history created successfully!');
    console.log('📊 Total attempts created:', sampleAttempts.length);
    
  } catch (error) {
    console.error('❌ Error creating sample quiz history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleQuizHistory();
