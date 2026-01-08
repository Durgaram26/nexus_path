const { PrismaClient } = require('@prisma/client');

async function clearExistingQuizzes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Clearing existing quizzes to test AI generation...');
    
    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log('Today:', todayString);
    
    // Find existing quizzes for today
    const existingQuizzes = await prisma.adaptiveQuiz.findMany({
      where: {
        quizDate: {
          gte: new Date(todayString + 'T00:00:00.000Z'),
          lt: new Date(todayString + 'T23:59:59.999Z')
        }
      }
    });
    
    console.log(`📊 Found ${existingQuizzes.length} existing quizzes for today`);
    
    if (existingQuizzes.length > 0) {
      console.log('🗑️ Deleting existing quizzes...');
      
      // Delete quiz attempts first (foreign key constraint)
      for (const quiz of existingQuizzes) {
        await prisma.quizAttempt.deleteMany({
          where: { adaptiveQuizId: quiz.id }
        });
        console.log(`Deleted attempts for quiz ${quiz.id}`);
      }
      
      // Delete the quizzes
      const deletedQuizzes = await prisma.adaptiveQuiz.deleteMany({
        where: {
          quizDate: {
            gte: new Date(todayString + 'T00:00:00.000Z'),
            lt: new Date(todayString + 'T23:59:59.999Z')
          }
        }
      });
      
      console.log(`✅ Deleted ${deletedQuizzes.count} existing quizzes for today`);
    } else {
      console.log('✅ No existing quizzes found for today');
    }
    
    // Also clear any quizzes from the last few days to ensure clean testing
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const oldQuizzes = await prisma.adaptiveQuiz.findMany({
      where: {
        quizDate: {
          gte: threeDaysAgo
        }
      }
    });
    
    if (oldQuizzes.length > 0) {
      console.log(`🗑️ Also clearing ${oldQuizzes.length} quizzes from the last 3 days...`);
      
      // Delete quiz attempts first
      for (const quiz of oldQuizzes) {
        await prisma.quizAttempt.deleteMany({
          where: { adaptiveQuizId: quiz.id }
        });
      }
      
      // Delete the quizzes
      const deletedOldQuizzes = await prisma.adaptiveQuiz.deleteMany({
        where: {
          quizDate: {
            gte: threeDaysAgo
          }
        }
      });
      
      console.log(`✅ Deleted ${deletedOldQuizzes.count} old quizzes`);
    }
    
    console.log('🎉 Quiz cleanup completed! Now the system should generate new AI-based quizzes.');
    
  } catch (error) {
    console.error('❌ Error clearing quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearExistingQuizzes();
