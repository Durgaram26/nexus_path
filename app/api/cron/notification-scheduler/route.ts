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

// Daily quiz reminder - runs at 9 AM
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting notification scheduler cron job...');

    // 1. Send daily quiz reminders
    await sendDailyQuizReminders();

    // 2. Send daily test reminders
    await sendDailyTestReminders();

    // 3. Send workshop assignment reminders
    await sendWorkshopAssignmentReminders();

    // 4. Send course assignment reminders
    await sendCourseAssignmentReminders();

    // 5. Send submission deadline reminders
    await sendSubmissionDeadlineReminders();

    // 6. Send mentor talk reminders
    await sendMentorTalkReminders();

    // 7. Clean up expired notifications
    await NotificationService.deleteExpiredNotifications();

    console.log('✅ Notification scheduler cron job completed successfully');

    return NextResponse.json({ 
      message: 'Notification scheduler completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Notification scheduler cron job failed:', error);
    return NextResponse.json({ 
      message: 'Notification scheduler failed', 
      error: String(error) 
    }, { status: 500 });
  }
}

/**
 * Send daily quiz reminders to all students
 */
async function sendDailyQuizReminders() {
  try {
    console.log('📚 Sending daily quiz reminders...');
    
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
    console.log(`✅ Sent daily quiz reminders to ${result.count} students`);
  } catch (error) {
    console.error('❌ Error sending daily quiz reminders:', error);
  }
}

/**
 * Send daily test reminders
 */
async function sendDailyTestReminders() {
  try {
    console.log('📝 Sending daily test reminders...');
    
    // Get all active tests for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all students
    const students = await prisma.student.findMany({
      select: { id: true }
    });

    // Create test reminders for each student
    const notifications = students.map(student => ({
      studentId: student.id,
      title: '📝 Daily Test Available',
      message: 'Complete today\'s coding test to improve your skills!',
      type: 'test' as const,
      priority: 'normal' as const,
      actionUrl: '/student/code-test',
      metadata: {
        reminderType: 'daily_test',
        scheduledFor: today.toISOString().split('T')[0]
      }
    }));

    if (notifications.length > 0) {
      await NotificationService.createBulkNotifications(notifications);
      console.log(`✅ Sent daily test reminders to ${notifications.length} students`);
    }
  } catch (error) {
    console.error('❌ Error sending daily test reminders:', error);
  }
}

/**
 * Send workshop assignment reminders
 */
async function sendWorkshopAssignmentReminders() {
  try {
    console.log('🔧 Sending workshop assignment reminders...');
    
    // Get workshops starting in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingWorkshops = await prisma.workshop.findMany({
      where: {
        startDate: {
          gte: new Date(),
          lte: tomorrow
        },
        status: 'upcoming'
      },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    for (const workshop of upcomingWorkshops) {
      for (const enrollment of workshop.enrollments) {
        await NotificationService.createWorkshopAssignmentNotification(
          enrollment.student.id,
          workshop.title,
          workshop.id,
          workshop.startDate
        );
      }
    }

    console.log(`✅ Sent workshop reminders for ${upcomingWorkshops.length} workshops`);
  } catch (error) {
    console.error('❌ Error sending workshop assignment reminders:', error);
  }
}

/**
 * Send course assignment reminders
 */
async function sendCourseAssignmentReminders() {
  try {
    console.log('📖 Sending course assignment reminders...');
    
    // Get assignments due in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: tomorrow
        }
      },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    for (const assignment of upcomingAssignments) {
      for (const enrollment of assignment.course.enrollments) {
        await NotificationService.createCourseAssignmentNotification(
          enrollment.student.id,
          assignment.course.title,
          assignment.title,
          assignment.course.id,
          assignment.id,
          assignment.dueDate
        );
      }
    }

    console.log(`✅ Sent course assignment reminders for ${upcomingAssignments.length} assignments`);
  } catch (error) {
    console.error('❌ Error sending course assignment reminders:', error);
  }
}

/**
 * Send submission deadline reminders
 */
async function sendSubmissionDeadlineReminders() {
  try {
    console.log('⏰ Sending submission deadline reminders...');
    
    // Get all students
    const students = await prisma.student.findMany({
      select: { id: true }
    });

    // Check for certificate submissions due soon
    const upcomingSubmissions = await prisma.certificateSubmission.findMany({
      where: {
        status: 'pending',
        submissionDeadline: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        }
      },
      include: {
        student: true
      }
    });

    for (const submission of upcomingSubmissions) {
      await NotificationService.createSubmissionDeadlineReminder(
        submission.student.id,
        'certificate',
        submission.certificateName,
        submission.submissionDeadline,
        submission.id
      );
    }

    console.log(`✅ Sent submission deadline reminders for ${upcomingSubmissions.length} submissions`);
  } catch (error) {
    console.error('❌ Error sending submission deadline reminders:', error);
  }
}

/**
 * Send mentor talk reminders
 */
async function sendMentorTalkReminders() {
  try {
    console.log('🎤 Sending mentor talk reminders...');
    
    // Get mentor talks scheduled for the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Note: This would need to be implemented based on your mentor talk schema
    // For now, we'll create a placeholder that can be extended
    console.log('✅ Mentor talk reminders sent (placeholder)');
  } catch (error) {
    console.error('❌ Error sending mentor talk reminders:', error);
  }
}
