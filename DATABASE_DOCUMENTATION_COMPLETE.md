# NexusPath - Complete Database Documentation
## Comprehensive Database Schema Reference

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Core Tables](#core-tables)
3. [User Management Tables](#user-management-tables)
4. [Career Path Tables](#career-path-tables)
5. [Assessment & Quiz Tables](#assessment--quiz-tables)
6. [Roadmap & Learning Tables](#roadmap--learning-tables)
7. [Code Execution Tables](#code-execution-tables)
8. [Communication & Messaging Tables](#communication--messaging-tables)
9. [Course & Workshop Tables](#course--workshop-tables)
10. [Mentorship Tables](#mentorship-tables)
11. [Notification & AI Tables](#notification--ai-tables)
12. [Database Relationships](#database-relationships)
13. [Indexes & Performance](#indexes--performance)
14. [Data Types & Enums](#data-types--enums)

---

## Database Overview

### Database Information

- **Database Type**: PostgreSQL
- **ORM**: Prisma 6.16.3
- **Total Tables**: 42
- **Character Set**: UTF-8
- **Normalization Level**: 3NF (Third Normal Form)

### Naming Conventions

- **Tables**: PascalCase (e.g., `Student`, `CareerPath`)
- **Columns**: camelCase (e.g., `firstName`, `createdAt`)
- **Foreign Keys**: `{table}Id` (e.g., `studentId`, `departmentId`)
- **Junction Tables**: `{Table1}{Table2}` (e.g., `StudentCareerPath`)
- **Timestamps**: `createdAt`, `updatedAt`

---

## Core Tables

### 1. College

**Purpose**: Stores information about educational institutions/colleges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | College name |

**Keys**:
- Primary Key: `id`
- Unique Key: `name`

**Relationships**:
- One-to-Many → `Department`


---

### 2. Department

**Purpose**: Stores department information within colleges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Department name |
| description | TEXT | NULLABLE | Department description |
| collegeId | INT | FOREIGN KEY, NOT NULL | Reference to College |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `name`
- Foreign Key: `collegeId` → `College(id)` ON DELETE CASCADE
- Index: `collegeId`

**Relationships**:
- Many-to-One → `College`
- One-to-Many → `Faculty`, `Student`, `User`

---

## User Management Tables

### 3. User

**Purpose**: Base authentication table for all user types (Admin, Faculty, Student).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email (login) |
| password | VARCHAR | NOT NULL | Hashed password (bcrypt) |
| plainPassword | VARCHAR | NULLABLE | Plain password (optional) |
| role | VARCHAR | DEFAULT 'student' | User role (admin/faculty/student) |
| firstName | VARCHAR | NULLABLE | User's first name |
| lastName | VARCHAR | NULLABLE | User's last name |
| departmentId | INT | FOREIGN KEY, NULLABLE | Reference to Department |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation date |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `email`
- Foreign Key: `departmentId` → `Department(id)` ON DELETE SET NULL
- Index: `departmentId`, `role`

**Relationships**:
- Many-to-One → `Department`
- One-to-Many → `StudentCareerPath` (as assignedBy)
- One-to-Many → `Roadmap` (as creator)
- One-to-Many → `RoadmapAssignment` (as assignedBy)

**Security**:
- Passwords hashed using bcrypt (10 salt rounds)
- JWT tokens for authentication
- Role-based access control (RBAC)


---

### 4. Faculty

**Purpose**: Stores faculty-specific information and assignment configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Faculty email |
| name | VARCHAR | NOT NULL | Full name |
| gender | ENUM | NOT NULL | Gender (MALE, FEMALE, OTHER) |
| departmentId | INT | FOREIGN KEY, NOT NULL | Reference to Department |
| assignedYears | VARCHAR | NULLABLE | Comma-separated years (e.g., "1,2,3") |
| canAssignCrossDepartment | BOOLEAN | DEFAULT FALSE | Cross-department permission |
| allowedDepartments | VARCHAR | NULLABLE | Comma-separated department IDs |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `email`
- Foreign Key: `departmentId` → `Department(id)` ON DELETE CASCADE
- Index: `departmentId`, `canAssignCrossDepartment`

**Relationships**:
- Many-to-One → `Department`
- One-to-Many → `FacultyCareerPath`, `Message`, `CertificateSubmission`, `Workshop`, `Course`, `CourseRoadmapAssignment`, `MentorTalk`, `MessageRoom`

**Business Logic**:
- `assignedYears`: NULL/empty = all years, otherwise specific years
- `canAssignCrossDepartment`: Allows managing students from other departments
- `allowedDepartments`: NULL = all departments (if cross-department enabled)

---

### 5. Student

**Purpose**: Stores student-specific information and academic details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Student email |
| name | VARCHAR | NOT NULL | Full name |
| gender | ENUM | NOT NULL | Gender (MALE, FEMALE, OTHER) |
| phoneNumber | VARCHAR | NULLABLE | Contact number |
| departmentId | INT | FOREIGN KEY, NOT NULL | Reference to Department |
| year | INT | NOT NULL | Academic year (1-4) |
| registerNumber | VARCHAR | UNIQUE, NOT NULL | Student register number |
| favoriteLanguage | VARCHAR | NULLABLE | Favorite programming language |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Keys: `email`, `registerNumber`
- Foreign Key: `departmentId` → `Department(id)` ON DELETE CASCADE
- Index: `departmentId`, `year`

**Relationships** (20+ relationships):
- Many-to-One → `Department`
- One-to-Many → `StudentCareerPath`, `StudentPerformance`, `AdaptiveQuiz`, `QuizSession`, `QuizAttempt`, `RoadmapAssignment`, `StudentResourceAccess`, `CodeTestSession`, `CodeExecutionHistory`, `CodeExecution`, `CodeTestResult`, `Notification`, `AISuggestion`, `CertificateSubmission`, `WorkshopEnrollment`, `CourseEnrollment`, `AssignmentSubmission`, `MentorTalkAttendance`, `MentorTalkFeedback`

**Constraints**:
- `year` must be between 1 and 4


---

## Career Path Tables

### 6. CareerPath

**Purpose**: Defines available career paths for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Career path name |
| description | TEXT | NULLABLE | Detailed description |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `name`

**Relationships**:
- One-to-Many → `StudentCareerPath`, `FacultyCareerPath`

---

### 7. StudentCareerPath

**Purpose**: Junction table linking students to their assigned career paths.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| careerPathId | INT | FOREIGN KEY, NOT NULL | Reference to CareerPath |
| assignedBy | INT | FOREIGN KEY, NULLABLE | Faculty who assigned (User ID) |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(studentId, careerPathId)`
- Foreign Keys:
  - `studentId` → `Student(id)` ON DELETE CASCADE
  - `careerPathId` → `CareerPath(id)` ON DELETE CASCADE
  - `assignedBy` → `User(id)` ON DELETE SET NULL
- Index: `studentId`, `careerPathId`, `assignedBy`

**Relationships**:
- Many-to-One → `Student`, `CareerPath`, `User`

**Business Rules**:
- A student can have multiple career paths
- Same career path cannot be assigned twice to same student

---

### 8. FacultyCareerPath

**Purpose**: Junction table linking faculty to their career path specializations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| facultyId | INT | FOREIGN KEY, NOT NULL | Reference to Faculty |
| careerPathId | INT | FOREIGN KEY, NOT NULL | Reference to CareerPath |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(facultyId, careerPathId)`
- Foreign Keys:
  - `facultyId` → `Faculty(id)` ON DELETE CASCADE
  - `careerPathId` → `CareerPath(id)` ON DELETE CASCADE
- Index: `facultyId`, `careerPathId`

**Relationships**:
- Many-to-One → `Faculty`, `CareerPath`


---

## Assessment & Quiz Tables

### 9. AdaptiveQuiz

**Purpose**: Stores daily adaptive quiz instances for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| quizDate | TIMESTAMP | NOT NULL | Quiz date |
| questions | TEXT | NOT NULL | JSON string of questions |
| performanceData | TEXT | NULLABLE | JSON string of performance metrics |
| isCompleted | BOOLEAN | DEFAULT FALSE | Completion status |
| totalAttempts | INT | DEFAULT 0 | Number of attempts (max 2) |
| bestScore | FLOAT | DEFAULT 0.0 | Best score achieved |
| lastAttemptAt | TIMESTAMP | NULLABLE | Last attempt timestamp |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `quizDate`, `isCompleted`
- Composite Index: `(studentId, quizDate)`

**Relationships**:
- Many-to-One → `Student`
- One-to-Many → `QuizAttempt`

**Business Rules**:
- One quiz per student per day
- Maximum 2 attempts allowed
- 20 questions per quiz

---

### 10. QuizAttempt

**Purpose**: Records individual quiz attempts with answers and results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| adaptiveQuizId | INT | FOREIGN KEY, NULLABLE | Reference to AdaptiveQuiz |
| quizId | INT | FOREIGN KEY, NULLABLE | Reference to Quiz (static) |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| attemptNumber | INT | NOT NULL | Attempt number (1 or 2) |
| answers | TEXT | NOT NULL | JSON string of answers |
| score | FLOAT | NOT NULL | Score achieved |
| correctAnswers | INT | NOT NULL | Number of correct answers |
| totalQuestions | INT | NOT NULL | Total questions |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| isCorrect | BOOLEAN | DEFAULT FALSE | Overall correctness |
| attemptedAt | TIMESTAMP | DEFAULT NOW() | Attempt start time |
| completedAt | TIMESTAMP | NULLABLE | Attempt completion time |
| wrongAnswers | TEXT | NULLABLE | JSON of wrong answers |
| feedback | TEXT | NULLABLE | JSON of detailed feedback |

**Keys**:
- Primary Key: `id`
- Foreign Keys:
  - `adaptiveQuizId` → `AdaptiveQuiz(id)` ON DELETE CASCADE
  - `quizId` → `Quiz(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `adaptiveQuizId`, `quizId`, `studentId`, `attemptedAt`

**Relationships**:
- Many-to-One → `AdaptiveQuiz`, `Quiz`, `Student`


---

### 11. Quiz

**Purpose**: Stores static/predefined quiz templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Quiz title |
| description | TEXT | NOT NULL | Quiz description |
| category | VARCHAR | NOT NULL | Quiz category |
| difficulty | VARCHAR | NOT NULL | EASY, MEDIUM, HARD |
| totalQuestions | INT | DEFAULT 5 | Number of questions |
| timeLimit | INT | NULLABLE | Time limit in minutes |
| isActive | BOOLEAN | DEFAULT TRUE | Active status |
| questions | TEXT | NOT NULL | JSON string of questions |
| options | TEXT | NOT NULL | JSON string of options |
| correctAnswers | TEXT | NOT NULL | JSON string of correct answers |
| explanations | TEXT | NOT NULL | JSON string of explanations |
| points | INT | DEFAULT 1 | Points per question |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Index: `category`, `difficulty`, `isActive`

**Relationships**:
- One-to-Many → `QuizAttempt`

---

### 12. QuizSession

**Purpose**: Tracks quiz session statistics and performance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| sessionDate | TIMESTAMP | DEFAULT NOW() | Session date |
| totalQuestions | INT | NOT NULL | Total questions answered |
| correctAnswers | INT | NOT NULL | Correct answers count |
| sessionScore | FLOAT | NOT NULL | Session score percentage |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| categories | TEXT[] | DEFAULT [] | Array of categories covered |
| difficulties | TEXT[] | DEFAULT [] | Array of difficulty levels |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `sessionDate`

**Relationships**:
- Many-to-One → `Student`

---

### 13. StudentPerformance

**Purpose**: Tracks student performance metrics by category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| category | VARCHAR | NOT NULL | Performance category |
| knowledgeLevel | INT | DEFAULT 1 | Knowledge level (1-5 scale) |
| totalAttempts | INT | DEFAULT 0 | Total attempts in category |
| correctAttempts | INT | DEFAULT 0 | Correct attempts count |
| lastAttemptedAt | TIMESTAMP | DEFAULT NOW() | Last attempt timestamp |
| weakAreas | TEXT[] | DEFAULT [] | Array of weak topics |
| strongAreas | TEXT[] | DEFAULT [] | Array of strong topics |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(studentId, category)`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `category`, `knowledgeLevel`

**Relationships**:
- Many-to-One → `Student`

**Business Rules**:
- One record per student per category
- Knowledge level calculated based on performance


---

## Roadmap & Learning Tables

### 14. Roadmap

**Purpose**: Stores learning roadmaps for career paths.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Roadmap title |
| description | VARCHAR | NOT NULL | Roadmap description |
| totalDuration | VARCHAR | NOT NULL | Total duration estimate |
| year | INT | NOT NULL | Target academic year |
| careerPath | VARCHAR | NOT NULL | Associated career path |
| department | VARCHAR | NOT NULL | Target department |
| studentLevel | VARCHAR | DEFAULT 'beginner' | Student level |
| milestones | TEXT | NOT NULL | JSON string of milestones |
| learningPath | VARCHAR | NOT NULL | Learning path description |
| careerOutcomes | TEXT | NOT NULL | JSON string of career outcomes |
| isAIGenerated | BOOLEAN | DEFAULT FALSE | AI vs manual roadmap |
| createdBy | INT | FOREIGN KEY, NOT NULL | User ID who created |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `createdBy` → `User(id)`
- Index: `createdBy`, `year`, `careerPath`, `department`

**Relationships**:
- Many-to-One → `User`
- One-to-Many → `RoadmapAssignment`, `LearningResource`, `CourseRoadmapAssignment`

---

### 15. RoadmapAssignment

**Purpose**: Assigns roadmaps to students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| roadmapId | INT | FOREIGN KEY, NOT NULL | Reference to Roadmap |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| assignedBy | INT | FOREIGN KEY, NOT NULL | Faculty who assigned |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |
| isActive | BOOLEAN | DEFAULT TRUE | Active status |
| progress | INT | DEFAULT 0 | Progress percentage (0-100) |
| completedAt | TIMESTAMP | NULLABLE | Completion timestamp |
| notes | TEXT | NULLABLE | Assignment notes |

**Keys**:
- Primary Key: `id`
- Unique Key: `(roadmapId, studentId)`
- Foreign Keys:
  - `roadmapId` → `Roadmap(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
  - `assignedBy` → `User(id)`
- Index: `roadmapId`, `studentId`, `assignedBy`

**Relationships**:
- Many-to-One → `Roadmap`, `Student`, `User`

---

### 16. LearningResource

**Purpose**: Stores learning resources linked to roadmaps.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Resource title |
| description | VARCHAR | NOT NULL | Resource description |
| url | VARCHAR | NOT NULL | Resource URL |
| category | VARCHAR | NOT NULL | Resource category |
| difficulty | VARCHAR | DEFAULT 'beginner' | Difficulty level |
| careerPath | VARCHAR | NOT NULL | Associated career path |
| roadmapId | INT | FOREIGN KEY, NULLABLE | Optional roadmap link |
| isActive | BOOLEAN | DEFAULT TRUE | Active status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `roadmapId` → `Roadmap(id)` ON DELETE CASCADE
- Index: `roadmapId`, `category`, `careerPath`, `difficulty`

**Relationships**:
- Many-to-One → `Roadmap`
- One-to-Many → `StudentResourceAccess`

---

### 17. StudentResourceAccess

**Purpose**: Tracks student access to learning resources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| resourceId | INT | FOREIGN KEY, NOT NULL | Reference to LearningResource |
| accessedAt | TIMESTAMP | DEFAULT NOW() | Access timestamp |
| isCompleted | BOOLEAN | DEFAULT FALSE | Completion status |
| rating | INT | NULLABLE | Rating (1-5 stars) |
| notes | TEXT | NULLABLE | Student notes |

**Keys**:
- Primary Key: `id`
- Unique Key: `(studentId, resourceId)`
- Foreign Keys:
  - `studentId` → `Student(id)` ON DELETE CASCADE
  - `resourceId` → `LearningResource(id)` ON DELETE CASCADE
- Index: `studentId`, `resourceId`

**Relationships**:
- Many-to-One → `Student`, `LearningResource`


---

## Code Execution Tables

### 18. CodeTestSession

**Purpose**: Stores code testing sessions for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| sessionDate | TIMESTAMP | DEFAULT NOW() | Session date |
| language | VARCHAR | NOT NULL | Programming language used |
| languageId | INT | NOT NULL | Judge0 language ID |
| totalQuestions | INT | DEFAULT 5 | Total questions |
| questions | TEXT | NOT NULL | JSON string of questions |
| totalScore | INT | DEFAULT 0 | Total score (out of 25) |
| maxScore | INT | DEFAULT 25 | Maximum score |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| isCompleted | BOOLEAN | DEFAULT FALSE | Completion status |
| completedAt | TIMESTAMP | NULLABLE | Completion timestamp |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `sessionDate`, `language`

**Relationships**:
- Many-to-One → `Student`
- One-to-Many → `CodeTestQuestionResult`

---

### 19. CodeTestQuestionResult

**Purpose**: Stores results for individual code test questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| sessionId | INT | FOREIGN KEY, NOT NULL | Reference to CodeTestSession |
| questionId | VARCHAR | NOT NULL | Question ID from test |
| questionTitle | VARCHAR | NOT NULL | Question title |
| questionIndex | INT | NOT NULL | Question number (0-4) |
| studentCode | TEXT | NOT NULL | Code written by student |
| score | INT | DEFAULT 0 | Score (0-5) |
| maxScore | INT | DEFAULT 5 | Maximum score |
| passedTests | INT | DEFAULT 0 | Test cases passed |
| totalTests | INT | DEFAULT 0 | Total test cases |
| testResults | TEXT | NOT NULL | JSON string of test results |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| hintsUsed | INT | DEFAULT 0 | Number of hints used |
| attempts | INT | DEFAULT 0 | Code execution attempts |
| completedAt | TIMESTAMP | DEFAULT NOW() | Completion timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `sessionId` → `CodeTestSession(id)` ON DELETE CASCADE
- Index: `sessionId`, `questionIndex`

**Relationships**:
- Many-to-One → `CodeTestSession`

---

### 20. CodeExecutionHistory

**Purpose**: Tracks all code executions by students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| language | VARCHAR | NOT NULL | Programming language |
| languageId | INT | NOT NULL | Judge0 language ID |
| code | TEXT | NOT NULL | Code executed |
| input | TEXT | NULLABLE | Input provided |
| output | TEXT | NULLABLE | Execution output |
| status | VARCHAR | NOT NULL | Execution status |
| executionTime | INT | NULLABLE | Execution time (ms) |
| memoryUsed | INT | NULLABLE | Memory used (KB) |
| errorMessage | TEXT | NULLABLE | Error message if failed |
| executedAt | TIMESTAMP | DEFAULT NOW() | Execution timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `executedAt`, `language`

**Relationships**:
- Many-to-One → `Student`

---

### 21. CodeExecution

**Purpose**: Stores code execution records (duplicate of CodeExecutionHistory).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| language | VARCHAR | NOT NULL | Programming language |
| languageId | INT | NOT NULL | Judge0 language ID |
| code | TEXT | NOT NULL | Code executed |
| input | TEXT | NULLABLE | Input provided |
| output | TEXT | NULLABLE | Execution output |
| status | VARCHAR | NOT NULL | Execution status |
| executionTime | INT | NULLABLE | Execution time (ms) |
| memoryUsed | INT | NULLABLE | Memory used (KB) |
| errorMessage | TEXT | NULLABLE | Error message if failed |
| executedAt | TIMESTAMP | DEFAULT NOW() | Execution timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `executedAt`

**Relationships**:
- Many-to-One → `Student`

---

### 22. CodeTestResult

**Purpose**: Stores overall code test results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| testId | VARCHAR | NOT NULL | Test identifier |
| language | VARCHAR | NOT NULL | Programming language |
| score | INT | NOT NULL | Score achieved |
| maxScore | INT | NOT NULL | Maximum possible score |
| status | VARCHAR | NOT NULL | completed, failed, in_progress |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| code | TEXT | NOT NULL | Code submitted |
| testCases | TEXT | NOT NULL | JSON string of test cases |
| results | TEXT | NOT NULL | JSON string of results |
| completedAt | TIMESTAMP | DEFAULT NOW() | Completion timestamp |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `testId`, `status`

**Relationships**:
- Many-to-One → `Student`


---

## Communication & Messaging Tables

### 23. Message

**Purpose**: Stores messages between faculty and students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| senderId | INT | FOREIGN KEY, NOT NULL | Faculty who sent message |
| recipientIds | INT[] | NOT NULL | Array of student IDs |
| subject | VARCHAR | NOT NULL | Message subject |
| content | TEXT | NOT NULL | Message content |
| messageType | VARCHAR | DEFAULT 'general' | Message type |
| priority | VARCHAR | DEFAULT 'normal' | Priority level |
| isBroadcast | BOOLEAN | DEFAULT FALSE | Broadcast to all students |
| isRead | BOOLEAN | DEFAULT FALSE | Read status |
| sentAt | TIMESTAMP | DEFAULT NOW() | Sent timestamp |
| readAt | TIMESTAMP | NULLABLE | Read timestamp |
| isRealtime | BOOLEAN | DEFAULT FALSE | Real-time message flag |
| roomId | VARCHAR | NULLABLE | Room/Channel ID |
| replyToId | INT | FOREIGN KEY, NULLABLE | Reply to message ID |
| editedAt | TIMESTAMP | NULLABLE | Last edit timestamp |
| isEdited | BOOLEAN | DEFAULT FALSE | Edit flag |

**Keys**:
- Primary Key: `id`
- Foreign Keys:
  - `senderId` → `Faculty(id)` ON DELETE CASCADE
  - `replyToId` → `Message(id)`
- Index: `senderId`, `sentAt`, `messageType`, `priority`, `roomId`

**Relationships**:
- Many-to-One → `Faculty`
- Self-referencing → `Message` (replies)
- One-to-Many → `MessageRead`

---

### 24. MessageRead

**Purpose**: Tracks message read status by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| messageId | INT | FOREIGN KEY, NOT NULL | Reference to Message |
| userId | INT | NOT NULL | User who read message |
| readAt | TIMESTAMP | DEFAULT NOW() | Read timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(messageId, userId)`
- Foreign Key: `messageId` → `Message(id)` ON DELETE CASCADE
- Index: `messageId`, `userId`

**Relationships**:
- Many-to-One → `Message`

---

### 25. MessageRoom

**Purpose**: Stores chat rooms/channels for group messaging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | NOT NULL | Room name |
| description | TEXT | NULLABLE | Room description |
| roomType | VARCHAR | DEFAULT 'general' | Room type |
| createdBy | INT | FOREIGN KEY, NOT NULL | Faculty who created |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| isActive | BOOLEAN | DEFAULT TRUE | Active status |

**Keys**:
- Primary Key: `id`
- Foreign Key: `createdBy` → `Faculty(id)` ON DELETE CASCADE
- Index: `createdBy`, `roomType`, `isActive`

**Relationships**:
- Many-to-One → `Faculty`
- One-to-Many → `MessageRoomMember`

---

### 26. MessageRoomMember

**Purpose**: Tracks room membership for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| roomId | INT | FOREIGN KEY, NOT NULL | Reference to MessageRoom |
| userId | INT | NOT NULL | User ID (student/faculty) |
| userRole | VARCHAR | DEFAULT 'member' | Role in room |
| joinedAt | TIMESTAMP | DEFAULT NOW() | Join timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(roomId, userId)`
- Foreign Key: `roomId` → `MessageRoom(id)` ON DELETE CASCADE
- Index: `roomId`, `userId`

**Relationships**:
- Many-to-One → `MessageRoom`


---

## Course & Workshop Tables

### 27. Workshop

**Purpose**: Stores workshop information and details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Workshop title |
| description | TEXT | NOT NULL | Workshop description |
| instructor | VARCHAR | NOT NULL | Instructor name |
| duration | VARCHAR | NOT NULL | Duration (e.g., "2 days") |
| level | VARCHAR | NOT NULL | Difficulty level |
| category | VARCHAR | NOT NULL | Workshop category |
| maxParticipants | INT | NOT NULL | Maximum participants |
| enrolledParticipants | INT | DEFAULT 0 | Current enrollment count |
| status | VARCHAR | DEFAULT 'upcoming' | Workshop status |
| startDate | TIMESTAMP | NOT NULL | Start date |
| endDate | TIMESTAMP | NOT NULL | End date |
| location | VARCHAR | NOT NULL | Workshop location |
| prerequisites | TEXT | NULLABLE | JSON string of prerequisites |
| objectives | TEXT | NULLABLE | JSON string of objectives |
| materials | TEXT | NULLABLE | JSON string of materials |
| isMandatory | BOOLEAN | DEFAULT FALSE | Mandatory flag |
| createdBy | INT | FOREIGN KEY, NOT NULL | Faculty who created |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `createdBy` → `Faculty(id)`
- Index: `status`, `createdBy`, `isMandatory`, `startDate`

**Relationships**:
- Many-to-One → `Faculty`
- One-to-Many → `WorkshopEnrollment`

---

### 28. WorkshopEnrollment

**Purpose**: Tracks student enrollment in workshops.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| workshopId | INT | FOREIGN KEY, NOT NULL | Reference to Workshop |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| enrolledAt | TIMESTAMP | DEFAULT NOW() | Enrollment timestamp |
| status | VARCHAR | DEFAULT 'enrolled' | Enrollment status |
| completedAt | TIMESTAMP | NULLABLE | Completion timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(workshopId, studentId)`
- Foreign Keys:
  - `workshopId` → `Workshop(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `workshopId`, `studentId`, `status`

**Relationships**:
- Many-to-One → `Workshop`, `Student`

---

### 29. Course

**Purpose**: Stores course information and details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Course title |
| description | TEXT | NOT NULL | Course description |
| instructor | VARCHAR | NOT NULL | Instructor name |
| duration | VARCHAR | NOT NULL | Course duration |
| level | VARCHAR | NOT NULL | Difficulty level |
| category | VARCHAR | NOT NULL | Course category |
| maxStudents | INT | NOT NULL | Maximum students |
| enrolledStudents | INT | DEFAULT 0 | Current enrollment count |
| status | VARCHAR | DEFAULT 'active' | Course status |
| startDate | TIMESTAMP | NOT NULL | Start date |
| endDate | TIMESTAMP | NOT NULL | End date |
| courseType | VARCHAR | NOT NULL | online, offline, hybrid |
| location | VARCHAR | NULLABLE | Course location |
| meetingLink | VARCHAR | NULLABLE | Online meeting link |
| isMandatory | BOOLEAN | DEFAULT FALSE | Mandatory flag |
| createdBy | INT | FOREIGN KEY, NOT NULL | Faculty who created |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `createdBy` → `Faculty(id)`
- Index: `status`, `createdBy`, `courseType`, `startDate`

**Relationships**:
- Many-to-One → `Faculty`
- One-to-Many → `CourseEnrollment`, `Assignment`, `CourseRoadmapAssignment`

---

### 30. CourseEnrollment

**Purpose**: Tracks student enrollment in courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| courseId | INT | FOREIGN KEY, NOT NULL | Reference to Course |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| enrolledAt | TIMESTAMP | DEFAULT NOW() | Enrollment timestamp |
| status | VARCHAR | DEFAULT 'enrolled' | Enrollment status |
| grade | FLOAT | NULLABLE | Final grade |
| attendance | FLOAT | DEFAULT 100.0 | Attendance percentage |
| assignmentsCompleted | INT | DEFAULT 0 | Completed assignments |
| totalAssignments | INT | DEFAULT 0 | Total assignments |
| lastActivity | TIMESTAMP | DEFAULT NOW() | Last activity timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(courseId, studentId)`
- Foreign Keys:
  - `courseId` → `Course(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `courseId`, `studentId`, `status`

**Relationships**:
- Many-to-One → `Course`, `Student`

---

### 31. Assignment

**Purpose**: Stores course assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| courseId | INT | FOREIGN KEY, NOT NULL | Reference to Course |
| title | VARCHAR | NOT NULL | Assignment title |
| description | TEXT | NOT NULL | Assignment description |
| dueDate | TIMESTAMP | NOT NULL | Due date |
| maxPoints | INT | DEFAULT 100 | Maximum points |
| isMandatory | BOOLEAN | DEFAULT FALSE | Mandatory flag |
| submissionType | VARCHAR | DEFAULT 'file' | Submission type |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `courseId` → `Course(id)` ON DELETE CASCADE
- Index: `courseId`, `dueDate`

**Relationships**:
- Many-to-One → `Course`
- One-to-Many → `AssignmentSubmission`

---

### 32. AssignmentSubmission

**Purpose**: Tracks student assignment submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| assignmentId | INT | FOREIGN KEY, NOT NULL | Reference to Assignment |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| submittedAt | TIMESTAMP | DEFAULT NOW() | Submission timestamp |
| status | VARCHAR | DEFAULT 'submitted' | Submission status |
| grade | FLOAT | NULLABLE | Grade received |
| feedback | TEXT | NULLABLE | Faculty feedback |
| fileUrl | VARCHAR | NULLABLE | Submitted file URL |
| textSubmission | TEXT | NULLABLE | Text submission |
| codeSubmission | TEXT | NULLABLE | Code submission |

**Keys**:
- Primary Key: `id`
- Foreign Keys:
  - `assignmentId` → `Assignment(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `assignmentId`, `studentId`, `status`

**Relationships**:
- Many-to-One → `Assignment`, `Student`

---

### 33. CourseRoadmapAssignment

**Purpose**: Links courses to roadmaps.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| courseId | INT | FOREIGN KEY, NOT NULL | Reference to Course |
| roadmapId | INT | FOREIGN KEY, NOT NULL | Reference to Roadmap |
| assignedBy | INT | FOREIGN KEY, NOT NULL | Faculty who assigned |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |
| isActive | BOOLEAN | DEFAULT TRUE | Active status |
| notes | TEXT | NULLABLE | Assignment notes |

**Keys**:
- Primary Key: `id`
- Unique Key: `(courseId, roadmapId)`
- Foreign Keys:
  - `courseId` → `Course(id)` ON DELETE CASCADE
  - `roadmapId` → `Roadmap(id)` ON DELETE CASCADE
  - `assignedBy` → `Faculty(id)`
- Index: `courseId`, `roadmapId`, `assignedBy`

**Relationships**:
- Many-to-One → `Course`, `Roadmap`, `Faculty`


---

## Mentorship Tables

### 34. MentorTalk

**Purpose**: Stores mentor talk/session information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR | NOT NULL | Talk title |
| speakerName | VARCHAR | NOT NULL | Speaker name |
| company | VARCHAR | NOT NULL | Speaker's company |
| designation | VARCHAR | NOT NULL | Speaker's designation |
| topic | VARCHAR | NOT NULL | Talk topic |
| description | TEXT | NULLABLE | Talk description |
| scheduledDate | TIMESTAMP | NOT NULL | Scheduled date |
| scheduledTime | VARCHAR | NOT NULL | Time in HH:MM format |
| mode | VARCHAR | DEFAULT 'online' | online or offline |
| meetingLink | VARCHAR | NULLABLE | Online meeting link |
| venue | VARCHAR | NULLABLE | Offline venue |
| maxAttendees | INT | NULLABLE | Maximum attendees |
| currentAttendees | INT | DEFAULT 0 | Current attendee count |
| status | VARCHAR | DEFAULT 'scheduled' | Talk status |
| createdBy | INT | FOREIGN KEY, NOT NULL | Faculty who created |
| assignedTo | VARCHAR | NULLABLE | Batch/year/department |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `createdBy` → `Faculty(id)`
- Index: `scheduledDate`, `status`, `createdBy`

**Relationships**:
- Many-to-One → `Faculty`
- One-to-Many → `MentorTalkAttendance`, `MentorTalkFeedback`

---

### 35. MentorTalkAttendance

**Purpose**: Tracks student attendance in mentor talks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| talkId | INT | FOREIGN KEY, NOT NULL | Reference to MentorTalk |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| attendedAt | TIMESTAMP | DEFAULT NOW() | Attendance timestamp |
| status | VARCHAR | DEFAULT 'registered' | Attendance status |

**Keys**:
- Primary Key: `id`
- Unique Key: `(talkId, studentId)`
- Foreign Keys:
  - `talkId` → `MentorTalk(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `talkId`, `studentId`, `status`

**Relationships**:
- Many-to-One → `MentorTalk`, `Student`

---

### 36. MentorTalkFeedback

**Purpose**: Stores student feedback for mentor talks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| talkId | INT | FOREIGN KEY, NOT NULL | Reference to MentorTalk |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| rating | INT | NOT NULL | Rating (1-5) |
| feedback | TEXT | NULLABLE | Text feedback |
| submittedAt | TIMESTAMP | DEFAULT NOW() | Submission timestamp |

**Keys**:
- Primary Key: `id`
- Unique Key: `(talkId, studentId)`
- Foreign Keys:
  - `talkId` → `MentorTalk(id)` ON DELETE CASCADE
  - `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `talkId`, `studentId`

**Relationships**:
- Many-to-One → `MentorTalk`, `Student`


---

## Notification & AI Tables

### 37. Notification

**Purpose**: Stores notifications for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| title | VARCHAR | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| type | VARCHAR | NOT NULL | Notification type |
| isRead | BOOLEAN | DEFAULT FALSE | Read status |
| priority | VARCHAR | DEFAULT 'normal' | Priority level |
| actionUrl | VARCHAR | NULLABLE | Optional action URL |
| metadata | TEXT | NULLABLE | JSON string for extra data |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| readAt | TIMESTAMP | NULLABLE | Read timestamp |
| expiresAt | TIMESTAMP | NULLABLE | Expiration timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `type`, `isRead`, `priority`, `createdAt`

**Relationships**:
- Many-to-One → `Student`

**Notification Types**:
- `quiz`: Quiz-related notifications
- `career`: Career path updates
- `achievement`: Achievement notifications
- `general`: General notifications

---

### 38. AISuggestion

**Purpose**: Stores AI-generated suggestions for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| title | VARCHAR | NOT NULL | Suggestion title |
| description | TEXT | NOT NULL | Suggestion description |
| duration | VARCHAR | NOT NULL | Estimated duration |
| difficulty | VARCHAR | NOT NULL | Difficulty level |
| skills | TEXT | NOT NULL | JSON string of skills |
| savedAt | TIMESTAMP | DEFAULT NOW() | Save timestamp |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), AUTO_UPDATE | Last update timestamp |

**Keys**:
- Primary Key: `id`
- Foreign Key: `studentId` → `Student(id)` ON DELETE CASCADE
- Index: `studentId`, `difficulty`

**Relationships**:
- Many-to-One → `Student`

---

### 39. CertificateSubmission

**Purpose**: Stores student certificate submissions for evaluation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| courseName | VARCHAR | NOT NULL | Course name |
| courseProvider | VARCHAR | NOT NULL | Course provider |
| completionDate | TIMESTAMP | NOT NULL | Completion date |
| certificateFile | VARCHAR | NOT NULL | File path or URL |
| description | TEXT | NULLABLE | Certificate description |
| courseLink | VARCHAR | NULLABLE | Optional course URL |
| courseType | VARCHAR | DEFAULT 'online-course' | Course type |
| status | VARCHAR | DEFAULT 'pending' | Evaluation status |
| submittedAt | TIMESTAMP | DEFAULT NOW() | Submission timestamp |
| evaluatedAt | TIMESTAMP | NULLABLE | Evaluation timestamp |
| evaluatedBy | INT | FOREIGN KEY, NULLABLE | Faculty evaluator ID |
| facultyComments | TEXT | NULLABLE | Faculty comments |
| grade | VARCHAR | NULLABLE | Grade (A, B, C, D, F) |

**Keys**:
- Primary Key: `id`
- Foreign Keys:
  - `studentId` → `Student(id)` ON DELETE CASCADE
  - `evaluatedBy` → `Faculty(id)`
- Index: `status`, `studentId`, `evaluatedBy`, `submittedAt`

**Relationships**:
- Many-to-One → `Student`, `Faculty`

**Status Values**:
- `pending`: Awaiting evaluation
- `approved`: Approved by faculty
- `rejected`: Rejected by faculty


---

## Database Relationships

### Relationship Summary

#### One-to-Many Relationships

1. **College → Department**
   - One college has many departments

2. **Department → Faculty, Student, User**
   - One department has many faculty members, students, and users

3. **Faculty → Multiple Tables**
   - FacultyCareerPath, Message, CertificateSubmission, Workshop, Course, CourseRoadmapAssignment, MentorTalk, MessageRoom

4. **Student → Multiple Tables** (20+ relationships)
   - StudentCareerPath, StudentPerformance, AdaptiveQuiz, QuizSession, QuizAttempt, RoadmapAssignment, StudentResourceAccess, CodeTestSession, CodeExecutionHistory, CodeExecution, CodeTestResult, Notification, AISuggestion, CertificateSubmission, WorkshopEnrollment, CourseEnrollment, AssignmentSubmission, MentorTalkAttendance, MentorTalkFeedback

5. **CareerPath → StudentCareerPath, FacultyCareerPath**
   - One career path can be assigned to many students and faculty

6. **User → StudentCareerPath, Roadmap, RoadmapAssignment**
   - One user can create/assign multiple items

7. **Roadmap → RoadmapAssignment, LearningResource, CourseRoadmapAssignment**
   - One roadmap has many assignments and resources

8. **AdaptiveQuiz → QuizAttempt**
   - One quiz can have multiple attempts

9. **Quiz → QuizAttempt**
   - One static quiz can have multiple attempts

10. **CodeTestSession → CodeTestQuestionResult**
    - One session has multiple question results

11. **Message → MessageRead**
    - One message can be read by multiple users

12. **MessageRoom → MessageRoomMember**
    - One room has many members

13. **Workshop → WorkshopEnrollment**
    - One workshop has many enrollments

14. **Course → CourseEnrollment, Assignment, CourseRoadmapAssignment**
    - One course has many enrollments, assignments, and roadmap links

15. **Assignment → AssignmentSubmission**
    - One assignment has many submissions

16. **MentorTalk → MentorTalkAttendance, MentorTalkFeedback**
    - One talk has many attendees and feedback entries

17. **LearningResource → StudentResourceAccess**
    - One resource can be accessed by many students

#### Many-to-Many Relationships (via Junction Tables)

1. **Student ↔ CareerPath** (via StudentCareerPath)
   - Students can have multiple career paths
   - Career paths can be assigned to multiple students

2. **Faculty ↔ CareerPath** (via FacultyCareerPath)
   - Faculty can specialize in multiple career paths
   - Career paths can have multiple faculty specialists

3. **Student ↔ Roadmap** (via RoadmapAssignment)
   - Students can be assigned multiple roadmaps
   - Roadmaps can be assigned to multiple students

4. **Student ↔ LearningResource** (via StudentResourceAccess)
   - Students can access multiple resources
   - Resources can be accessed by multiple students

5. **Student ↔ Workshop** (via WorkshopEnrollment)
   - Students can enroll in multiple workshops
   - Workshops can have multiple students

6. **Student ↔ Course** (via CourseEnrollment)
   - Students can enroll in multiple courses
   - Courses can have multiple students

7. **Course ↔ Roadmap** (via CourseRoadmapAssignment)
   - Courses can be linked to multiple roadmaps
   - Roadmaps can include multiple courses

8. **Student ↔ MentorTalk** (via MentorTalkAttendance)
   - Students can attend multiple talks
   - Talks can have multiple attendees

#### Self-Referencing Relationships

1. **Message → Message** (via replyToId)
   - Messages can reply to other messages (threaded conversations)


---

## Indexes & Performance

### Primary Indexes

All tables have a primary key index on the `id` column (AUTO_INCREMENT).

### Unique Indexes

1. **College**: `name`
2. **Department**: `name`
3. **User**: `email`
4. **Faculty**: `email`
5. **Student**: `email`, `registerNumber`
6. **CareerPath**: `name`
7. **StudentCareerPath**: `(studentId, careerPathId)`
8. **FacultyCareerPath**: `(facultyId, careerPathId)`
9. **StudentPerformance**: `(studentId, category)`
10. **RoadmapAssignment**: `(roadmapId, studentId)`
11. **StudentResourceAccess**: `(studentId, resourceId)`
12. **MessageRead**: `(messageId, userId)`
13. **MessageRoomMember**: `(roomId, userId)`
14. **WorkshopEnrollment**: `(workshopId, studentId)`
15. **CourseEnrollment**: `(courseId, studentId)`
16. **CourseRoadmapAssignment**: `(courseId, roadmapId)`
17. **MentorTalkAttendance**: `(talkId, studentId)`
18. **MentorTalkFeedback**: `(talkId, studentId)`

### Foreign Key Indexes

All foreign key columns are automatically indexed for performance:
- `collegeId`, `departmentId`, `studentId`, `facultyId`, `careerPathId`, `roadmapId`, `resourceId`, `courseId`, `workshopId`, `assignmentId`, `talkId`, `messageId`, `roomId`, `quizId`, `adaptiveQuizId`, `sessionId`, `createdBy`, `assignedBy`, `evaluatedBy`, `senderId`, `replyToId`

### Composite Indexes

1. **AdaptiveQuiz**: `(studentId, quizDate)` - For daily quiz lookups
2. **StudentCareerPath**: `(studentId, careerPathId)` - For career path assignments
3. **FacultyCareerPath**: `(facultyId, careerPathId)` - For faculty specializations
4. **StudentPerformance**: `(studentId, category)` - For performance tracking
5. **RoadmapAssignment**: `(roadmapId, studentId)` - For roadmap assignments
6. **StudentResourceAccess**: `(studentId, resourceId)` - For resource tracking
7. **MessageRead**: `(messageId, userId)` - For read status
8. **MessageRoomMember**: `(roomId, userId)` - For room membership
9. **WorkshopEnrollment**: `(workshopId, studentId)` - For enrollment tracking
10. **CourseEnrollment**: `(courseId, studentId)` - For enrollment tracking
11. **CourseRoadmapAssignment**: `(courseId, roadmapId)` - For course-roadmap links
12. **MentorTalkAttendance**: `(talkId, studentId)` - For attendance tracking
13. **MentorTalkFeedback**: `(talkId, studentId)` - For feedback tracking

### Additional Indexes for Query Performance

1. **User**: `role` - For role-based queries
2. **Faculty**: `canAssignCrossDepartment` - For permission checks
3. **Student**: `year` - For year-based filtering
4. **AdaptiveQuiz**: `isCompleted`, `quizDate` - For quiz status queries
5. **Quiz**: `category`, `difficulty`, `isActive` - For quiz filtering
6. **StudentPerformance**: `knowledgeLevel` - For performance analysis
7. **LearningResource**: `category`, `careerPath`, `difficulty` - For resource filtering
8. **CodeTestSession**: `language`, `sessionDate` - For session queries
9. **CodeExecutionHistory**: `executedAt`, `language` - For execution history
10. **CodeTestResult**: `status`, `testId` - For result queries
11. **Message**: `messageType`, `priority`, `roomId`, `sentAt` - For message filtering
12. **MessageRoom**: `roomType`, `isActive` - For room filtering
13. **Workshop**: `status`, `isMandatory`, `startDate` - For workshop queries
14. **Course**: `status`, `courseType`, `startDate` - For course queries
15. **Assignment**: `dueDate` - For deadline queries
16. **AssignmentSubmission**: `status` - For submission status
17. **CertificateSubmission**: `status`, `submittedAt` - For certificate evaluation
18. **MentorTalk**: `scheduledDate`, `status` - For talk scheduling
19. **Notification**: `type`, `isRead`, `priority`, `createdAt` - For notification filtering

### Performance Recommendations

1. **Regular Index Maintenance**: Run `ANALYZE` and `VACUUM` regularly on PostgreSQL
2. **Query Optimization**: Use `EXPLAIN ANALYZE` to optimize slow queries
3. **Partitioning**: Consider partitioning large tables like `CodeExecutionHistory` by date
4. **Archiving**: Archive old records from history tables to maintain performance
5. **Connection Pooling**: Use connection pooling (e.g., PgBouncer) for better performance
6. **Caching**: Implement Redis caching for frequently accessed data
7. **Read Replicas**: Consider read replicas for heavy read operations


---

## Data Types & Enums

### Enum Types

#### Gender
```typescript
enum Gender {
  MALE
  FEMALE
  OTHER
}
```
**Used in**: `Faculty`, `Student`

### Common Data Types

#### Identifiers
- **INT**: Auto-incrementing primary keys and foreign keys
- **VARCHAR**: Email addresses, names, titles (variable length strings)

#### Text Content
- **TEXT**: Long-form content (descriptions, messages, code, JSON strings)
- **TEXT[]**: Arrays of strings (categories, skills, weak/strong areas)

#### Numeric Types
- **INT**: Counts, scores, years, IDs
- **FLOAT**: Decimal values (scores, grades, percentages)
- **DECIMAL(5,2)**: Precise decimal values (scores with 2 decimal places)

#### Boolean Flags
- **BOOLEAN**: Status flags (isCompleted, isActive, isMandatory, isRead, etc.)

#### Timestamps
- **TIMESTAMP**: Date and time values
  - `DEFAULT NOW()`: Auto-set on creation
  - `AUTO_UPDATE`: Auto-update on modification
  - `NULLABLE`: Optional timestamps (completedAt, readAt, etc.)

#### JSON Storage
Many columns store JSON as TEXT strings:
- `questions`: Quiz questions with options and answers
- `answers`: Student answers array
- `milestones`: Roadmap milestones
- `careerOutcomes`: Career outcomes array
- `performanceData`: Performance metrics
- `testResults`: Test case results
- `testCases`: Test case definitions
- `results`: Execution results
- `metadata`: Additional data
- `prerequisites`: Course prerequisites
- `objectives`: Learning objectives
- `materials`: Course materials
- `skills`: Skill arrays
- `wrongAnswers`: Wrong answer details
- `feedback`: Detailed feedback

### String Formats

#### Comma-Separated Values
- `assignedYears`: "1,2,3" (years)
- `allowedDepartments`: "1,2,3" (department IDs)

#### Time Format
- `scheduledTime`: "HH:MM" format (e.g., "14:30")

#### Status Values

**Quiz/Test Status**:
- `completed`, `failed`, `in_progress`

**Workshop/Course Status**:
- `upcoming`, `ongoing`, `completed`, `cancelled`
- `active`, `inactive`

**Enrollment Status**:
- `enrolled`, `completed`, `dropped`

**Submission Status**:
- `submitted`, `graded`, `late`
- `pending`, `approved`, `rejected`

**Attendance Status**:
- `registered`, `attended`, `absent`

**Message Type**:
- `general`, `announcement`, `reminder`, `assignment`

**Priority Levels**:
- `low`, `normal`, `high`, `urgent`

**Notification Types**:
- `quiz`, `career`, `achievement`, `general`

**Room Types**:
- `general`, `department`, `course`, `private`

**User Roles**:
- `admin`, `faculty`, `student`

**Course Types**:
- `online`, `offline`, `hybrid`

**Submission Types**:
- `file`, `text`, `code`, `quiz`

**Difficulty Levels**:
- `beginner`, `intermediate`, `advanced`
- `EASY`, `MEDIUM`, `HARD`

**Mode**:
- `online`, `offline`

**User Roles in Rooms**:
- `member`, `admin`, `moderator`

**Grades**:
- `A`, `B`, `C`, `D`, `F`

**Course Types (Certificate)**:
- `online-course`, `workshop`, `certification`

### Constraints Summary

#### NOT NULL Constraints
Applied to essential fields that must always have values:
- All primary keys (`id`)
- All foreign keys (except optional relationships)
- Core identification fields (`email`, `name`, `title`)
- Required content fields (`description`, `content`, `code`)

#### DEFAULT Values
- Numeric: `0`, `1`, `5`, `25`, `100`
- Boolean: `FALSE`, `TRUE`
- String: `'student'`, `'general'`, `'normal'`, `'beginner'`, `'pending'`
- Timestamp: `NOW()`
- Array: `[]`

#### UNIQUE Constraints
Ensure data integrity for:
- Email addresses
- Register numbers
- Names (College, Department, CareerPath)
- Junction table combinations (prevent duplicates)

#### CASCADE Rules

**ON DELETE CASCADE**:
- Department → Faculty, Student
- Student → All student-related records
- Faculty → Faculty-related records
- CareerPath → StudentCareerPath, FacultyCareerPath
- Roadmap → RoadmapAssignment, LearningResource
- Course → CourseEnrollment, Assignment
- Workshop → WorkshopEnrollment
- Message → MessageRead
- MessageRoom → MessageRoomMember
- MentorTalk → MentorTalkAttendance, MentorTalkFeedback

**ON DELETE SET NULL**:
- Department → User (departmentId)
- User → StudentCareerPath (assignedBy)
- Faculty → CertificateSubmission (evaluatedBy)


---

## Database Statistics

### Table Count by Category

| Category | Tables | Percentage |
|----------|--------|------------|
| Core Tables | 3 | 7.1% |
| User Management | 3 | 7.1% |
| Career Path | 3 | 7.1% |
| Assessment & Quiz | 5 | 11.9% |
| Roadmap & Learning | 4 | 9.5% |
| Code Execution | 5 | 11.9% |
| Communication | 4 | 9.5% |
| Course & Workshop | 7 | 16.7% |
| Mentorship | 3 | 7.1% |
| Notification & AI | 3 | 7.1% |
| **Total** | **42** | **100%** |

### Relationship Statistics

- **Total Relationships**: 100+
- **One-to-Many**: 70+
- **Many-to-Many**: 8
- **Self-Referencing**: 1

### Column Statistics

- **Primary Keys**: 42 (one per table)
- **Foreign Keys**: 80+
- **Unique Constraints**: 25+
- **Boolean Flags**: 40+
- **Timestamp Fields**: 100+
- **JSON Fields**: 30+

### Index Statistics

- **Primary Indexes**: 42
- **Unique Indexes**: 25+
- **Foreign Key Indexes**: 80+
- **Composite Indexes**: 13
- **Performance Indexes**: 30+

---

## Entity Relationship Diagram (ERD)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXUSPATH DATABASE                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  CORE   │          │  USER   │          │ CAREER  │
   │ TABLES  │          │  MGMT   │          │  PATH   │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                     │
        │                    │                     │
   ┌────▼────────────────────▼─────────────────────▼────┐
   │                                                      │
   │              STUDENT LEARNING ECOSYSTEM              │
   │                                                      │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
   │  │Assessment│  │ Roadmap  │  │   Code   │         │
   │  │  & Quiz  │  │Learning  │  │Execution │         │
   │  └──────────┘  └──────────┘  └──────────┘         │
   │                                                      │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
   │  │  Course  │  │Messaging │  │Mentorship│         │
   │  │ Workshop │  │  & Comm  │  │  & AI    │         │
   │  └──────────┘  └──────────┘  └──────────┘         │
   │                                                      │
   └──────────────────────────────────────────────────────┘
```

### Detailed Relationship Flow

```
College (1) ──────► (N) Department
                         │
                         ├──► (N) Faculty ──┬──► (N) FacultyCareerPath
                         │                   ├──► (N) Message
                         │                   ├──► (N) Workshop
                         │                   ├──► (N) Course
                         │                   ├──► (N) MentorTalk
                         │                   └──► (N) MessageRoom
                         │
                         ├──► (N) Student ───┬──► (N) StudentCareerPath
                         │                   ├──► (N) AdaptiveQuiz
                         │                   ├──► (N) QuizAttempt
                         │                   ├──► (N) StudentPerformance
                         │                   ├──► (N) RoadmapAssignment
                         │                   ├──► (N) CodeTestSession
                         │                   ├──► (N) CodeExecution
                         │                   ├──► (N) Notification
                         │                   ├──► (N) CourseEnrollment
                         │                   ├──► (N) WorkshopEnrollment
                         │                   └──► (N) MentorTalkAttendance
                         │
                         └──► (N) User ──────┬──► (N) Roadmap
                                             └──► (N) RoadmapAssignment

CareerPath (1) ─────┬──► (N) StudentCareerPath
                    └──► (N) FacultyCareerPath

Roadmap (1) ────────┬──► (N) RoadmapAssignment
                    ├──► (N) LearningResource
                    └──► (N) CourseRoadmapAssignment

Course (1) ─────────┬──► (N) CourseEnrollment
                    ├──► (N) Assignment
                    └──► (N) CourseRoadmapAssignment

Workshop (1) ───────► (N) WorkshopEnrollment

MentorTalk (1) ─────┬──► (N) MentorTalkAttendance
                    └──► (N) MentorTalkFeedback

Message (1) ────────┬──► (N) MessageRead
                    └──► (N) Message (replies)

MessageRoom (1) ────► (N) MessageRoomMember
```

---

## Quick Reference Guide

### Most Important Tables

1. **Student** - Central table with 20+ relationships
2. **Faculty** - Manages courses, workshops, and mentorship
3. **User** - Authentication and authorization
4. **CareerPath** - Defines learning paths
5. **Roadmap** - Learning roadmaps and milestones
6. **Course** - Course management
7. **AdaptiveQuiz** - Daily adaptive assessments

### Key Junction Tables

1. **StudentCareerPath** - Student-CareerPath assignments
2. **FacultyCareerPath** - Faculty specializations
3. **RoadmapAssignment** - Roadmap-Student assignments
4. **CourseEnrollment** - Course enrollments
5. **WorkshopEnrollment** - Workshop enrollments
6. **StudentResourceAccess** - Resource tracking
7. **CourseRoadmapAssignment** - Course-Roadmap links

### Critical Indexes for Performance

1. `(studentId, quizDate)` on AdaptiveQuiz
2. `(studentId, category)` on StudentPerformance
3. `email` on User, Faculty, Student
4. `registerNumber` on Student
5. `status` on various tables (Workshop, Course, CertificateSubmission)

---

## Maintenance & Best Practices

### Regular Maintenance Tasks

1. **Daily**:
   - Monitor slow queries
   - Check connection pool usage
   - Review error logs

2. **Weekly**:
   - Run `ANALYZE` on frequently updated tables
   - Check index usage statistics
   - Review query performance

3. **Monthly**:
   - Run `VACUUM` on large tables
   - Archive old records
   - Review and optimize indexes
   - Check database size and growth

4. **Quarterly**:
   - Full database backup and restore test
   - Review and update documentation
   - Performance tuning based on usage patterns

### Data Integrity Checks

1. Verify foreign key constraints
2. Check for orphaned records
3. Validate JSON data structures
4. Ensure unique constraints are maintained
5. Verify cascade delete operations

### Security Best Practices

1. Use parameterized queries (Prisma handles this)
2. Implement row-level security for sensitive data
3. Regular security audits
4. Encrypt sensitive data at rest
5. Use SSL/TLS for database connections
6. Implement proper backup encryption
7. Regular password rotation for database users

### Backup Strategy

1. **Full Backup**: Daily at off-peak hours
2. **Incremental Backup**: Every 6 hours
3. **Transaction Log Backup**: Continuous
4. **Retention**: 30 days for daily, 90 days for weekly
5. **Off-site Storage**: Replicate to different region
6. **Test Restores**: Monthly verification

---

## Conclusion

This comprehensive database documentation covers all 42 tables in the NexusPath system, including:

- Complete table structures with all columns and data types
- Primary keys, foreign keys, and unique constraints
- All relationships and their cardinality
- Indexes for performance optimization
- Data types and enums
- Business rules and constraints
- Performance recommendations
- Maintenance best practices

The database is designed to support a complete learning management system with career path guidance, adaptive assessments, code execution, real-time messaging, course management, and mentorship features.

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Database Version**: PostgreSQL (via Prisma 6.16.3)  
**Total Tables**: 42  
**Total Relationships**: 100+
