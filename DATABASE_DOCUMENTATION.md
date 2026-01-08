# NexusPath - Database Documentation
## Comprehensive Database Schema Reference

---

## 📋 Table of Contents

1. [Database Overview](#1-database-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Core Tables](#3-core-tables)
4. [User Management Tables](#4-user-management-tables)
5. [Career Path Tables](#5-career-path-tables)
6. [Assessment Tables](#6-assessment-tables)
7. [Learning Management Tables](#7-learning-management-tables)
8. [Communication Tables](#8-communication-tables)
9. [Code Execution Tables](#9-code-execution-tables)
10. [Course & Workshop Tables](#10-course--workshop-tables)
11. [Mentorship Tables](#11-mentorship-tables)
12. [Indexes & Constraints](#12-indexes--constraints)
13. [Database Relationships](#13-database-relationships)
14. [Data Types & Enums](#14-data-types--enums)

---

## 1. Database Overview

### 1.1 Database Information

- **Database Type**: PostgreSQL
- **ORM**: Prisma 6.16.3
- **Total Tables**: 42
- **Total Relationships**: 100+
- **Normalization Level**: 3NF (Third Normal Form)
- **Character Set**: UTF-8
- **Collation**: Default PostgreSQL

### 1.2 Database Statistics

```
Total Tables: 42
├── Core Tables: 5
├── User Management: 4
├── Career Path: 3
├── Assessment: 8
├── Learning Management: 4
├── Communication: 4
├── Code Execution: 5
├── Courses & Workshops: 6
└── Mentorship: 3
```

### 1.3 Naming Conventions

- **Tables**: PascalCase (e.g., `Student`, `CareerPath`)
- **Columns**: camelCase (e.g., `firstName`, `createdAt`)
- **Foreign Keys**: `{table}Id` (e.g., `studentId`, `departmentId`)
- **Junction Tables**: `{Table1}{Table2}` (e.g., `StudentCareerPath`)
- **Timestamps**: `createdAt`, `updatedAt`

---

## 2. Entity Relationship Diagram

### 2.1 High-Level ERD

```
┌─────────────┐
│   College   │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│ Department  │
└──────┬──────┘
       │ 1:N
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Faculty │   │ Student  │   │   User   │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │
     │ N:M          │ N:M          │ 1:N
     ▼              ▼              ▼
┌──────────────────────────────────────┐
│         CareerPath                    │
└──────────────────────────────────────┘
```

### 2.2 Detailed Relationship Map

```
Student ──┬── AdaptiveQuiz
          ├── QuizAttempt
          ├── StudentPerformance
          ├── CodeTestSession
          ├── CodeExecution
          ├── RoadmapAssignment
          ├── CourseEnrollment
          ├── WorkshopEnrollment
          ├── CertificateSubmission
          ├── Notification
          └── StudentCareerPath

Faculty ──┬── FacultyCareerPath
          ├── Message
          ├── Course
          ├── Workshop
          ├── MentorTalk
          └── CertificateSubmission (evaluator)

Roadmap ──┬── RoadmapAssignment
          ├── LearningResource
          └── CourseRoadmapAssignment
```

---

## 3. Core Tables

### 3.1 College Table

**Purpose**: Stores information about educational institutions/colleges.

**Table Name**: `College`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | College name |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`

**Relationships**:
- One-to-Many with `Department`

**Example Data**:
```sql
INSERT INTO College (name) VALUES 
('College of Engineering'),
('College of Arts and Science'),
('College of Technology');
```

---

### 3.2 Department Table

**Purpose**: Stores department information within colleges.

**Table Name**: `Department`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Department name |
| description | TEXT | NULLABLE | Department description |
| collegeId | INT | FOREIGN KEY, NOT NULL | Reference to College |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- INDEX on `collegeId`

**Foreign Keys**:
- `collegeId` → `College(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `College`
- One-to-Many with `Faculty`
- One-to-Many with `Student`
- One-to-Many with `User`

**Example Data**:
```sql
INSERT INTO Department (name, description, collegeId) VALUES 
('Computer Science', 'Department of Computer Science and Engineering', 1),
('Information Technology', 'Department of Information Technology', 1),
('Electronics', 'Department of Electronics and Communication', 1);
```

---

### 3.3 Gender Enum

**Purpose**: Defines gender options for users.

**Enum Name**: `Gender`

**Values**:
- `MALE`
- `FEMALE`
- `OTHER`

**Usage**: Used in `Student` and `Faculty` tables.

---

## 4. User Management Tables

### 4.1 User Table

**Purpose**: Base authentication table for all user types (Admin, Faculty, Student).

**Table Name**: `User`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email (login) |
| password | VARCHAR | NOT NULL | Hashed password (bcrypt) |
| plainPassword | VARCHAR | NULLABLE | Plain password (optional) |
| role | VARCHAR | DEFAULT 'student' | User role (admin/faculty/student) |
| firstName | VARCHAR | NULLABLE | User's first name |
| lastName | VARCHAR | NULLABLE | User's last name |
| departmentId | INT | FOREIGN KEY, NULLABLE | Reference to Department |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation date |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `departmentId`
- INDEX on `role`

**Foreign Keys**:
- `departmentId` → `Department(id)` ON DELETE SET NULL

**Relationships**:
- Many-to-One with `Department`
- One-to-Many with `StudentCareerPath` (as assignedBy)
- One-to-Many with `Roadmap` (as creator)
- One-to-Many with `RoadmapAssignment` (as assignedBy)

**Security Notes**:
- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are generated for authentication
- Role-based access control (RBAC) implemented

**Example Data**:
```sql
INSERT INTO User (email, password, role, firstName, lastName, departmentId) VALUES 
('admin@nexuspath.edu', '$2b$10$...', 'admin', 'John', 'Admin', NULL),
('faculty@nexuspath.edu', '$2b$10$...', 'faculty', 'Jane', 'Professor', 1),
('student@nexuspath.edu', '$2b$10$...', 'student', 'Alice', 'Student', 1);
```

---

### 4.2 Faculty Table

**Purpose**: Stores faculty-specific information and assignment configurations.

**Table Name**: `Faculty`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Faculty email |
| name | VARCHAR | NOT NULL | Full name |
| gender | ENUM(Gender) | NOT NULL | Gender |
| departmentId | INT | FOREIGN KEY, NOT NULL | Reference to Department |
| assignedYears | VARCHAR | NULLABLE | Comma-separated years (e.g., "1,2,3") |
| canAssignCrossDepartment | BOOLEAN | DEFAULT FALSE | Cross-department permission |
| allowedDepartments | VARCHAR | NULLABLE | Comma-separated department IDs |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `departmentId`
- INDEX on `canAssignCrossDepartment`

**Foreign Keys**:
- `departmentId` → `Department(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `Department`
- One-to-Many with `FacultyCareerPath`
- One-to-Many with `Message`
- One-to-Many with `CertificateSubmission` (as evaluator)
- One-to-Many with `Workshop`
- One-to-Many with `Course`
- One-to-Many with `CourseRoadmapAssignment`
- One-to-Many with `MentorTalk`
- One-to-Many with `MessageRoom`

**Business Logic**:
- `assignedYears`: NULL or empty = all years, otherwise specific years
- `canAssignCrossDepartment`: Allows faculty to manage students from other departments
- `allowedDepartments`: NULL = all departments (if cross-department enabled)

**Example Data**:
```sql
INSERT INTO Faculty (email, name, gender, departmentId, assignedYears) VALUES 
('prof.smith@nexuspath.edu', 'Dr. John Smith', 'MALE', 1, '1,2'),
('prof.johnson@nexuspath.edu', 'Dr. Sarah Johnson', 'FEMALE', 1, NULL),
('prof.lee@nexuspath.edu', 'Dr. Michael Lee', 'MALE', 2, '3,4');
```

---

### 4.3 Student Table

**Purpose**: Stores student-specific information and academic details.

**Table Name**: `Student`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Student email |
| name | VARCHAR | NOT NULL | Full name |
| gender | ENUM(Gender) | NOT NULL | Gender |
| phoneNumber | VARCHAR | NULLABLE | Contact number |
| departmentId | INT | FOREIGN KEY, NOT NULL | Reference to Department |
| year | INT | NOT NULL | Academic year (1-4) |
| registerNumber | VARCHAR | UNIQUE, NOT NULL | Student register number |
| favoriteLanguage | VARCHAR | NULLABLE | Favorite programming language |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- UNIQUE INDEX on `registerNumber`
- INDEX on `departmentId`
- INDEX on `year`

**Foreign Keys**:
- `departmentId` → `Department(id)` ON DELETE CASCADE

**Relationships** (20+ relationships):
- Many-to-One with `Department`
- One-to-Many with `StudentCareerPath`
- One-to-Many with `StudentPerformance`
- One-to-Many with `AdaptiveQuiz`
- One-to-Many with `QuizSession`
- One-to-Many with `QuizAttempt`
- One-to-Many with `RoadmapAssignment`
- One-to-Many with `StudentResourceAccess`
- One-to-Many with `CodeTestSession`
- One-to-Many with `CodeExecutionHistory`
- One-to-Many with `CodeExecution`
- One-to-Many with `CodeTestResult`
- One-to-Many with `Notification`
- One-to-Many with `AISuggestion`
- One-to-Many with `CertificateSubmission`
- One-to-Many with `WorkshopEnrollment`
- One-to-Many with `CourseEnrollment`
- One-to-Many with `AssignmentSubmission`
- One-to-Many with `MentorTalkAttendance`
- One-to-Many with `MentorTalkFeedback`

**Constraints**:
- `year` must be between 1 and 4
- `registerNumber` format: typically follows institution pattern

**Example Data**:
```sql
INSERT INTO Student (email, name, gender, departmentId, year, registerNumber, favoriteLanguage) VALUES 
('alice@student.edu', 'Alice Johnson', 'FEMALE', 1, 2, 'CS2023001', 'Python'),
('bob@student.edu', 'Bob Smith', 'MALE', 1, 3, 'CS2022045', 'JavaScript'),
('carol@student.edu', 'Carol Williams', 'FEMALE', 2, 1, 'IT2024012', 'Java');
```

---

## 5. Career Path Tables

### 5.1 CareerPath Table

**Purpose**: Defines available career paths for students.

**Table Name**: `CareerPath`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Career path name |
| description | TEXT | NULLABLE | Detailed description |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`

**Relationships**:
- One-to-Many with `StudentCareerPath`
- One-to-Many with `FacultyCareerPath`

**Example Data**:
```sql
INSERT INTO CareerPath (name, description) VALUES 
('Web Development', 'Full-stack web development with modern frameworks'),
('Data Science', 'Data analysis, machine learning, and AI'),
('Mobile Development', 'iOS and Android app development'),
('DevOps Engineering', 'Cloud infrastructure and automation'),
('Cybersecurity', 'Information security and ethical hacking');
```

---

### 5.2 StudentCareerPath Table

**Purpose**: Junction table linking students to their assigned career paths.

**Table Name**: `StudentCareerPath`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| careerPathId | INT | FOREIGN KEY, NOT NULL | Reference to CareerPath |
| assignedBy | INT | FOREIGN KEY, NULLABLE | Faculty who assigned (User ID) |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(studentId, careerPathId)`
- INDEX on `studentId`
- INDEX on `careerPathId`
- INDEX on `assignedBy`

**Foreign Keys**:
- `studentId` → `Student(id)` ON DELETE CASCADE
- `careerPathId` → `CareerPath(id)` ON DELETE CASCADE
- `assignedBy` → `User(id)` ON DELETE SET NULL

**Relationships**:
- Many-to-One with `Student`
- Many-to-One with `CareerPath`
- Many-to-One with `User` (assignedBy)

**Business Rules**:
- A student can have multiple career paths
- Same career path cannot be assigned twice to the same student
- Assignment tracking for accountability

**Example Data**:
```sql
INSERT INTO StudentCareerPath (studentId, careerPathId, assignedBy) VALUES 
(1, 1, 2),  -- Alice assigned to Web Development by Faculty ID 2
(1, 2, 2),  -- Alice also assigned to Data Science
(2, 3, 2);  -- Bob assigned to Mobile Development
```

---

### 5.3 FacultyCareerPath Table

**Purpose**: Junction table linking faculty to their career path specializations.

**Table Name**: `FacultyCareerPath`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| facultyId | INT | FOREIGN KEY, NOT NULL | Reference to Faculty |
| careerPathId | INT | FOREIGN KEY, NOT NULL | Reference to CareerPath |
| assignedAt | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(facultyId, careerPathId)`
- INDEX on `facultyId`
- INDEX on `careerPathId`

**Foreign Keys**:
- `facultyId` → `Faculty(id)` ON DELETE CASCADE
- `careerPathId` → `CareerPath(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `Faculty`
- Many-to-One with `CareerPath`

**Business Rules**:
- Faculty can specialize in multiple career paths
- Empty specialization = faculty handles all career paths
- Used for student visibility filtering

**Example Data**:
```sql
INSERT INTO FacultyCareerPath (facultyId, careerPathId) VALUES 
(1, 1),  -- Faculty 1 specializes in Web Development
(1, 3),  -- Faculty 1 also specializes in Mobile Development
(2, 2);  -- Faculty 2 specializes in Data Science
```

---

## 6. Assessment Tables

### 6.1 AdaptiveQuiz Table

**Purpose**: Stores daily adaptive quiz instances for students.

**Table Name**: `AdaptiveQuiz`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| quizDate | TIMESTAMP | NOT NULL | Quiz date |
| questions | TEXT | NOT NULL | JSON string of questions |
| performanceData | TEXT | NULLABLE | JSON string of performance metrics |
| isCompleted | BOOLEAN | DEFAULT FALSE | Completion status |
| totalAttempts | INT | DEFAULT 0 | Number of attempts (max 2) |
| bestScore | DECIMAL(5,2) | DEFAULT 0.0 | Best score achieved |
| lastAttemptAt | TIMESTAMP | NULLABLE | Last attempt timestamp |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `studentId`
- INDEX on `quizDate`
- INDEX on `isCompleted`
- COMPOSITE INDEX on `(studentId, quizDate)`

**Foreign Keys**:
- `studentId` → `Student(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `Student`
- One-to-Many with `QuizAttempt`

**Business Rules**:
- One quiz per student per day
- Maximum 2 attempts allowed
- Questions generated by AI based on career path
- 20 questions per quiz

**JSON Structure for questions**:
```json
[
  {
    "id": "q1",
    "question": "What is React?",
    "options": ["Library", "Framework", "Language", "Tool"],
    "correctAnswer": 0,
    "explanation": "React is a JavaScript library...",
    "category": "Web Development",
    "difficulty": "EASY",
    "points": 1
  }
]
```

**Example Data**:
```sql
INSERT INTO AdaptiveQuiz (studentId, quizDate, questions, totalAttempts, bestScore) VALUES 
(1, '2025-11-07', '[...]', 2, 85.5),
(2, '2025-11-07', '[...]', 1, 72.0);
```

---

### 6.2 QuizAttempt Table

**Purpose**: Records individual quiz attempts with answers and results.

**Table Name**: `QuizAttempt`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| adaptiveQuizId | INT | FOREIGN KEY, NULLABLE | Reference to AdaptiveQuiz |
| quizId | INT | FOREIGN KEY, NULLABLE | Reference to Quiz (static) |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| attemptNumber | INT | NOT NULL | Attempt number (1 or 2) |
| answers | TEXT | NOT NULL | JSON string of answers |
| score | DECIMAL(5,2) | NOT NULL | Score achieved |
| correctAnswers | INT | NOT NULL | Number of correct answers |
| totalQuestions | INT | NOT NULL | Total questions |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| isCorrect | BOOLEAN | DEFAULT FALSE | Overall correctness |
| attemptedAt | TIMESTAMP | DEFAULT NOW() | Attempt start time |
| completedAt | TIMESTAMP | NULLABLE | Attempt completion time |
| wrongAnswers | TEXT | NULLABLE | JSON of wrong answers with explanations |
| feedback | TEXT | NULLABLE | JSON of detailed feedback |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `adaptiveQuizId`
- INDEX on `quizId`
- INDEX on `studentId`
- INDEX on `attemptedAt`

**Foreign Keys**:
- `adaptiveQuizId` → `AdaptiveQuiz(id)` ON DELETE CASCADE
- `quizId` → `Quiz(id)` ON DELETE CASCADE
- `studentId` → `Student(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `AdaptiveQuiz`
- Many-to-One with `Quiz`
- Many-to-One with `Student`

**JSON Structure for answers**:
```json
[0, 2, 1, 3, 0, ...]  // Array of selected option indexes
```

**JSON Structure for wrongAnswers**:
```json
[
  {
    "questionIndex": 5,
    "selectedAnswer": 2,
    "correctAnswer": 1,
    "explanation": "The correct answer is..."
  }
]
```

**Example Data**:
```sql
INSERT INTO QuizAttempt (adaptiveQuizId, studentId, attemptNumber, answers, score, correctAnswers, totalQuestions, timeSpent) VALUES 
(1, 1, 1, '[0,2,1,3,...]', 75.0, 15, 20, 1200),
(1, 1, 2, '[0,1,1,3,...]', 85.5, 17, 20, 1050);
```

---

### 6.3 Quiz Table

**Purpose**: Stores static/predefined quiz templates.

**Table Name**: `Quiz`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
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
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `category`
- INDEX on `difficulty`
- INDEX on `isActive`

**Relationships**:
- One-to-Many with `QuizAttempt`

**Example Data**:
```sql
INSERT INTO Quiz (title, description, category, difficulty, questions, options, correctAnswers, explanations) VALUES 
('JavaScript Basics', 'Test your JavaScript knowledge', 'Programming', 'EASY', '[...]', '[...]', '[...]', '[...]');
```

---

### 6.4 QuizSession Table

**Purpose**: Tracks quiz session statistics and performance.

**Table Name**: `QuizSession`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| studentId | INT | FOREIGN KEY, NOT NULL | Reference to Student |
| sessionDate | TIMESTAMP | DEFAULT NOW() | Session date |
| totalQuestions | INT | NOT NULL | Total questions answered |
| correctAnswers | INT | NOT NULL | Correct answers count |
| sessionScore | DECIMAL(5,2) | NOT NULL | Session score percentage |
| timeSpent | INT | NOT NULL | Time spent in seconds |
| categories | TEXT[] | DEFAULT [] | Array of categories covered |
| difficulties | TEXT[] | DEFAULT [] | Array of difficulty levels |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `studentId`
- INDEX on `sessionDate`

**Foreign Keys**:
- `studentId` → `Student(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `Student`

**Example Data**:
```sql
INSERT INTO QuizSession (studentId, totalQuestions, correctAnswers, sessionScore, timeSpent, categories) VALUES 
(1, 20, 17, 85.0, 1200, ARRAY['Web Development', 'JavaScript']);
```

---

### 6.5 StudentPerformance Table

**Purpose**: Tracks student performance metrics by category.

**Table Name**: `StudentPerformance`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
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
| updatedAt | TIMESTAMP | DEFAULT NOW(), ON UPDATE | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(studentId, category)`
- INDEX on `studentId`
- INDEX on `category`
- INDEX on `knowledgeLevel`

**Foreign Keys**:
- `studentId` → `Student(id)` ON DELETE CASCADE

**Relationships**:
- Many-to-One with `Student`

**Business Rules**:
- One record per student per category
- Knowledge level calculated based on performance
- Weak/strong areas identified automatically

**Example Data**:
```sql
INSERT INTO StudentPerformance (studentId, category, knowledgeLevel, totalAttempts, correctAttempts, weakAreas, strongAreas) VALUES 
(1, 'JavaScript', 4, 50, 42, ARRAY['Closures', 'Promises'], ARRAY['Variables', 'Functions']),
(1, 'React', 3, 30, 22, ARRAY['Hooks'], ARRAY['Components', 'Props']);
```

