# 🎯 Daily Quiz System Documentation

## Overview

The Daily Quiz System is a comprehensive learning assessment platform that generates personalized quizzes based on students' learning plans and career paths. The system supports two attempts per day with detailed explanations and progress tracking.

## 🔹 Daily Quiz Workflow

### 1. Daily Quiz Creation
- **20 Questions**: Each day, the system generates 20 new questions based on the student's learning plan and progress
- **AI-Powered**: Questions are generated using Gemini AI, tailored to the student's career path and current week of learning
- **Consistent Questions**: Questions remain the same for the entire day (no changes between attempts)

### 2. First Attempt
- Student takes the quiz with a timer
- After submission:
  - Score is displayed immediately
  - Wrong answers are highlighted
  - Correct answers and detailed explanations are provided
  - Performance metrics are tracked

### 3. Second Attempt
- Student has the option to retry the same quiz (same questions)
- Purpose: Learn from mistakes and improve
- After submission:
  - New score is displayed
  - Comparison with first attempt shows improvement or decline
  - Best score is updated if improved

### 4. Daily Reset
- At midnight (or next login after midnight):
  - System resets for new day
  - New quiz with 20 fresh questions is generated
  - Previous quizzes are archived for review
  - Student performance metrics are updated

## 🏗️ System Architecture

### Database Schema

#### AdaptiveQuiz Model
```prisma
model AdaptiveQuiz {
  id              Int      @id @default(autoincrement())
  studentId       Int
  quizDate        DateTime
  questions       String   // JSON string of questions
  performanceData String?  // JSON string of performance data
  isCompleted     Boolean  @default(false)
  totalAttempts   Int      @default(0)
  bestScore       Float    @default(0.0)
  lastAttemptAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  quizAttempts    QuizAttempt[]
}
```

#### QuizAttempt Model
```prisma
model QuizAttempt {
  id              Int      @id @default(autoincrement())
  adaptiveQuizId  Int
  studentId       Int
  attemptNumber   Int      // 1 for first attempt, 2 for second attempt
  answers         String   // JSON string of student answers
  score           Float
  correctAnswers  Int
  totalQuestions  Int
  timeSpent       Int      // in seconds
  completedAt     DateTime @default(now())
  wrongAnswers    String?  // JSON string of wrong answers with explanations
  feedback        String?  // JSON string of detailed feedback
  
  // Relations
  adaptiveQuiz    AdaptiveQuiz @relation(fields: [adaptiveQuizId], references: [id], onDelete: Cascade)
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### 1. Get/Create Daily Quiz
```
GET /api/student/daily-quiz
```
- Returns existing quiz for the day or generates new one
- Includes attempt information and progress tracking
- Supports second attempt functionality

#### 2. Submit Quiz Attempt
```
POST /api/student/daily-quiz
```
- Submits quiz answers and calculates score
- Provides detailed feedback and explanations
- Tracks attempt number and improvement

#### 3. Reset Daily Quiz (Development)
```
POST /api/student/daily-quiz/reset
```
- Resets today's quiz for testing purposes
- Clears all attempts and allows fresh start

#### 4. Daily Reset Cron Job
```
POST /api/cron/daily-quiz-reset
```
- Automated daily reset at midnight
- Updates student performance metrics
- Archives old quiz data

## 🎨 User Interface Components

### 1. DailyQuizCard Component
- **Location**: Student dashboard main page
- **Features**:
  - Shows quiz status (ready, in progress, completed)
  - Displays attempt count and best score
  - Provides quick access to start/retake quiz
  - Motivational messages based on performance

### 2. Daily Quiz Page
- **Route**: `/student/daily-quiz`
- **Features**:
  - Interactive quiz interface
  - Question navigation with progress bar
  - Timer and attempt tracking
  - Detailed results with explanations
  - Second attempt functionality

### 3. Student Sidebar Integration
- **Navigation**: Added "Daily Quiz" menu item
- **Status**: Shows current quiz status
- **Quick Access**: Direct link to daily quiz

## 🤖 AI Integration

### Question Generation
- **AI Service**: Gemini AI (Google's LLM)
- **Personalization**: Based on student's career path, learning plan, and progress
- **Question Types**: Mix of career path knowledge and technical skills
- **Difficulty**: Adaptive based on learning plan week (1-4)

### Question Structure
```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  careerPath: string;
  points: number;
}
```

## 📊 Performance Tracking

### Student Performance Metrics
- **Knowledge Level**: 1-5 scale based on quiz performance
- **Weak Areas**: Identified from wrong answers
- **Strong Areas**: Identified from correct answers
- **Progress Tracking**: Historical performance data

### Analytics Features
- **Score Comparison**: Between first and second attempts
- **Improvement Tracking**: Performance over time
- **Category Analysis**: Performance by question category
- **Difficulty Analysis**: Performance by question difficulty

## 🔄 Daily Reset System

### Automated Reset Process
1. **Midnight Trigger**: Cron job runs
2. **Performance Update**: Student metrics are updated
3. **Data Archiving**: Old quiz data is preserved
4. **Fresh Start**: New quiz becomes available

### Manual Reset (Development)
- **Reset Endpoint**: For testing and development
- **Immediate Effect**: Clears current day's quiz
- **Fresh Generation**: New questions are generated

## 🚀 Deployment & Configuration

### Environment Variables
```env
# Database
DATABASE_URL=your-database-url

