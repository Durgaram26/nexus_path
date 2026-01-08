#!/usr/bin/env node

/**
 * Test Script for Student Notification System
 * 
 * This script demonstrates how to use the notification system
 * and tests various notification types.
 */

const { NotificationService } = require('../lib/notification-service');

console.log('🔔 Testing Student Notification System...\n');

async function testNotificationSystem() {
  try {
    // Test data
    const testStudentId = 1;
    const testWorkshopId = 1;
    const testCourseId = 1;
    const testAssignmentId = 1;
    const testTalkId = 1;

    console.log('📚 Testing Daily Quiz Reminder...');
    const quizNotification = await NotificationService.createDailyQuizReminder(testStudentId);
    console.log('✅ Daily quiz reminder created:', quizNotification.id);

    console.log('\n📝 Testing Daily Test Reminder...');
    const testNotification = await NotificationService.createDailyTestReminder(
      testStudentId,
      'JavaScript Fundamentals Test',
      testAssignmentId
    );
    console.log('✅ Daily test reminder created:', testNotification.id);

    console.log('\n🔧 Testing Workshop Assignment...');
    const workshopNotification = await NotificationService.createWorkshopAssignmentNotification(
      testStudentId,
      'React Workshop',
      testWorkshopId,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    );
    console.log('✅ Workshop assignment created:', workshopNotification.id);

    console.log('\n📖 Testing Course Assignment...');
    const courseNotification = await NotificationService.createCourseAssignmentNotification(
      testStudentId,
      'Data Structures',
      'Assignment 1: Arrays and Linked Lists',
      testCourseId,
      testAssignmentId,
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    );
    console.log('✅ Course assignment created:', courseNotification.id);

    console.log('\n⏰ Testing Submission Deadline...');
    const submissionNotification = await NotificationService.createSubmissionDeadlineReminder(
      testStudentId,
      'certificate',
      'AWS Cloud Practitioner Certification',
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      testAssignmentId
    );
    console.log('✅ Submission deadline created:', submissionNotification.id);

    console.log('\n🎤 Testing Mentor Talk...');
    const mentorNotification = await NotificationService.createMentorTalkNotification(
      testStudentId,
      'Sarah Johnson',
      'Career in Software Engineering',
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      testTalkId
    );
    console.log('✅ Mentor talk created:', mentorNotification.id);

    console.log('\n🏆 Testing Achievement...');
    const achievementNotification = await NotificationService.createAchievementNotification(
      testStudentId,
      'Quiz Master',
      'Completed 10 daily quizzes in a row!',
      'streak'
    );
    console.log('✅ Achievement created:', achievementNotification.id);

    console.log('\n🚨 Testing Urgent Notification...');
    const urgentNotification = await NotificationService.createUrgentNotification(
      testStudentId,
      'System Maintenance',
      'The platform will be under maintenance from 2 AM to 4 AM UTC',
      '/student/settings'
    );
    console.log('✅ Urgent notification created:', urgentNotification.id);

    console.log('\n📊 Testing Bulk Operations...');
    const bulkResult = await NotificationService.createBulkDailyQuizReminders();
    console.log('✅ Bulk daily quiz reminders created:', bulkResult.count);

    console.log('\n📈 Testing Statistics...');
    const notifications = await NotificationService.getStudentNotifications(testStudentId, 10);
    const unreadCount = await NotificationService.getUnreadCount(testStudentId);
    
    console.log(`📋 Total notifications for student: ${notifications.length}`);
    console.log(`🔴 Unread notifications: ${unreadCount}`);

    console.log('\n✅ All notification tests completed successfully!');
    console.log('\n📋 Notification Summary:');
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. [${notification.type.toUpperCase()}] ${notification.title}`);
      console.log(`   Priority: ${notification.priority}`);
      console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(notification.createdAt).toLocaleString()}`);
      if (notification.actionUrl) {
        console.log(`   Action: ${notification.actionUrl}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
    process.exit(1);
  }
}

// Run the test
testNotificationSystem()
  .then(() => {
    console.log('\n🎉 Notification system test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
