# NexusPath - Complete Project Documentation
## Comprehensive Learning Management System

**Version:** 1.0.0  
**Last Updated:** November 7, 2025  
**Status:** Production Ready  
**Technology Stack:** Next.js 15, React 19, TypeScript 5, PostgreSQL, Prisma ORM

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Core Features](#5-core-features)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Database Architecture](#7-database-architecture)
8. [API Architecture](#8-api-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Security Implementation](#10-security-implementation)
11. [AI Integration](#11-ai-integration)
12. [Real-time Communication](#12-real-time-communication)
13. [Code Execution System](#13-code-execution-system)
14. [Deployment Guide](#14-deployment-guide)
15. [User Guides](#15-user-guides)
16. [Development Guide](#16-development-guide)
17. [Testing & Quality Assurance](#17-testing--quality-assurance)
18. [Performance Optimization](#18-performance-optimization)
19. [Troubleshooting](#19-troubleshooting)
20. [Future Roadmap](#20-future-roadmap)

---

## 1. Executive Summary

### 1.1 Project Vision

**NexusPath** is a next-generation, AI-powered Learning Management System designed to revolutionize educational institutions' approach to:
- Student career development and guidance
- Personalized learning assessment
- Real-time faculty-student interaction
- Comprehensive performance analytics
- Industry-aligned skill development

### 1.2 Key Highlights

✅ **AI-Powered Learning**: Personalized quiz generation and roadmap creation using Google Gemini AI  
✅ **Real-time Communication**: Socket.IO-based messaging with live notifications and typing indicators  
✅ **Comprehensive Assessment**: Daily adaptive quizzes, code execution testing, and performance analytics  
✅ **Career Path Management**: Dynamic career path assignment and tracking across departments  
✅ **Multi-Role Support**: Separate portals for Admin, Faculty, and Students with role-based access  
✅ **Scalable Architecture**: Built with Next.js 15, Prisma ORM, and PostgreSQL for enterprise-scale deployment  
✅ **Code Execution**: Integrated Monaco Editor with Judge0 API supporting 70+ programming languages  
✅ **Modern UI/UX**: Responsive design with Tailwind CSS and Radix UI components


### 1.3 Problem Statement

Traditional learning management systems face critical challenges:
- ❌ Lack of personalized learning experiences
- ❌ No real-time adaptive assessments
- ❌ Missing integrated career path guidance
- ❌ Ineffective faculty-student communication
- ❌ Limited performance analytics and insights
- ❌ No industry-aligned skill tracking
- ❌ Fragmented learning resources

### 1.4 Solution Approach

NexusPath addresses these challenges through:
- ✅ AI-driven personalized content generation
- ✅ Adaptive daily quiz system with multiple attempts
- ✅ Dynamic career path assignment and tracking
- ✅ Real-time messaging with Socket.IO
- ✅ Comprehensive analytics dashboard
- ✅ Integrated code execution and testing environment
- ✅ Unified learning resource management

### 1.5 Target Users

**Primary Users:**
- **Students**: 1000+ concurrent users
- **Faculty**: 100+ instructors
- **Administrators**: 10+ system administrators

**Institutions:**
- Universities and Colleges
- Technical Training Centers
- Corporate Training Programs
- Online Learning Platforms

---

## 2. Project Overview

### 2.1 System Capabilities

#### For Students
- 📚 Personalized daily quizzes (20 questions/day, 2 attempts)
- 🎯 Career path tracking and progress monitoring
- 💻 Code execution environment (70+ languages)
- 🧪 Automated code testing with instant feedback
- 📊 Comprehensive performance analytics
- 📝 Certificate submission and evaluation
- 🎓 Course and workshop enrollment
- 💬 Real-time messaging with faculty
- 🗺️ AI-generated learning roadmaps
- 📈 Progress visualization and insights

#### For Faculty
- 👥 Dynamic student management based on department, year, and career path
- 🗺️ Roadmap creator (manual and AI-powered)
- 📚 Learning resource management
- 📖 Course and workshop creation
- 🎤 Mentor talk scheduling
- ✅ Certificate evaluation system
- 💬 Broadcast messaging to students
- 📊 Student performance analytics
- 🔔 Real-time notifications
- 📋 Assignment creation and grading

#### For Administrators
- 🏢 College and department management
- 👤 User management (faculty and students)
- 🎯 Career path configuration
- 🔧 Faculty assignment configuration
- 📊 System-wide analytics
- 🔐 Role-based access control
- 📈 Performance monitoring
- 🔄 Bulk user provisioning

### 2.2 Technical Specifications

**Frontend:**
- Framework: Next.js 15.5.4 with App Router
- UI Library: React 19.1.0
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- Components: Radix UI primitives
- Icons: Lucide React
- Charts: Recharts
- Code Editor: Monaco Editor

**Backend:**
- Runtime: Node.js with Next.js API Routes
- Database: PostgreSQL
- ORM: Prisma 6.16.3
- Authentication: JWT with bcrypt
- Real-time: Socket.IO
- AI: Google Gemini 2.0 Flash
- Code Execution: Judge0 API

**Infrastructure:**
- Hosting: Vercel (recommended)
- Database: PostgreSQL (Supabase, Neon, or self-hosted)
- File Storage: Local or cloud storage
- Cron Jobs: Vercel Cron or GitHub Actions


---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router + React 19 + TypeScript           │  │
│  │  ├── /admin/*      - Admin Portal                        │  │
│  │  ├── /faculty/*    - Faculty Portal                      │  │
│  │  ├── /student/*    - Student Portal                      │  │
│  │  └── /lms/*        - LMS Features                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UI Components (Radix UI + Tailwind CSS)                 │  │
│  │  ├── Shadcn/ui Components                                │  │
│  │  ├── Custom Components                                   │  │
│  │  ├── Monaco Editor Integration                           │  │
│  │  └── Real-time Socket.IO Client                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (/app/api/*)                         │  │
│  │  ├── REST API Endpoints                                  │  │
│  │  ├── Socket.IO Server                                    │  │
│  │  ├── Middleware (Auth, CORS, Rate Limiting)             │  │
│  │  └── Business Logic Layer                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Prisma    │  │  Socket.IO │  │  Gemini AI │  │  Judge0  │ │
│  │    ORM     │  │   Server   │  │    API     │  │   API    │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │  ├── 42+ Tables                                           │  │
│  │  ├── Complex Relationships                               │  │
│  │  ├── Indexes & Constraints                               │  │
│  │  └── Cascade Operations                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow

```typescript
// Typical API Request Flow
1. Client Request (Browser/Mobile)
   ↓
2. Next.js Middleware (Authentication Check)
   ↓
3. API Route Handler (/app/api/*/route.ts)
   ↓
4. JWT Token Verification
   ↓
5. Role-Based Authorization Check
   ↓
6. Input Validation & Sanitization
   ↓
7. Business Logic Execution
   ↓
8. Prisma ORM Database Query
   ↓
9. PostgreSQL Database Operation
   ↓
10. Response Formatting (JSON)
   ↓
11. Client Response with Status Code
```

### 3.3 Real-time Communication Flow

```typescript
// Socket.IO Real-time Flow
1. Client Connects with JWT Token
   ↓
2. Socket.IO Server Authenticates
   ↓
3. User Joins Personal Room (user:userId)
   ↓
4. User Joins Role Room (role:student/faculty)
   ↓
5. User Joins Specific Rooms (courses, groups)
   ↓
6. Events:
   - send_message → broadcast to room
   - typing_start → notify room members
   - typing_stop → notify room members
   - new_message → receive from others
   - notification → receive system alerts
```

### 3.4 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface                         │
│  (React Components + State Management)                   │
└─────────────────────────────────────────────────────────┘
                        ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   API Layer                              │
│  (Next.js API Routes + REST Endpoints)                   │
└─────────────────────────────────────────────────────────┘
                        ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  (Business Logic + Data Processing)                      │
└─────────────────────────────────────────────────────────┘
                        ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│  (Prisma ORM + Query Optimization)                       │
└─────────────────────────────────────────────────────────┘
                        ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│  (PostgreSQL + Indexes + Constraints)                    │
└─────────────────────────────────────────────────────────┘
```


---

## 4. Technology Stack

### 4.1 Frontend Technologies

#### Core Framework
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "^5"
}
```

#### UI & Styling
```json
{
  "tailwindcss": "^4",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13",
  "lucide-react": "^0.544.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "tailwindcss-animate": "^1.0.7"
}
```

#### Code Editor & Visualization
```json
{
  "@monaco-editor/react": "^4.7.0",
  "recharts": "^3.2.1",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.3",
  "react-pdf": "^10.2.0",
  "pdfjs-dist": "^5.4.296"
}
```

#### Utilities
```json
{
  "axios": "^1.12.2",
  "date-fns": "^4.1.0",
  "sonner": "^2.0.7",
  "next-themes": "^0.4.6"
}
```

### 4.2 Backend Technologies

#### Database & ORM
```json
{
  "@prisma/client": "^6.16.3",
  "prisma": "^6.16.2"
}
```

#### Authentication & Security
```json
{
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.10",
  "bcrypt": "^6.0.0",
  "bcryptjs": "^3.0.2",
  "@types/bcrypt": "^6.0.0"
}
```

### 4.3 External Services

#### AI Integration
- **Service**: Google Gemini AI
- **Model**: gemini-2.0-flash
- **Purpose**: Quiz generation, roadmap creation, content personalization

#### Code Execution
- **Service**: Judge0 CE API
- **Version**: v1.13.0
- **Languages**: 70+ programming languages
- **Purpose**: Code compilation and execution

#### Real-time Communication
- **Service**: Socket.IO
- **Purpose**: Real-time messaging, notifications, typing indicators

### 4.4 Development Tools

```json
{
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "typescript": "^5"
  }
}
```

### 4.5 Database

**PostgreSQL Features Used:**
- JSONB for flexible data storage
- Full-text search capabilities
- Advanced indexing strategies
- Foreign key constraints
- Cascade operations
- Transaction support

---

## 5. Core Features

### 5.1 Admin Portal Features

#### College & Department Management
- ✅ Create and manage multiple colleges
- ✅ Department creation under colleges
- ✅ Hierarchical organization structure
- ✅ Department-wise student and faculty allocation
- ✅ Bulk operations support

#### User Management
- ✅ Complete CRUD operations for all user types
- ✅ Role-based access control (Admin, Faculty, Student)
- ✅ Bulk user provisioning
- ✅ Password management and security
- ✅ User activity tracking

#### Career Path Management
- ✅ Create and manage career paths
- ✅ Assign career paths to students
- ✅ Track career path progress
- ✅ Cross-department career path support
- ✅ Career path analytics

#### Faculty Management
- ✅ Faculty profile management
- ✅ Department assignment
- ✅ Year-level assignment configuration
- ✅ Cross-department permission management
- ✅ Career path specialization assignment
- ✅ Dynamic student visibility configuration

#### Student Management
- ✅ Student profile management
- ✅ Department and year assignment
- ✅ Register number management
- ✅ Career path assignment
- ✅ Performance tracking
- ✅ Bulk import/export

### 5.2 Faculty Portal Features

#### Dashboard & Analytics
- ✅ Overview of assigned students
- ✅ Performance metrics and trends
- ✅ Quick action buttons
- ✅ Student count by year and career path
- ✅ Recent activity feed
- ✅ Notification center

#### Student Management
- ✅ View assigned students based on:
  - Department
  - Year level (1-4)
  - Career path assignments
- ✅ Complete CRUD operations on students
- ✅ Advanced filter and search functionality
- ✅ Career path assignment and tracking
- ✅ Performance monitoring

#### Roadmap Creator
- ✅ AI-powered roadmap generation
- ✅ Manual roadmap creation
- ✅ Semester-wise activity planning
- ✅ 10 activity categories:
  - Technical Skills
  - Core Engineering Skills
  - Online Courses
  - Workshops/Bootcamps
  - Competitions/Challenges
  - Internships
  - Mini Projects
  - Alumni Interaction
  - Core Skill Assessment
  - Profile Building Activities
- ✅ Interactive visualization
- ✅ Roadmap assignment to students

#### Learning Resource Management
- ✅ Create and manage learning resources
- ✅ Categorize by difficulty level
- ✅ Link resources to career paths
- ✅ Track student resource access
- ✅ Resource effectiveness analytics

#### Course Management
- ✅ Create and manage courses
- ✅ Set course duration and schedule
- ✅ Define prerequisites and objectives
- ✅ Student enrollment management
- ✅ Assignment creation and grading
- ✅ Attendance tracking
- ✅ Course analytics

#### Workshop Management
- ✅ Create and schedule workshops
- ✅ Set participant limits
- ✅ Track enrollments
- ✅ Mark workshops as mandatory
- ✅ Workshop completion tracking
- ✅ Feedback collection

#### Mentor Talk Management
- ✅ Schedule mentor talks with industry experts
- ✅ Set online/offline mode
- ✅ Manage attendee registration
- ✅ Track attendance
- ✅ Collect feedback and ratings
- ✅ Speaker management

#### Certificate Evaluation
- ✅ Review student certificate submissions
- ✅ Approve/reject certificates
- ✅ Provide faculty comments
- ✅ Assign grades (A, B, C, D, F)
- ✅ Track external learning
- ✅ Certificate analytics

#### Messaging System
- ✅ Send messages to individual students
- ✅ Broadcast announcements
- ✅ Priority-based messaging (low, normal, high, urgent)
- ✅ Message type categorization (general, announcement, reminder, assignment)
- ✅ Real-time messaging with Socket.IO
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message threading and replies


### 5.3 Student Portal Features

#### Dashboard
- ✅ Personalized learning overview
- ✅ Career path progress tracking
- ✅ Upcoming quizzes and assignments
- ✅ Recent notifications
- ✅ Performance metrics
- ✅ Quick access to key features
- ✅ Activity timeline

#### Daily Quiz System
- ✅ AI-generated personalized quizzes (20 questions/day)
- ✅ Two attempts per day
- ✅ Immediate feedback with explanations
- ✅ Performance tracking
- ✅ Category-wise analysis
- ✅ Difficulty-based questions (Easy, Medium, Hard)
- ✅ Timer and progress tracking
- ✅ Historical quiz data
- ✅ Automated daily reset at midnight

#### Career Path Dashboard
- ✅ View assigned career paths
- ✅ Track progress on each path
- ✅ View roadmaps and milestones
- ✅ Access learning resources
- ✅ Career outcome information
- ✅ Progress visualization

#### AI Roadmap Generator
- ✅ Generate personalized learning roadmaps
- ✅ Based on career goals and current level
- ✅ Week-by-week learning plan
- ✅ Milestone tracking
- ✅ Resource recommendations
- ✅ Save and track AI suggestions

#### Code Execution Environment
- ✅ Multi-language code editor (Monaco Editor)
- ✅ Support for 70+ programming languages
- ✅ Real-time code execution via Judge0
- ✅ Input/output testing
- ✅ Execution time and memory tracking
- ✅ Code history and versioning
- ✅ Syntax highlighting and auto-completion
- ✅ Error handling and debugging

#### Code Testing System
- ✅ Automated coding assessments
- ✅ 5 questions per test session
- ✅ Multiple test cases per question
- ✅ Automatic scoring (5 marks per question)
- ✅ Detailed test results
- ✅ Hint system
- ✅ Time tracking per question
- ✅ Performance analytics

#### Learning Plan
- ✅ View assigned roadmaps
- ✅ Track milestone completion
- ✅ Access learning resources
- ✅ Progress visualization
- ✅ Week-by-week breakdown
- ✅ Activity tracking

#### Certificate Submission
- ✅ Submit external course certificates
- ✅ Upload certificate files
- ✅ Provide course details
- ✅ Track submission status
- ✅ View faculty feedback
- ✅ Grade tracking

#### Workshop Enrollment
- ✅ Browse available workshops
- ✅ Enroll in workshops
- ✅ View workshop details
- ✅ Track enrollment status
- ✅ Workshop completion tracking
- ✅ Feedback submission

#### Course Enrollment
- ✅ Browse available courses
- ✅ Enroll in courses
- ✅ View course materials
- ✅ Submit assignments
- ✅ Track grades and attendance
- ✅ View course progress

#### Mentor Talk Registration
- ✅ View scheduled mentor talks
- ✅ Register for talks
- ✅ View speaker details
- ✅ Access meeting links
- ✅ Provide feedback and ratings
- ✅ Track attendance

#### Analytics Dashboard
- ✅ Performance trends over time
- ✅ Category-wise performance
- ✅ Quiz history and scores
- ✅ Code test results
- ✅ Learning progress visualization
- ✅ Weak and strong areas identification
- ✅ Comparative analytics

#### Messaging & Notifications
- ✅ Receive messages from faculty
- ✅ Real-time notifications
- ✅ Message inbox with filters
- ✅ Priority-based message display
- ✅ Read/unread status
- ✅ Notification center
- ✅ Message search

---

## 6. User Roles & Permissions

### 6.1 Admin Role

**Access Level**: Full system access

**Permissions**:
- ✅ Create, read, update, delete all entities
- ✅ Manage colleges and departments
- ✅ Manage all users (faculty and students)
- ✅ Configure faculty assignments
- ✅ Manage career paths
- ✅ System configuration
- ✅ View all analytics and reports
- ✅ Bulk operations
- ✅ User provisioning

**Routes**:
```
/admin/*
├── /admin/college
├── /admin/departments
├── /admin/faculty
├── /admin/students
├── /admin/career-paths
├── /admin/user-management
└── /admin/provision-accounts
```

### 6.2 Faculty Role

**Access Level**: Department and assignment-based access

**Permissions**:
- ✅ View assigned students based on:
  - Department
  - Year assignments
  - Career path assignments
- ✅ CRUD operations on assigned students
- ✅ Create and manage roadmaps
- ✅ Create and assign learning resources
- ✅ Manage courses and workshops
- ✅ Evaluate certificates
- ✅ Send messages to students
- ✅ View student performance analytics
- ✅ Create mentor talks

**Assignment Logic**:
```typescript
Student visible to Faculty IF:
  student.department === faculty.department
  AND
  (faculty.assignedYears.isEmpty() OR student.year IN faculty.assignedYears)
  AND
  (faculty.careerPaths.isEmpty() OR student.careerPaths INTERSECTS faculty.careerPaths)
```

**Routes**:
```
/faculty/*
├── /faculty/dashboard
├── /faculty/students
├── /faculty/roadmap-creator
├── /faculty/roadmap-management
├── /faculty/learning-management
├── /faculty/course-management
├── /faculty/workshop-management
├── /faculty/mentor-talks
├── /faculty/certificate-evaluation
└── /faculty/messaging
```

### 6.3 Student Role

**Access Level**: Personal data and assigned content

**Permissions**:
- ✅ View personal profile and career paths
- ✅ Take daily quizzes
- ✅ Access assigned roadmaps
- ✅ View and access learning resources
- ✅ Execute code and take code tests
- ✅ Submit certificates
- ✅ Enroll in courses and workshops
- ✅ Register for mentor talks
- ✅ View messages and notifications
- ✅ View personal analytics

**Routes**:
```
/student/*
├── /student/career-dashboard
├── /student/daily-quiz
├── /student/code-execution
├── /student/code-test
├── /student/roadmap
├── /student/courses
├── /student/workshops
├── /student/mentor-talks
├── /student/certificate-submission
├── /student/analytics
└── /student/messages
```

### 6.4 Role-Based Access Control (RBAC)

```typescript
// Permission Matrix
const rolePermissions = {
  admin: {
    college: ['create', 'read', 'update', 'delete'],
    department: ['create', 'read', 'update', 'delete'],
    faculty: ['create', 'read', 'update', 'delete'],
    student: ['create', 'read', 'update', 'delete'],
    careerPath: ['create', 'read', 'update', 'delete'],
    analytics: ['read']
  },
  faculty: {
    student: ['read', 'update'],
    roadmap: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    workshop: ['create', 'read', 'update', 'delete'],
    message: ['create', 'read'],
    certificate: ['read', 'update'],
    analytics: ['read']
  },
  student: {
    profile: ['read', 'update'],
    quiz: ['read', 'create'],
    code: ['create', 'read'],
    certificate: ['create', 'read'],
    course: ['read'],
    workshop: ['read'],
    message: ['read'],
    analytics: ['read']
  }
}
```


---

## 7. Database Architecture

### 7.1 Database Overview

**Database Type**: PostgreSQL  
**ORM**: Prisma 6.16.3  
**Total Tables**: 42  
**Character Set**: UTF-8  
**Normalization Level**: 3NF (Third Normal Form)

### 7.2 Core Tables

#### College
- **Purpose**: Stores information about educational institutions
- **Key Fields**: id, name
- **Relationships**: One-to-Many with Department

#### Department
- **Purpose**: Stores department information within colleges
- **Key Fields**: id, name, description, collegeId
- **Relationships**: 
  - Many-to-One with College
  - One-to-Many with Faculty, Student, User

#### User
- **Purpose**: Base authentication table for all user types
- **Key Fields**: id, email, password, role, firstName, lastName, departmentId
- **Roles**: admin, faculty, student
- **Security**: Passwords hashed with bcrypt (10 rounds)

#### Faculty
- **Purpose**: Faculty-specific information and assignment configurations
- **Key Fields**: id, email, name, gender, departmentId, assignedYears, canAssignCrossDepartment
- **Assignment Logic**: 
  - assignedYears: NULL/empty = all years, otherwise specific years
  - canAssignCrossDepartment: Allows managing students from other departments

#### Student
- **Purpose**: Student-specific information and academic details
- **Key Fields**: id, email, name, gender, departmentId, year, registerNumber, favoriteLanguage
- **Relationships**: 20+ relationships with various tables

### 7.3 Career Path Tables

#### CareerPath
- **Purpose**: Defines available career paths
- **Key Fields**: id, name, description

#### StudentCareerPath
- **Purpose**: Junction table linking students to career paths
- **Key Fields**: id, studentId, careerPathId, assignedBy, assignedAt
- **Business Rules**: 
  - A student can have multiple career paths
  - Same career path cannot be assigned twice to same student

#### FacultyCareerPath
- **Purpose**: Junction table linking faculty to career path specializations
- **Key Fields**: id, facultyId, careerPathId, assignedAt

### 7.4 Assessment & Quiz Tables

#### AdaptiveQuiz
- **Purpose**: Stores daily adaptive quiz instances
- **Key Fields**: id, studentId, quizDate, questions (JSON), performanceData (JSON), isCompleted, totalAttempts, bestScore
- **Business Rules**: 
  - One quiz per student per day
  - Maximum 2 attempts allowed
  - 20 questions per quiz

#### QuizAttempt
- **Purpose**: Records individual quiz attempts
- **Key Fields**: id, adaptiveQuizId, studentId, attemptNumber, answers (JSON), score, correctAnswers, timeSpent, feedback (JSON)

#### StudentPerformance
- **Purpose**: Tracks student performance metrics by category
- **Key Fields**: id, studentId, category, knowledgeLevel (1-5), totalAttempts, correctAttempts, weakAreas, strongAreas

### 7.5 Roadmap & Learning Tables

#### Roadmap
- **Purpose**: Stores learning roadmaps
- **Key Fields**: id, title, description, totalDuration, year, careerPath, department, milestones (JSON), learningPath, careerOutcomes (JSON), isAIGenerated

#### RoadmapAssignment
- **Purpose**: Assigns roadmaps to students
- **Key Fields**: id, roadmapId, studentId, assignedBy, assignedAt, isActive, progress, completedAt

#### LearningResource
- **Purpose**: Stores learning resources
- **Key Fields**: id, title, description, url, category, difficulty, careerPath, roadmapId

#### StudentResourceAccess
- **Purpose**: Tracks student access to resources
- **Key Fields**: id, studentId, resourceId, accessedAt, isCompleted, rating

### 7.6 Code Execution Tables

#### CodeTestSession
- **Purpose**: Stores code testing sessions
- **Key Fields**: id, studentId, sessionDate, language, languageId, totalQuestions, questions (JSON), totalScore, maxScore, timeSpent

#### CodeTestQuestionResult
- **Purpose**: Stores results for individual code test questions
- **Key Fields**: id, sessionId, questionId, questionTitle, studentCode, score, passedTests, totalTests, testResults (JSON)

#### CodeExecutionHistory
- **Purpose**: Tracks all code executions
- **Key Fields**: id, studentId, language, languageId, code, input, output, status, executionTime, memoryUsed, errorMessage

### 7.7 Communication Tables

#### Message
- **Purpose**: Stores messages between faculty and students
- **Key Fields**: id, senderId, recipientIds, subject, content, messageType, priority, isBroadcast, isRead, roomId, replyToId

#### MessageRead
- **Purpose**: Tracks message read status
- **Key Fields**: id, messageId, userId, readAt

#### MessageRoom
- **Purpose**: Stores chat rooms/channels
- **Key Fields**: id, name, description, roomType, createdBy, isActive

#### MessageRoomMember
- **Purpose**: Tracks room membership
- **Key Fields**: id, roomId, userId, userRole, joinedAt

### 7.8 Course & Workshop Tables

#### Workshop
- **Purpose**: Stores workshop information
- **Key Fields**: id, title, description, instructor, duration, level, category, maxParticipants, status, startDate, endDate, isMandatory

#### WorkshopEnrollment
- **Purpose**: Tracks student enrollment in workshops
- **Key Fields**: id, workshopId, studentId, enrolledAt, status, completedAt

#### Course
- **Purpose**: Stores course information
- **Key Fields**: id, title, description, instructor, duration, level, category, maxStudents, status, startDate, endDate, courseType, isMandatory

#### CourseEnrollment
- **Purpose**: Tracks student enrollment in courses
- **Key Fields**: id, courseId, studentId, enrolledAt, status, grade, attendance, assignmentsCompleted

#### Assignment
- **Purpose**: Stores course assignments
- **Key Fields**: id, courseId, title, description, dueDate, maxPoints, isMandatory, submissionType

#### AssignmentSubmission
- **Purpose**: Tracks student assignment submissions
- **Key Fields**: id, assignmentId, studentId, submittedAt, status, grade, feedback, fileUrl

### 7.9 Mentorship Tables

#### MentorTalk
- **Purpose**: Stores mentor talk/session information
- **Key Fields**: id, title, speakerName, company, designation, topic, scheduledDate, scheduledTime, mode, meetingLink, venue, maxAttendees, status

#### MentorTalkAttendance
- **Purpose**: Tracks student attendance in mentor talks
- **Key Fields**: id, talkId, studentId, attendedAt, status

#### MentorTalkFeedback
- **Purpose**: Stores student feedback for mentor talks
- **Key Fields**: id, talkId, studentId, rating (1-5), feedback, submittedAt

### 7.10 Notification & AI Tables

#### Notification
- **Purpose**: Stores notifications for students
- **Key Fields**: id, studentId, title, message, type, isRead, priority, actionUrl, metadata (JSON), expiresAt

#### AISuggestion
- **Purpose**: Stores AI-generated suggestions
- **Key Fields**: id, studentId, title, description, duration, difficulty, skills (JSON), savedAt

#### CertificateSubmission
- **Purpose**: Stores student certificate submissions
- **Key Fields**: id, studentId, courseName, courseProvider, completionDate, certificateFile, status, evaluatedBy, facultyComments, grade

### 7.11 Database Relationships Summary

**One-to-Many Relationships**: 70+
- College → Department
- Department → Faculty, Student, User
- Faculty → Multiple tables (Messages, Workshops, Courses, etc.)
- Student → 20+ tables (Quizzes, Code Tests, Enrollments, etc.)

**Many-to-Many Relationships**: 8
- Student ↔ CareerPath (via StudentCareerPath)
- Faculty ↔ CareerPath (via FacultyCareerPath)
- Student ↔ Roadmap (via RoadmapAssignment)
- Student ↔ LearningResource (via StudentResourceAccess)
- Student ↔ Workshop (via WorkshopEnrollment)
- Student ↔ Course (via CourseEnrollment)
- Course ↔ Roadmap (via CourseRoadmapAssignment)
- Student ↔ MentorTalk (via MentorTalkAttendance)

**Self-Referencing Relationships**: 1
- Message → Message (via replyToId for threaded conversations)

### 7.12 Indexing Strategy

**Primary Indexes**: 42 (one per table on id column)

**Unique Indexes**: 25+
- Email addresses (User, Faculty, Student)
- Register numbers (Student)
- Names (College, Department, CareerPath)
- Junction table combinations

**Foreign Key Indexes**: 80+
- All foreign key columns automatically indexed

**Composite Indexes**: 13
- (studentId, quizDate) for daily quiz lookups
- (studentId, careerPathId) for career path assignments
- (studentId, category) for performance tracking
- And more...

**Performance Indexes**: 30+
- Status fields (isCompleted, isActive, status)
- Date fields (createdAt, scheduledDate, dueDate)
- Type fields (messageType, priority, difficulty)

### 7.13 Data Integrity

**Cascade Rules**:
- ON DELETE CASCADE: Most parent-child relationships
- ON DELETE SET NULL: Optional relationships (assignedBy, evaluatedBy)

**Constraints**:
- NOT NULL: Essential fields
- UNIQUE: Email, register numbers, names
- CHECK: Value ranges (year 1-4, rating 1-5)
- DEFAULT: Sensible defaults for all fields


---

## 8. API Architecture

### 8.1 API Structure

```
/app/api/
├── admin/              # Admin-only endpoints
│   ├── college/
│   ├── department/
│   ├── faculty/
│   └── student/
├── faculty/            # Faculty endpoints
│   ├── assigned-students/
│   ├── roadmap/
│   ├── course/
│   ├── workshop/
│   └── certificate/
├── student/            # Student endpoints
│   ├── profile/
│   ├── daily-quiz/
│   ├── code-execution/
│   ├── code-test/
│   ├── roadmaps/
│   ├── certificate/
│   └── analytics/
├── auth/               # Authentication
│   ├── login/
│   └── register/
├── ai/                 # AI integration
│   ├── generate-quiz/
│   └── generate-roadmap/
├── code-execution/     # Code execution
│   ├── execute/
│   ├── history/
│   └── languages/
├── realtime/           # Real-time messaging
│   ├── send-message/
│   ├── messages/
│   └── rooms/
├── cron/               # Scheduled jobs
│   └── daily-quiz-reset/
├── career-path/        # Career path management
├── college/            # College management
├── department/         # Department management
└── socket/             # Socket.IO server
```

### 8.2 API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### 8.3 Authentication Flow

```typescript
// JWT-based Authentication
1. User logs in with credentials (email + password)
2. Server validates credentials against database
3. Server generates JWT token with payload:
   {
     userId: number,
     email: string,
     role: string,
     iat: timestamp,
     exp: timestamp (24 hours)
   }
4. Client stores token (localStorage/cookie)
5. Client sends token in Authorization header: "Bearer <token>"
6. Server validates token on each request
7. Server extracts user info from token
8. Server checks role-based permissions
9. Server processes request or returns 401/403
```

### 8.4 Key API Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

#### Student APIs
```
GET  /api/student/profile
GET  /api/student/daily-quiz
POST /api/student/daily-quiz
POST /api/student/code-execution
GET  /api/student/code-execution/history
GET  /api/student/roadmaps
POST /api/student/certificate
GET  /api/student/analytics
```

#### Faculty APIs
```
GET  /api/faculty/assigned-students
POST /api/faculty/roadmap
POST /api/faculty/course
POST /api/faculty/workshop
GET  /api/faculty/certificates
PUT  /api/faculty/certificate/[id]
POST /api/faculty/message
```

#### Admin APIs
```
POST /api/admin/college
POST /api/admin/department
POST /api/admin/faculty
POST /api/admin/student
POST /api/admin/career-path
GET  /api/admin/analytics
```

### 8.5 API Security

#### Request Validation
- Input sanitization
- Type checking with TypeScript
- Prisma ORM prevents SQL injection
- CORS configuration
- Rate limiting

#### Authorization Checks
```typescript
// Role-based authorization
if (user.role !== 'admin') {
  return res.status(403).json({ error: 'Unauthorized' });
}

// Department-based authorization
if (student.departmentId !== faculty.departmentId) {
  return res.status(403).json({ error: 'Access denied' });
}

// Resource ownership check
if (resource.userId !== user.userId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## 9. Frontend Architecture

### 9.1 Project Structure

```
app/
├── admin/              # Admin portal pages
│   ├── college/
│   ├── departments/
│   ├── faculty/
│   ├── students/
│   ├── career-paths/
│   └── user-management/
├── faculty/            # Faculty portal pages
│   ├── dashboard/
│   ├── students/
│   ├── roadmap-creator/
│   ├── roadmap-management/
│   ├── course-management/
│   ├── workshop-management/
│   ├── mentor-talks/
│   ├── certificate-evaluation/
│   └── messaging/
├── student/            # Student portal pages
│   ├── career-dashboard/
│   ├── daily-quiz/
│   ├── code-execution/
│   ├── code-test/
│   ├── roadmap/
│   ├── courses/
│   ├── workshops/
│   ├── mentor-talks/
│   ├── certificate-submission/
│   ├── analytics/
│   └── messages/
├── auth/               # Authentication pages
│   └── login/
├── api/                # API routes
└── layout.tsx          # Root layout

components/
├── ui/                 # Shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── admin/              # Admin-specific components
├── faculty/            # Faculty-specific components
├── student/            # Student-specific components
├── learning/           # Learning-related components
│   ├── InteractiveRoadmapVisualization.tsx
│   ├── SemesterForm.tsx
│   └── RoadmapPreview.tsx
└── shared/             # Shared components
    ├── Sidebar.tsx
    ├── Header.tsx
    └── ...

lib/
├── prisma.ts           # Prisma client
├── auth.ts             # Authentication utilities
├── gemini.ts           # AI integration
├── judge0.ts           # Code execution
└── utils.ts            # Utility functions

hooks/
├── useSocket.ts        # Socket.IO hook
├── useAuth.ts          # Authentication hook
└── useRealtimeMessaging.ts  # Real-time messaging hook
```

### 9.2 Component Architecture

#### Page Components
- Server Components by default (Next.js 15)
- Client Components marked with 'use client'
- Data fetching in Server Components
- Interactivity in Client Components

#### UI Components
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Shadcn/ui for pre-built components
- Custom components for specific features

#### State Management
- React Hooks (useState, useEffect, useContext)
- Server State with React Query (optional)
- Local State for UI interactions
- Global State with Context API

### 9.3 Routing

**App Router (Next.js 15)**:
- File-based routing
- Nested layouts
- Route groups
- Dynamic routes
- Parallel routes
- Intercepting routes

**Route Protection**:
- Middleware for authentication
- Role-based route access
- Redirect to login if unauthorized
- Redirect to appropriate dashboard after login

### 9.4 Data Fetching

**Server Components**:
```typescript
// Direct database access
async function getData() {
  const data = await prisma.student.findMany()
  return data
}

export default async function Page() {
  const data = await getData()
  return <div>{/* render data */}</div>
}
```

**Client Components**:
```typescript
// API calls with fetch/axios
'use client'

export default function Component() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])
  
  return <div>{/* render data */}</div>
}
```

### 9.5 Styling

**Tailwind CSS Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**CSS Variables**:
```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    /* ... more variables */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```


---

## 10. Security Implementation

### 10.1 Authentication

**JWT Token Security**:
- Tokens expire after 24 hours
- Secure token generation with bcrypt
- Token validation on every request
- Role-based access control
- Token stored in httpOnly cookies (recommended) or localStorage

**Password Security**:
- Passwords hashed with bcrypt (10 salt rounds)
- Plain passwords optionally stored for recovery (not recommended for production)
- Password strength requirements
- Secure password reset flow

### 10.2 Authorization

**Role-Based Access Control (RBAC)**:
```typescript
// Middleware authorization
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Role-based routing
  if (request.nextUrl.pathname.startsWith('/admin') && decoded.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  return NextResponse.next()
}
```

**Resource-Level Authorization**:
- Department-based access control
- Year-level filtering
- Career path-based visibility
- Ownership verification

### 10.3 Data Security

**Database Security**:
- Parameterized queries via Prisma (prevents SQL injection)
- Foreign key constraints
- Cascade deletes for data integrity
- Indexed queries for performance
- Connection pooling

**API Security**:
- Input validation and sanitization
- Type checking with TypeScript
- CORS configuration
- Rate limiting (recommended)
- Request size limits

**File Upload Security**:
- File type validation
- File size limits
- Secure file storage
- Access control on files
- Virus scanning (recommended)

### 10.4 Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

---

## 11. AI Integration

### 11.1 Google Gemini AI

**Configuration**:
```env
llm_api_key=your-gemini-api-key
llm_model=gemini-2.0-flash
llm_api_url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

**Features**:
- Daily quiz generation (20 questions)
- Learning roadmap creation
- Personalized content generation
- Adaptive difficulty adjustment
- Career path recommendations

### 11.2 Daily Quiz Generation

**Process**:
1. Analyze student's career path
2. Assess current learning level
3. Generate 20 personalized questions
4. Mix difficulty levels (8 Easy, 8 Medium, 4 Hard)
5. Include detailed explanations
6. Store in database

**Question Structure**:
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

### 11.3 Roadmap Generation

**Process**:
1. Analyze career path requirements
2. Assess student's current level
3. Generate week-by-week learning plan
4. Define milestones and deliverables
5. Recommend resources
6. Set expected outcomes

**Roadmap Structure**:
```typescript
interface Roadmap {
  title: string;
  description: string;
  totalDuration: string;
  careerPath: string;
  studentLevel: string;
  milestones: Milestone[];
  learningPath: string;
  careerOutcomes: string[];
}
```

---

## 12. Real-time Communication

### 12.1 Socket.IO Implementation

**Server Configuration**:
```typescript
// pages/api/socket.ts
const io = new SocketIOServer(res.socket.server, {
  path: '/api/socket',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
```

**Authentication**:
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return next(new Error('Authentication error'))
  }
  
  socket.data.user = decoded
  next()
})
```

### 12.2 Socket Events

**Client to Server**:
- `authenticate` - Authenticate user
- `join_room` - Join a messaging room
- `leave_room` - Leave a room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

**Server to Client**:
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `new_message` - New message received
- `notification` - Push notification
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `user_joined` - User joined room
- `user_left` - User left room

### 12.3 Real-time Features

**Messaging**:
- Instant message delivery
- Typing indicators
- Read receipts
- Message threading
- Room-based conversations
- Broadcast messages

**Notifications**:
- Real-time push notifications
- Priority-based alerts
- Action URLs
- Notification center
- Read/unread status

---

## 13. Code Execution System

### 13.1 Judge0 Integration

**Configuration**:
```env
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-api-key
```

**Supported Languages**: 70+
- C, C++, Java, Python, JavaScript, TypeScript
- Go, Rust, Ruby, PHP, Swift, Kotlin
- And 60+ more languages

### 13.2 Code Execution Flow

```typescript
// Execution Process
1. Student writes code in Monaco Editor
2. Select language and provide input
3. Submit to Judge0 API
4. Poll for execution results
5. Display output, errors, and metrics
6. Store in execution history
```

### 13.3 Code Testing System

**Features**:
- 5 questions per test session
- Multiple test cases per question
- Automatic scoring (5 marks per question)
- Detailed test results
- Hint system
- Time tracking
- Performance analytics

**Test Flow**:
```typescript
1. Generate 5 coding questions
2. Student solves each question
3. Run against multiple test cases
4. Calculate score based on passed tests
5. Provide detailed feedback
6. Store results and analytics
```

---

## 14. Deployment Guide

### 14.1 Environment Setup

**Required Environment Variables**:
```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-secret-key"

# AI Integration
llm_api_key="your-gemini-api-key"
llm_model="gemini-2.0-flash"
llm_api_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Code Execution
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"

# Real-time
NEXT_PUBLIC_SOCKET_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Cron Jobs
CRON_SECRET="your-cron-secret"
```

### 14.2 Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Open Prisma Studio (development)
npx prisma studio
```

### 14.3 Vercel Deployment

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
vercel
```

**Step 3: Configure Environment Variables**
- Go to Vercel Dashboard
- Navigate to Project Settings → Environment Variables
- Add all required environment variables

**Step 4: Setup Cron Jobs**
Create `vercel.json`:
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

### 14.4 Alternative Deployment Options

**Docker Deployment**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Traditional Server**:
```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "nexuspath" -- start
```

### 14.5 Cron Job Setup

**Option 1: Vercel Cron** (Recommended)
- Configured in `vercel.json`
- Automatic execution
- No additional setup required

**Option 2: GitHub Actions**
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

**Option 3: Traditional Cron**
```bash
# Add to crontab
0 0 * * * curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \
  -H "Authorization: Bearer your-cron-secret"
```


---

## 15. User Guides

### 15.1 Admin Quick Start

**Initial Setup**:
1. Create colleges
2. Create departments under colleges
3. Create faculty members
4. Create students
5. Create career paths
6. Assign career paths to students
7. Configure faculty assignments

**Faculty Assignment Configuration**:
```
1. Navigate to /admin/faculty
2. Find faculty member
3. Click "Configure Assignments"
4. Set:
   - Assigned Years (optional: 1, 2, 3, 4 or leave empty for all)
   - Career Paths (optional: select specific paths or leave empty for all)
   - Cross-department permissions (optional)
5. Save configuration
```

**Student Visibility Logic**:
```
Student visible to Faculty IF:
  ✓ student.department === faculty.department
  AND
  ✓ (faculty.assignedYears is empty OR student.year IN faculty.assignedYears)
  AND
  ✓ (faculty.careerPaths is empty OR student has at least one matching career path)
```

### 15.2 Faculty Quick Start

**Dashboard Overview**:
- View assigned students
- See performance metrics
- Quick actions
- Recent activity

**Student Management**:
1. Navigate to /faculty/students
2. View students based on your assignments
3. Filter by year or career path
4. Manage student information
5. Track performance

**Roadmap Creation**:
1. Navigate to /faculty/roadmap-creator
2. Choose Manual or AI Generation
3. Fill in roadmap details
4. Add semesters and activities
5. Preview and save
6. Assign to students

**Course Management**:
1. Navigate to /faculty/course-management
2. Create new course
3. Set schedule and details
4. Manage enrollments
5. Create assignments
6. Track student progress

### 15.3 Student Quick Start

**Daily Routine**:
1. Login to student portal
2. Check dashboard for updates
3. Take daily quiz (20 questions, 2 attempts)
4. Review feedback and explanations
5. Practice code execution
6. Check messages and notifications

**Career Path Tracking**:
1. Navigate to /student/career-dashboard
2. View assigned career paths
3. Track progress
4. Access learning resources
5. View roadmaps

**Code Practice**:
1. Navigate to /student/code-execution
2. Select programming language
3. Write code in Monaco Editor
4. Provide input (optional)
5. Execute and view results
6. Review execution history

**Code Testing**:
1. Navigate to /student/code-test
2. Start new test session
3. Solve 5 coding questions
4. Run against test cases
5. View detailed results
6. Track performance

---

## 16. Development Guide

### 16.1 Local Development Setup

**Prerequisites**:
- Node.js 18+ installed
- PostgreSQL database
- Git

**Setup Steps**:
```bash
# Clone repository
git clone <repository-url>
cd nexuspath

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

### 16.2 Development Workflow

**Branch Strategy**:
```
main          - Production-ready code
develop       - Development branch
feature/*     - Feature branches
bugfix/*      - Bug fix branches
hotfix/*      - Urgent fixes
```

**Commit Convention**:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

### 16.3 Code Structure Guidelines

**Component Structure**:
```typescript
// components/ComponentName.tsx
'use client' // If client component

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentNameProps {
  prop1: string
  prop2?: number
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const [state, setState] = useState()
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

**API Route Structure**:
```typescript
// app/api/route-name/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Authorization
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // 3. Business Logic
    const data = await prisma.model.findMany()
    
    // 4. Response
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 16.4 Database Migrations

**Create Migration**:
```bash
npx prisma migrate dev --name migration_name
```

**Apply Migrations**:
```bash
npx prisma migrate deploy
```

**Reset Database**:
```bash
npx prisma migrate reset
```

**Generate Prisma Client**:
```bash
npx prisma generate
```

### 16.5 Testing

**Unit Tests** (Recommended):
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Integration Tests** (Recommended):
```bash
npm install --save-dev cypress
```

**API Testing**:
- Use Postman or Thunder Client
- Test all endpoints
- Verify authentication and authorization
- Check error handling

---

## 17. Testing & Quality Assurance

### 17.1 Testing Strategy

**Unit Testing**:
- Test individual components
- Test utility functions
- Test API route handlers
- Test database queries

**Integration Testing**:
- Test user flows
- Test API integrations
- Test database operations
- Test real-time features

**End-to-End Testing**:
- Test complete user journeys
- Test cross-role interactions
- Test critical paths
- Test error scenarios

### 17.2 Manual Testing Checklist

**Authentication**:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token expiration handling
- [ ] Role-based redirects
- [ ] Logout functionality

**Admin Portal**:
- [ ] Create college
- [ ] Create department
- [ ] Create faculty
- [ ] Create student
- [ ] Create career path
- [ ] Assign career paths
- [ ] Configure faculty assignments
- [ ] Bulk operations

**Faculty Portal**:
- [ ] View assigned students
- [ ] Filter students
- [ ] Create roadmap (manual)
- [ ] Create roadmap (AI)
- [ ] Create course
- [ ] Create workshop
- [ ] Evaluate certificate
- [ ] Send message

**Student Portal**:
- [ ] Take daily quiz
- [ ] Retry quiz (second attempt)
- [ ] Execute code
- [ ] Take code test
- [ ] View roadmap
- [ ] Enroll in course
- [ ] Enroll in workshop
- [ ] Submit certificate
- [ ] View analytics

**Real-time Features**:
- [ ] Send message
- [ ] Receive message
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Notifications

### 17.3 Performance Testing

**Metrics to Monitor**:
- Page load time
- API response time
- Database query time
- Real-time latency
- Memory usage
- CPU usage

**Tools**:
- Lighthouse (Chrome DevTools)
- WebPageTest
- New Relic (optional)
- Datadog (optional)

---

## 18. Performance Optimization

### 18.1 Database Optimization

**Indexing**:
- Index foreign keys
- Index frequently queried fields
- Composite indexes for complex queries
- Regular index maintenance

**Query Optimization**:
- Use Prisma's `select` to fetch only needed fields
- Use `include` judiciously
- Implement pagination
- Use database views for complex queries

**Connection Pooling**:
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
})
```

### 18.2 Frontend Optimization

**Code Splitting**:
- Next.js automatic code splitting
- Dynamic imports for large components
- Lazy loading for routes

**Image Optimization**:
```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

