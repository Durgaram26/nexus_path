# 🔔 Student Notification System

## Overview

The Student Notification System provides comprehensive notification functionality for all student activities including daily quiz reminders, daily test reminders, workshop/course assignments, submission deadlines, and industry mentor talks.

## 🚀 Features

### Notification Types
- **📚 Daily Quiz Reminders** - Automated daily quiz availability notifications
- **📝 Daily Test Reminders** - Coding test and assessment notifications  
- **🔧 Workshop Assignments** - Workshop enrollment and assignment notifications
- **📖 Course Assignments** - Course enrollment and assignment notifications
- **⏰ Submission Deadlines** - Assignment, certificate, and project deadline reminders
- **🎤 Industry Mentor Talks** - Mentor talk scheduling and reminder notifications
- **🏆 Achievements** - Learning milestone and achievement notifications
- **🚨 Urgent Notifications** - System-wide urgent announcements

### Priority Levels
- **Low** - General information notifications
- **Normal** - Standard activity notifications
- **High** - Important deadlines and assignments
- **Urgent** - Critical deadlines and system notifications

## 🏗️ Architecture

### Core Components

#### 1. NotificationService (`lib/notification-service.ts`)
Central service for managing all notification operations:
- Create individual and bulk notifications
- Mark notifications as read
- Delete expired notifications
- Get student notifications and unread counts

#### 2. API Endpoints
- `GET /api/student/notifications` - Fetch student notifications
- `PUT /api/student/notifications` - Mark notifications as read
- `POST /api/student/notifications/daily-test-reminder` - Create test reminders
- `POST /api/student/notifications/workshop-assignment` - Create workshop notifications
- `POST /api/student/notifications/course-assignment` - Create course notifications
- `POST /api/student/notifications/submission-deadline` - Create deadline reminders
- `POST /api/student/notifications/mentor-talk` - Create mentor talk notifications

#### 3. Cron Jobs
- `POST /api/cron/daily-quiz-reset` - Daily quiz reset and notifications (midnight UTC)
- `POST /api/cron/notification-scheduler` - Comprehensive notification scheduler (9 AM UTC)

#### 4. UI Components
- `NotificationCenter` - Main notification display component
- `useNotifications` - React hook for notification management

## 📋 Database Schema

### Notification Model
```prisma
model Notification {
  id              Int      @id @default(autoincrement())
  studentId       Int
  title           String
  message         String
  type            String   // quiz, test, workshop, course, assignment, submission, mentor_talk, general, urgent
  isRead          Boolean  @default(false)
  priority        String   @default("normal") // low, normal, high, urgent
  actionUrl       String?  // Optional URL for action
  metadata        String?  // JSON string for additional data
  createdAt       DateTime @default(now())
  readAt          DateTime?
  expiresAt       DateTime?
  
  // Relations
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=your-database-url

# Cron Security
CRON_SECRET=your-secure-cron-secret

# Optional: Set timezone for cron jobs
TZ=UTC
```

### Vercel Cron Configuration
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-quiz-reset",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/notification-scheduler", 
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 🎯 Usage Examples

### Creating Notifications Programmatically

```typescript
import { NotificationService } from '@/lib/notification-service';

// Daily quiz reminder
await NotificationService.createDailyQuizReminder(studentId);

// Workshop assignment
await NotificationService.createWorkshopAssignmentNotification(
  studentId,
  'React Workshop',
  workshopId,
  new Date('2024-01-15')
);

// Course assignment
await NotificationService.createCourseAssignmentNotification(
  studentId,
  'Data Structures',
  'Assignment 1',
  courseId,
  assignmentId,
  new Date('2024-01-20')
);

// Submission deadline
await NotificationService.createSubmissionDeadlineReminder(
  studentId,
  'certificate',
  'AWS Certification',
  new Date('2024-01-25'),
  certificateId
);

// Mentor talk
await NotificationService.createMentorTalkNotification(
  studentId,
  'John Doe',
  'Career in Tech',
  new Date('2024-01-30'),
  talkId
);
```

