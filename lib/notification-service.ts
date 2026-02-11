import prisma from './prisma';

export interface NotificationData {
  studentId: string;
  title: string;
  message: string;
  type: 'quiz' | 'test' | 'workshop' | 'course' | 'assignment' | 'submission' | 'mentor_talk' | 'general' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export class NotificationService {
  /**
   * Create a new notification for a student
   */
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          studentId: data.studentId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          actionUrl: data.actionUrl,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          expiresAt: data.expiresAt,
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications for multiple students
   */
  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      const createdNotifications = await prisma.notification.createMany({
        data: notifications.map(notification => ({
          studentId: notification.studentId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
          expiresAt: notification.expiresAt,
        })),
      });
      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a student
   */
  static async getStudentNotifications(studentId: string, limit: number = 50) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          studentId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
      return notifications;
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, studentId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          studentId: studentId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a student
   */
  static async markAllAsRead(studentId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          studentId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete expired notifications
   */
  static async deleteExpiredNotifications() {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      return result;
    } catch (error) {
      console.error('Error deleting expired notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a student
   */
  static async getUnreadCount(studentId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          studentId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // ===== SPECIFIC NOTIFICATION TYPES =====

  /**
   * Create daily quiz reminder notification
   */
  static async createDailyQuizReminder(studentId: string) {
    return this.createNotification({
      studentId,
      title: '📚 Daily Quiz Available!',
      message: 'Your daily quiz is ready. Complete it to maintain your learning streak!',
      type: 'quiz',
      priority: 'normal',
      actionUrl: '/student/daily-quiz',
      metadata: {
        reminderType: 'daily_quiz',
        scheduledFor: new Date().toISOString().split('T')[0]
      }
    });
  }

  /**
   * Create daily test reminder notification
   */
  static async createDailyTestReminder(studentId: string, testTitle: string, testId: string) {
    return this.createNotification({
      studentId,
      title: '📝 Daily Test Reminder',
      message: `Don't forget to complete today's test: ${testTitle}`,
      type: 'test',
      priority: 'high',
      actionUrl: `/student/code-test/${testId}`,
      metadata: {
        reminderType: 'daily_test',
        testId,
        testTitle
      }
    });
  }

  /**
   * Create workshop assignment notification
   */
  static async createWorkshopAssignmentNotification(
    studentId: string,
    workshopTitle: string,
    workshopId: string,
    dueDate?: Date
  ) {
    const message = dueDate
      ? `New workshop assignment: ${workshopTitle}. Due: ${dueDate.toLocaleDateString()}`
      : `New workshop assignment: ${workshopTitle}`;

    return this.createNotification({
      studentId,
      title: '🔧 Workshop Assignment',
      message,
      type: 'workshop',
      priority: dueDate && dueDate < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'high' : 'normal',
      actionUrl: `/student/workshops/${workshopId}`,
      metadata: {
        reminderType: 'workshop_assignment',
        workshopId,
        workshopTitle,
        dueDate: dueDate?.toISOString()
      },
      expiresAt: dueDate
    });
  }

  /**
   * Create course assignment notification
   */
  static async createCourseAssignmentNotification(
    studentId: string,
    courseTitle: string,
    assignmentTitle: string,
    courseId: string,
    assignmentId: string,
    dueDate?: Date
  ) {
    const message = dueDate
      ? `New assignment in ${courseTitle}: ${assignmentTitle}. Due: ${dueDate.toLocaleDateString()}`
      : `New assignment in ${courseTitle}: ${assignmentTitle}`;

    return this.createNotification({
      studentId,
      title: '📖 Course Assignment',
      message,
      type: 'assignment',
      priority: dueDate && dueDate < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'high' : 'normal',
      actionUrl: `/student/courses/${courseId}/assignments/${assignmentId}`,
      metadata: {
        reminderType: 'course_assignment',
        courseId,
        courseTitle,
        assignmentId,
        assignmentTitle,
        dueDate: dueDate?.toISOString()
      },
      expiresAt: dueDate
    });
  }

  /**
   * Create submission deadline reminder
   */
  static async createSubmissionDeadlineReminder(
    studentId: string,
    submissionType: 'assignment' | 'certificate' | 'project',
    itemTitle: string,
    dueDate: Date,
    itemId: string
  ) {
    const hoursUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60));
    const priority = hoursUntilDue <= 24 ? 'urgent' : hoursUntilDue <= 48 ? 'high' : 'normal';

    return this.createNotification({
      studentId,
      title: `⏰ ${submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} Due Soon`,
      message: `${itemTitle} is due in ${hoursUntilDue} hours`,
      type: 'submission',
      priority,
      actionUrl: `/student/${submissionType}s/${itemId}`,
      metadata: {
        reminderType: 'submission_deadline',
        submissionType,
        itemTitle,
        itemId,
        dueDate: dueDate.toISOString(),
        hoursUntilDue
      },
      expiresAt: dueDate
    });
  }

  /**
   * Create industry mentor talk notification
   */
  static async createMentorTalkNotification(
    studentId: string,
    mentorName: string,
    talkTitle: string,
    scheduledDate: Date,
    talkId: number
  ) {
    const hoursUntilTalk = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60));
    const priority = hoursUntilTalk <= 2 ? 'urgent' : hoursUntilTalk <= 24 ? 'high' : 'normal';

    return this.createNotification({
      studentId,
      title: '🎤 Industry Mentor Talk',
      message: `${talkTitle} with ${mentorName} is scheduled for ${scheduledDate.toLocaleString()}`,
      type: 'mentor_talk',
      priority,
      actionUrl: `/student/mentor-talks/${talkId}`,
      metadata: {
        reminderType: 'mentor_talk',
        mentorName,
        talkTitle,
        talkId,
        scheduledDate: scheduledDate.toISOString(),
        hoursUntilTalk
      },
      expiresAt: new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000) // Expire 2 hours after talk
    });
  }

