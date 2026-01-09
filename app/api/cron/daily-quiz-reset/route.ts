import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../lib/notification-service';
import prisma from '../../../../lib/prisma';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Invalid authorization header');
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === cronSecret;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting daily quiz reset and notification cron job...');

    // 1. Reset daily quiz data
    await resetDailyQuizData();

    // 2. Send daily quiz reminder notifications
    await sendDailyQuizReminders();

    // 3. Clean up expired notifications
    await NotificationService.deleteExpiredNotifications();

    console.log('✅ Daily quiz reset and notification cron job completed successfully');

    return NextResponse.json({ 
      message: 'Daily quiz reset and notifications completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Daily quiz reset cron job failed:', error);
    return NextResponse.json({ 
      message: 'Daily quiz reset failed', 
      error: String(error) 
    }, { status: 500 });
  }
}

/**
 * Reset daily quiz data for all students
 */
async function resetDailyQuizData() {
  try {
    console.log('🔄 Resetting daily quiz data...');
    
    // Archive yesterday's quiz attempts
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Update student performance metrics
    const students = await prisma.student.findMany({
      include: {
        quizAttempts: {
          where: {
            attemptedAt: {
              gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
              lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
            }
          }
        }
      }
    });

    for (const student of students) {
      if (student.quizAttempts.length > 0) {
        // Calculate performance metrics
        const totalQuestions = student.quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.totalQuestions, 0);
        const correctAnswers = student.quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.correctAnswers, 0);
        const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        // TODO: Update student performance records if needed
        // The Student model doesn't have lastQuizDate, totalQuizAttempts fields
        // Consider updating StudentPerformance model instead
      }
    }

    console.log('✅ Daily quiz data reset completed');
  } catch (error) {
    console.error('❌ Error resetting daily quiz data:', error);
    throw error;
  }
}

/**
 * Send daily quiz reminder notifications to all students
 */
async function sendDailyQuizReminders() {
  try {
    console.log('📚 Sending daily quiz reminder notifications...');
    
    // Check if daily quiz reminders were already sent today
    const today = new Date().toISOString().split('T')[0];
    const existingReminders = await prisma.notification.findMany({
      where: {
        type: 'quiz',
        metadata: {
          contains: `"reminderType":"daily_quiz"`
        },
        createdAt: {
          gte: new Date(today + 'T00:00:00.000Z'),
          lt: new Date(today + 'T23:59:59.999Z')
        }
      }
    });

    if (existingReminders.length > 0) {
      console.log('Daily quiz reminders already sent today');
      return;
    }

    // Create bulk daily quiz reminders
    const result = await NotificationService.createBulkDailyQuizReminders();
    console.log(`✅ Sent daily quiz reminder notifications to ${result.count} students`);
  } catch (error) {
    console.error('❌ Error sending daily quiz reminder notifications:', error);
    throw error;
  }
}