### Using the React Hook

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function StudentDashboard() {
  const { notifications, unreadCount, markAsRead } = useNotifications(studentId);
  
  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          {!notification.read && (
            <button onClick={() => markAsRead(notification.id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🎨 UI Features

### Notification Center
- **Real-time Updates** - Polls for new notifications every 30 seconds
- **Visual Indicators** - Color-coded notifications by type and priority
- **Action Buttons** - Mark as read, delete, and navigate to action URLs
- **Priority Display** - Urgent notifications have special styling
- **Bulk Actions** - Mark all as read functionality

### Notification Types & Icons
- 📚 **Quiz** - BookOpen icon, blue color
- 📝 **Test** - Code icon, purple color  
- 🔧 **Workshop** - Wrench icon, orange color
- 📖 **Course** - GraduationCap icon, green color
- 📄 **Assignment** - FileText icon, indigo color
- ⏰ **Submission** - Clock icon, red color
- 🎤 **Mentor Talk** - Users icon, pink color
- 🚨 **Urgent** - AlertTriangle icon, red color with ring

## 🔄 Automated Scheduling

### Daily Quiz Reset (Midnight UTC)
1. Archives yesterday's quiz data
2. Updates student performance metrics
3. Sends daily quiz reminder notifications
4. Cleans up expired notifications

### Notification Scheduler (9 AM UTC)
1. Sends daily quiz reminders
2. Sends daily test reminders
3. Sends workshop assignment reminders
4. Sends course assignment reminders
5. Sends submission deadline reminders
6. Sends mentor talk reminders
7. Cleans up expired notifications

## 🧪 Testing

### Manual Testing
```bash
# Test daily quiz reset
curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \
  -H "Authorization: Bearer your-cron-secret"

# Test notification scheduler
curl -X POST "https://your-domain.com/api/cron/notification-scheduler" \
  -H "Authorization: Bearer your-cron-secret"

# Test specific notification creation
curl -X POST "https://your-domain.com/api/student/notifications/daily-test-reminder" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"testTitle": "JavaScript Test", "testId": 123}'
```

### API Testing
```bash
# Get notifications
curl -X GET "https://your-domain.com/api/student/notifications" \
  -H "Authorization: Bearer your-token"

# Mark notification as read
curl -X PUT "https://your-domain.com/api/student/notifications" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"notificationId": 123}'

# Mark all as read
curl -X PUT "https://your-domain.com/api/student/notifications" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"markAll": true}'
```

## 🔒 Security

### Authentication
- All endpoints require valid JWT tokens
- Student role verification for student endpoints
- Cron secret verification for automated jobs

### Data Protection
- Notifications are automatically deleted when expired
- Student data is properly isolated
- Sensitive information is not logged

## 📊 Monitoring

### Logs
- All notification creation is logged
- Cron job execution is tracked
- Error handling with detailed logging

### Metrics
- Unread notification counts
- Notification type distribution
- Student engagement tracking

## 🚀 Deployment

### Prerequisites
1. Database with Notification table
2. Environment variables configured
3. Cron jobs scheduled (Vercel/GitHub Actions)

### Steps
1. Deploy the application
2. Set up cron jobs in your deployment platform
3. Configure environment variables
4. Test notification creation
5. Monitor cron job execution

## 🔧 Troubleshooting

### Common Issues

#### Notifications Not Appearing
- Check database connection
- Verify student ID in requests
- Check notification service logs

#### Cron Jobs Not Running
- Verify CRON_SECRET configuration
- Check deployment platform cron settings
- Monitor cron job logs

#### UI Not Updating
- Check API endpoint responses
- Verify useNotifications hook
- Check browser console for errors

### Debug Commands
```bash
# Check notification table
SELECT * FROM Notification WHERE studentId = ? ORDER BY createdAt DESC;

# Check cron job logs
# Look for "Notification scheduler completed successfully" in logs

# Test notification creation
# Use the manual testing commands above
```

## 📈 Future Enhancements

### Planned Features
- **Email Notifications** - Send notifications via email
- **Push Notifications** - Browser push notifications
- **SMS Notifications** - Text message alerts
- **Notification Preferences** - User-configurable notification settings
- **Advanced Scheduling** - Custom notification timing
- **Analytics Dashboard** - Notification engagement metrics

### Integration Opportunities
- **Calendar Integration** - Sync with Google Calendar
- **Slack Integration** - Team notifications
- **Mobile App** - Native mobile notifications
- **AI Recommendations** - Smart notification timing

## 📚 API Reference

### NotificationService Methods
- `createNotification(data)` - Create single notification
- `createBulkNotifications(notifications)` - Create multiple notifications
- `getStudentNotifications(studentId, limit)` - Get student notifications
- `markAsRead(notificationId, studentId)` - Mark notification as read
- `markAllAsRead(studentId)` - Mark all notifications as read
- `deleteExpiredNotifications()` - Clean up expired notifications
- `getUnreadCount(studentId)` - Get unread count

### Specific Notification Methods
- `createDailyQuizReminder(studentId)`
- `createDailyTestReminder(studentId, testTitle, testId)`
- `createWorkshopAssignmentNotification(studentId, workshopTitle, workshopId, dueDate?)`
- `createCourseAssignmentNotification(studentId, courseTitle, assignmentTitle, courseId, assignmentId, dueDate?)`
- `createSubmissionDeadlineReminder(studentId, submissionType, itemTitle, dueDate, itemId)`
- `createMentorTalkNotification(studentId, mentorName, talkTitle, scheduledDate, talkId)`
- `createAchievementNotification(studentId, achievementTitle, achievementDescription, achievementType)`
- `createUrgentNotification(studentId, title, message, actionUrl?)`

This comprehensive notification system ensures students stay informed about all their learning activities, assignments, and important deadlines while providing a smooth, intuitive user experience.