  /**
   * Create workshop enrollment notification
   */
  static async createWorkshopEnrollmentNotification(
    studentId: string,
    workshopTitle: string,
    workshopId: string,
    startDate: Date
  ) {
    return this.createNotification({
      studentId,
      title: '🎓 Workshop Enrollment Confirmed',
      message: `You've been enrolled in ${workshopTitle}. Workshop starts on ${startDate.toLocaleDateString()}`,
      type: 'workshop',
      priority: 'normal',
      actionUrl: `/student/workshops/${workshopId}`,
      metadata: {
        reminderType: 'workshop_enrollment',
        workshopId,
        workshopTitle,
        startDate: startDate.toISOString()
      }
    });
  }

  /**
   * Create course enrollment notification
   */
  static async createCourseEnrollmentNotification(
    studentId: string,
    courseTitle: string,
    courseId: string,
    startDate: Date
  ) {
    return this.createNotification({
      studentId,
      title: '📚 Course Enrollment Confirmed',
      message: `You've been enrolled in ${courseTitle}. Course starts on ${startDate.toLocaleDateString()}`,
      type: 'course',
      priority: 'normal',
      actionUrl: `/student/courses/${courseId}`,
      metadata: {
        reminderType: 'course_enrollment',
        courseId,
        courseTitle,
        startDate: startDate.toISOString()
      }
    });
  }

  /**
   * Create achievement notification
   */
  static async createAchievementNotification(
    studentId: string,
    achievementTitle: string,
    achievementDescription: string,
    achievementType: string
  ) {
    return this.createNotification({
      studentId,
      title: '🏆 Achievement Unlocked!',
      message: `${achievementTitle}: ${achievementDescription}`,
      type: 'general',
      priority: 'normal',
      actionUrl: '/student/analytics',
      metadata: {
        reminderType: 'achievement',
        achievementTitle,
        achievementDescription,
        achievementType
      }
    });
  }

  /**
   * Create urgent system notification
   */
  static async createUrgentNotification(
    studentId: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    return this.createNotification({
      studentId,
      title: `🚨 ${title}`,
      message,
      type: 'urgent',
      priority: 'urgent',
      actionUrl,
      metadata: {
        reminderType: 'urgent_system'
      }
    });
  }

  /**
   * Get all students for bulk notifications
   */
  static async getAllStudents() {
    try {
      const students = await prisma.student.findMany({
        select: {
          id: true,
          name: true,
          email: true
        }
      });
      return students;
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  }

  /**
   * Create bulk daily quiz reminders for all students
   */
  static async createBulkDailyQuizReminders() {
    try {
      const students = await this.getAllStudents();
      const notifications = students.map((student: any) => ({
        studentId: student.id,
        title: '📚 Daily Quiz Available!',
        message: 'Your daily quiz is ready. Complete it to maintain your learning streak!',
        type: 'quiz' as const,
        priority: 'normal' as const,
        actionUrl: '/student/daily-quiz',
        metadata: {
          reminderType: 'daily_quiz',
          scheduledFor: new Date().toISOString().split('T')[0]
        }
      }));

      return this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('Error creating bulk daily quiz reminders:', error);
      throw error;
    }
  }
}