# AI Service
llm_api_key=your-gemini-api-key
llm_model=gemini-2.0-flash
llm_api_url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Cron Security
CRON_SECRET=your-secure-cron-secret
```

### Cron Job Setup Options

#### Option 1: Vercel Cron (Recommended)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-quiz-reset",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Option 2: GitHub Actions
```yaml
name: Daily Quiz Reset
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  reset-daily-quiz:
    runs-on: ubuntu-latest
    steps:
      - name: Reset Daily Quiz
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/cron/daily-quiz-reset" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option 3: Traditional Cron
```bash
0 0 * * * curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \
  -H "Authorization: Bearer your-secure-cron-secret"
```

## 🧪 Testing & Development

### Manual Testing
```bash
# Test quiz generation
curl -X GET "https://your-domain.com/api/student/daily-quiz" \
  -H "Authorization: Bearer your-token"

# Test quiz submission
curl -X POST "https://your-domain.com/api/student/daily-quiz" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "answers": [0,1,2,3], "timeSpent": 300}'

# Test manual reset
curl -X POST "https://your-domain.com/api/student/daily-quiz/reset" \
  -H "Authorization: Bearer your-token"
```

### Development Features
- **Reset Button**: Manual quiz reset for testing
- **Debug Information**: Detailed logging and error handling
- **Performance Monitoring**: Real-time metrics and analytics

## 📈 Benefits & Impact

### For Students
- **Daily Practice**: Consistent learning reinforcement
- **Immediate Feedback**: Learn from mistakes instantly
- **Progress Tracking**: Visual progress indicators
- **Personalized Content**: Questions tailored to career path

### For Educators
- **Performance Insights**: Student progress analytics
- **Learning Gaps**: Identify areas needing attention
- **Adaptive Learning**: AI-powered question generation
- **Engagement**: Gamified learning experience

### For System
- **Scalability**: Handles multiple students efficiently
- **Reliability**: Automated daily reset system
- **Analytics**: Comprehensive performance tracking
- **Integration**: Seamless with existing learning management system

## 🔧 Maintenance & Monitoring

### Regular Tasks
- **Performance Review**: Weekly analytics review
- **Question Quality**: Monitor AI-generated question quality
- **System Health**: Check cron job execution
- **Database Cleanup**: Archive old data periodically

### Monitoring Points
- **Quiz Generation**: Success rate and quality
- **Student Engagement**: Daily participation rates
- **Performance Trends**: Score improvements over time
- **System Errors**: API failures and database issues

## 🎯 Future Enhancements

### Planned Features
- **Adaptive Difficulty**: Dynamic difficulty adjustment
- **Social Features**: Leaderboards and peer comparison
- **Mobile App**: Native mobile experience
- **Offline Support**: Quiz completion without internet
- **Advanced Analytics**: Machine learning insights

### Integration Opportunities
- **LMS Integration**: Connect with existing learning platforms
- **Gamification**: Badges, streaks, and achievements
- **Collaborative Learning**: Group quizzes and discussions
- **Content Management**: Faculty question review and approval

---

## 📞 Support & Contact

For technical support or feature requests, please refer to the main project documentation or contact the development team.

**System Status**: ✅ Fully Operational  
**Last Updated**: October 2025  
**Version**: 1.0.0