**Caching**:
- Browser caching
- API response caching
- Static page generation
- Incremental static regeneration

### 18.3 API Optimization

**Response Caching**:
```typescript
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

**Pagination**:
```typescript
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')
const skip = (page - 1) * limit

const data = await prisma.model.findMany({
  skip,
  take: limit
})
```

**Rate Limiting** (Recommended):
```typescript
// Implement rate limiting middleware
// Use libraries like express-rate-limit or upstash/ratelimit
```

---

## 19. Troubleshooting

### 19.1 Common Issues

**Database Connection Issues**:
```
Error: Can't reach database server
Solution:
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Check network connectivity
4. Verify database credentials
```

**Prisma Client Issues**:
```
Error: @prisma/client did not initialize yet
Solution:
1. Run: npx prisma generate
2. Restart development server
3. Clear node_modules and reinstall
```

**Socket.IO Connection Issues**:
```
Error: WebSocket connection failed
Solution:
1. Check NEXT_PUBLIC_SOCKET_URL
2. Verify Socket.IO server is running
3. Check CORS configuration
4. Check firewall settings
```

**JWT Token Issues**:
```
Error: Invalid token
Solution:
1. Check JWT_SECRET in .env
2. Verify token expiration
3. Check token format
4. Clear browser storage and re-login
```

### 19.2 Debug Mode

**Enable Prisma Logging**:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

**Enable Socket.IO Debugging**:
```env
DEBUG=socket.io:*
```

**Next.js Debug Mode**:
```bash
NODE_OPTIONS='--inspect' npm run dev
```

### 19.3 Error Logs

**Check Logs**:
- Browser console for frontend errors
- Terminal for server errors
- Vercel logs for production errors
- Database logs for query errors

**Common Error Patterns**:
```
401 Unauthorized - Authentication issue
403 Forbidden - Authorization issue
404 Not Found - Route or resource not found
500 Internal Server Error - Server-side error
```


---

## 20. Future Roadmap

### 20.1 Short-term Enhancements (3-6 months)

**Mobile Application**:
- [ ] React Native mobile app
- [ ] iOS and Android support
- [ ] Push notifications
- [ ] Offline mode

**Advanced Analytics**:
- [ ] Predictive analytics
- [ ] Student success prediction
- [ ] Learning pattern analysis
- [ ] Comparative analytics

**Gamification**:
- [ ] Badges and achievements
- [ ] Leaderboards
- [ ] Streak tracking
- [ ] Reward system

**Communication**:
- [ ] Video conferencing integration
- [ ] Voice messages
- [ ] File sharing in messages
- [ ] Message reactions

**Content Management**:
- [ ] Advanced search
- [ ] Content recommendations
- [ ] Resource library
- [ ] Content versioning

### 20.2 Medium-term Enhancements (6-12 months)

**Machine Learning**:
- [ ] Personalized learning paths
- [ ] Adaptive difficulty
- [ ] Content recommendations
- [ ] Performance prediction

**Collaboration**:
- [ ] Peer-to-peer mentoring
- [ ] Study groups
- [ ] Collaborative projects
- [ ] Discussion forums

**Integration**:
- [ ] LMS integration (Moodle, Canvas)
- [ ] Calendar integration (Google, Outlook)
- [ ] Video platform integration (Zoom, Teams)
- [ ] GitHub integration

**Assessment**:
- [ ] Advanced code plagiarism detection
- [ ] Automated essay grading
- [ ] Peer review system
- [ ] Proctored exams

**Reporting**:
- [ ] Custom report builder
- [ ] Export to PDF/Excel
- [ ] Scheduled reports
- [ ] Data visualization

### 20.3 Long-term Vision (12+ months)

**AI Tutoring**:
- [ ] Conversational AI tutor
- [ ] Personalized explanations
- [ ] Doubt resolution
- [ ] Learning assistance

**Virtual Classroom**:
- [ ] Live classes
- [ ] Interactive whiteboard
- [ ] Screen sharing
- [ ] Breakout rooms

**Industry Integration**:
- [ ] Job board integration
- [ ] Internship matching
- [ ] Industry projects
- [ ] Career counseling

**Blockchain**:
- [ ] Blockchain-based certificates
- [ ] Credential verification
- [ ] Immutable records
- [ ] Smart contracts

**AR/VR**:
- [ ] Virtual labs
- [ ] 3D visualizations
- [ ] Immersive learning
- [ ] Virtual campus

**Global Features**:
- [ ] Multi-language support (i18n)
- [ ] Multi-currency support
- [ ] Regional customization
- [ ] Global marketplace

### 20.4 Technical Improvements

**Performance**:
- [ ] Redis caching layer
- [ ] CDN integration
- [ ] Database sharding
- [ ] Microservices architecture
- [ ] GraphQL API option

**Security**:
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, GitHub, Microsoft)
- [ ] Advanced audit logging
- [ ] Penetration testing
- [ ] GDPR compliance features
- [ ] SOC 2 compliance

**DevOps**:
- [ ] CI/CD pipeline
- [ ] Automated testing suite
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Monitoring and alerting
- [ ] Auto-scaling

**Infrastructure**:
- [ ] Multi-region deployment
- [ ] Disaster recovery
- [ ] Backup automation
- [ ] Load balancing
- [ ] High availability

---

## 21. Appendices

### 21.1 Glossary

**Terms**:
- **LMS**: Learning Management System
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **RBAC**: Role-Based Access Control
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **SSR**: Server-Side Rendering
- **CSR**: Client-Side Rendering
- **WebSocket**: Full-duplex communication protocol
- **Prisma**: Modern database toolkit and ORM

### 21.2 References

**Documentation**:
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Prisma: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs
- Socket.IO: https://socket.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

**External Services**:
- Google Gemini AI: https://ai.google.dev
- Judge0: https://judge0.com
- Vercel: https://vercel.com/docs

### 21.3 Related Documentation

**Project Documentation**:
- `README.md` - Project overview
- `QUICK_START_GUIDE.md` - Quick start guide
- `DAILY_QUIZ_SYSTEM.md` - Daily quiz system documentation
- `REALTIME_MESSAGING_GUIDE.md` - Real-time messaging guide
- `ROADMAP_CREATOR_GUIDE.md` - Roadmap creator guide
- `FACULTY_ASSIGNMENT_SYSTEM.md` - Faculty assignment system
- `FACULTY_STUDENT_MANAGEMENT.md` - Faculty-student management
- `DATABASE_DOCUMENTATION_COMPLETE.md` - Complete database documentation
- `TECHNICAL_DOCUMENTATION.md` - Technical implementation details

### 21.4 Support & Contact

**Technical Support**:
- Create an issue in the project repository
- Contact the development team
- Check the documentation wiki
- Join the community forum

**Bug Reports**:
- Use GitHub Issues
- Provide detailed description
- Include steps to reproduce
- Attach screenshots/logs

**Feature Requests**:
- Submit via GitHub Issues
- Describe the feature
- Explain the use case
- Provide examples

---

## 22. Conclusion

### 22.1 Project Summary

NexusPath is a comprehensive, AI-powered Learning Management System that successfully addresses the challenges of modern education through:

✅ **Personalized Learning**: AI-driven content generation and adaptive assessments  
✅ **Real-time Interaction**: Socket.IO-based communication with instant notifications  
✅ **Comprehensive Assessment**: Daily quizzes, code execution, and performance tracking  
✅ **Career Guidance**: Dynamic career path management and roadmap creation  
✅ **Scalable Architecture**: Built with modern technologies for enterprise deployment  
✅ **User-Centric Design**: Intuitive interfaces for all user roles  
✅ **Industry Alignment**: Focus on practical skills and career readiness

### 22.2 Key Achievements

**Technical Excellence**:
- ✅ 42+ database tables with complex relationships
- ✅ 100+ API endpoints
- ✅ Real-time communication infrastructure
- ✅ AI integration for personalized learning
- ✅ Code execution supporting 70+ languages
- ✅ Comprehensive security implementation
- ✅ Responsive and accessible UI

**Feature Completeness**:
- ✅ Admin portal with full system management
- ✅ Faculty portal with student management and content creation
- ✅ Student portal with learning, assessment, and tracking
- ✅ Real-time messaging and notifications
- ✅ Daily quiz system with AI generation
- ✅ Code execution and testing environment
- ✅ Roadmap creator with AI assistance
- ✅ Certificate evaluation system
- ✅ Course and workshop management
- ✅ Mentor talk scheduling
- ✅ Comprehensive analytics

### 22.3 Impact

**For Students**:
- Personalized learning experiences
- Continuous skill assessment
- Career path guidance
- Real-time faculty support
- Performance insights

**For Faculty**:
- Efficient student management
- Automated content generation
- Real-time communication
- Performance analytics
- Reduced administrative burden

**For Institutions**:
- Comprehensive learning management
- Scalable infrastructure
- Data-driven insights
- Industry-aligned curriculum
- Improved student outcomes

### 22.4 Next Steps

**Immediate Actions**:
1. ✅ Review complete documentation
2. ✅ Set up development environment
3. ✅ Configure database and services
4. ✅ Test all features
5. ✅ Deploy to production
6. ✅ Train users
7. ✅ Monitor and optimize

**Ongoing Activities**:
- Regular updates and maintenance
- Feature enhancements based on feedback
- Performance optimization
- Security audits
- User training and support
- Documentation updates

---

## 23. License & Credits

### 23.1 License

**Proprietary Software**  
© 2025 NexusPath. All rights reserved.

This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

### 23.2 Credits

**Development Team**:
- Project Lead: [Name]
- Backend Development: [Name]
- Frontend Development: [Name]
- UI/UX Design: [Name]
- Database Architecture: [Name]
- DevOps: [Name]

**Technologies Used**:
- Next.js by Vercel
- React by Meta
- Prisma by Prisma Data
- PostgreSQL by PostgreSQL Global Development Group
- Socket.IO by Automattic
- Google Gemini AI by Google
- Judge0 by Judge0
- Tailwind CSS by Tailwind Labs
- Radix UI by WorkOS
- And many other open-source libraries

### 23.3 Acknowledgments

Special thanks to:
- The open-source community
- All contributors and testers
- Educational institutions providing feedback
- Students and faculty using the platform

---

## 24. Document Information

**Document Title**: NexusPath - Complete Project Documentation  
**Version**: 1.0.0  
**Last Updated**: November 7, 2025  
**Status**: Production Ready  
**Author**: NexusPath Development Team  
**Reviewed By**: [Name]  
**Approved By**: [Name]

**Revision History**:
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Nov 7, 2025 | Dev Team | Initial complete documentation |

**Document Purpose**:
This document serves as the comprehensive reference for the NexusPath Learning Management System, covering all aspects of the system including architecture, features, deployment, and usage.

**Target Audience**:
- Developers
- System Administrators
- Project Managers
- Faculty Members
- Students
- Stakeholders

**Document Maintenance**:
This document should be updated whenever:
- New features are added
- Architecture changes are made
- Deployment procedures change
- Security updates are implemented
- User feedback requires clarification

---

**End of Documentation**

For questions, support, or contributions, please contact the development team or refer to the project repository.

**Thank you for using NexusPath!** 🎓✨

