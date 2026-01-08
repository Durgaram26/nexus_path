# NexusPath - Technical Documentation
## Comprehensive Technical Implementation Guide

---

## 📋 Table of Contents

1. [Technical Architecture](#1-technical-architecture)
2. [Technology Stack Deep Dive](#2-technology-stack-deep-dive)
3. [Database Architecture](#3-database-architecture)
4. [API Implementation](#4-api-implementation)
5. [Authentication & Security](#5-authentication--security)
6. [Real-time Communication](#6-real-time-communication)
7. [AI Integration](#7-ai-integration)
8. [Code Execution System](#8-code-execution-system)
9. [Frontend Architecture](#9-frontend-architecture)
10. [State Management](#10-state-management)
11. [Performance Optimization](#11-performance-optimization)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Development Workflow](#14-development-workflow)
15. [Code Examples](#15-code-examples)

---

## 1. Technical Architecture

### 1.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router (React 19)                        │  │
│  │  ├── /app/admin/*      - Admin Portal                    │  │
│  │  ├── /app/faculty/*    - Faculty Portal                  │  │
│  │  ├── /app/student/*    - Student Portal                  │  │
│  │  └── /app/lms/*        - LMS Features                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UI Components (Radix UI + Tailwind CSS)                 │  │
│  │  ├── Shadcn/ui Components                                │  │
│  │  ├── Custom Components                                   │  │
│  │  └── Monaco Editor Integration                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (/app/api/*)                         │  │
│  │  ├── REST API Endpoints                                  │  │
│  │  ├── Socket.IO Server                                    │  │
│  │  └── Middleware (Auth, CORS, Rate Limiting)             │  │
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
│  │  ├── 40+ Tables                                           │  │
│  │  ├── Complex Relationships                               │  │
│  │  ├── Indexes & Constraints                               │  │
│  │  └── Cascade Operations                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow Architecture

```typescript
// Typical Request Flow
Client Request
    ↓
Next.js Middleware (if applicable)
    ↓
API Route Handler (/app/api/*/route.ts)
    ↓
Authentication Verification (JWT)
    ↓
Authorization Check (Role-based)
    ↓
Input Validation & Sanitization
    ↓
Business Logic Layer
    ↓
Prisma ORM Query
    ↓
PostgreSQL Database
    ↓
Response Formatting
    ↓
Client Response (JSON)
```



### 1.3 Microservices Architecture Pattern

```typescript
// Service-Oriented Architecture
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                      │
│              (Next.js API Routes)                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────┬────────────┐
│   Auth       │   Student    │   Faculty    │   Admin    │
│   Service    │   Service    │   Service    │   Service  │
└──────────────┴──────────────┴──────────────┴────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────┬────────────┐
│   Quiz       │   Code       │   Messaging  │   AI       │
│   Service    │   Execution  │   Service    │   Service  │
└──────────────┴──────────────┴──────────────┴────────────┘
```

---

## 2. Technology Stack Deep Dive

### 2.1 Frontend Technologies

#### Next.js 15.5.4 Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}

module.exports = nextConfig
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
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

### 2.2 Backend Technologies

#### Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Prisma Client Initialization
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### 2.3 Package Dependencies

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@prisma/client": "^6.16.3",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@types/jsonwebtoken": "^9.0.10",
    "axios": "^1.12.2",
    "bcrypt": "^6.0.0",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "html2canvas": "^1.4.1",
    "jsonwebtoken": "^9.0.2",
    "jspdf": "^3.0.3",
    "lucide-react": "^0.544.0",
    "next": "15.5.4",
    "next-themes": "^0.4.6",
    "pdfjs-dist": "^5.4.296",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-pdf": "^10.2.0",
    "recharts": "^3.2.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/bcrypt": "^6.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "prisma": "^6.16.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 3. Database Architecture

### 3.1 Database Schema Design Principles

#### Normalization Strategy
- **3NF (Third Normal Form)**: All tables follow 3NF principles
- **Denormalization**: Strategic denormalization for performance (e.g., storing JSON for quiz questions)
- **Indexing**: Proper indexes on foreign keys and frequently queried fields

#### Relationship Patterns
```typescript
// One-to-Many Relationships
College (1) ──→ (N) Department
Department (1) ──→ (N) Faculty
Department (1) ──→ (N) Student

// Many-to-Many Relationships (with junction tables)
Student (N) ←→ (N) CareerPath  [via StudentCareerPath]
Faculty (N) ←→ (N) CareerPath  [via FacultyCareerPath]
Student (N) ←→ (N) Workshop    [via WorkshopEnrollment]
Student (N) ←→ (N) Course      [via CourseEnrollment]

// Self-Referencing Relationships
Message (1) ──→ (N) Message  [replyTo relationship]
```

### 3.2 Key Database Models

#### User Authentication Model
```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  password     String
  plainPassword String?
  role         String    @default("student")
  firstName    String?
  lastName     String?
  departmentId Int?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @default(now()) @updatedAt
  
  department   Department? @relation(fields: [departmentId], references: [id])
  facultyAssignments StudentCareerPath[] @relation("FacultyAssignment")
  roadmaps     Roadmap[]
  roadmapAssignments RoadmapAssignment[] @relation("RoadmapAssignment")
}
```

#### Student Model with Complex Relationships
```prisma
model Student {
  id           Int        @id @default(autoincrement())
  email        String     @unique
  name         String
  gender       Gender
  phoneNumber  String?
  departmentId Int
  year         Int
  registerNumber String   @unique
  favoriteLanguage String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  // Relations (20+ relationships)
  department   Department @relation(fields: [departmentId], references: [id])
  careerPaths  StudentCareerPath[]
  performance StudentPerformance[]
  adaptiveQuizzes AdaptiveQuiz[]
  quizSessions QuizSession[]
  quizAttempts QuizAttempt[]
  roadmapAssignments RoadmapAssignment[]
  resourceAccess StudentResourceAccess[]
  codeTestSessions CodeTestSession[]
  codeExecutionHistory CodeExecutionHistory[]
  codeExecutions CodeExecution[]
  codeTestResults CodeTestResult[]
  notifications Notification[]
  aiSuggestions AISuggestion[]
  certificateSubmissions CertificateSubmission[]
  workshopEnrollments WorkshopEnrollment[]
  courseEnrollments CourseEnrollment[]
  assignmentSubmissions AssignmentSubmission[]
  mentorTalkAttendance MentorTalkAttendance[]
  mentorTalkFeedback MentorTalkFeedback[]
}
```

### 3.3 Advanced Prisma Queries

#### Complex Query with Multiple Includes
```typescript
// Fetch student with all related data
const studentWithDetails = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    department: {
      include: {
        college: true
      }
    },
    careerPaths: {
      include: {
        careerPath: true,
        assignedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    },
    performance: {
      orderBy: {
        lastAttemptedAt: 'desc'
      },
      take: 10
    },
    adaptiveQuizzes: {
      where: {
        isCompleted: true
      },
      orderBy: {
        quizDate: 'desc'
      },
      take: 5,
      include: {
        quizAttempts: true
      }
    },
    roadmapAssignments: {
      where: {
        isActive: true
      },
      include: {
        roadmap: true,
        assignedByUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    }
  }
})
```

#### Aggregation and Analytics Query
```typescript
// Get student performance analytics
const performanceAnalytics = await prisma.studentPerformance.groupBy({
  by: ['category'],
  where: {
    studentId: studentId
  },
  _avg: {
    knowledgeLevel: true
  },
  _sum: {
    totalAttempts: true,
    correctAttempts: true
  },
  _count: {
    id: true
  }
})

// Calculate success rate
const analytics = performanceAnalytics.map(item => ({
  category: item.category,
  averageKnowledge: item._avg.knowledgeLevel,
  totalAttempts: item._sum.totalAttempts,
  correctAttempts: item._sum.correctAttempts,
  successRate: (item._sum.correctAttempts / item._sum.totalAttempts) * 100
}))
```

#### Transaction for Data Consistency
```typescript
// Create student with career path assignment in transaction
const result = await prisma.$transaction(async (tx) => {
  // Create student
  const student = await tx.student.create({
    data: {
      email: studentData.email,
      name: studentData.name,
      gender: studentData.gender,
      departmentId: studentData.departmentId,
      year: studentData.year,
      registerNumber: studentData.registerNumber
    }
  })

  // Assign career path
  const careerPathAssignment = await tx.studentCareerPath.create({
    data: {
      studentId: student.id,
      careerPathId: careerPathId,
      assignedBy: facultyId
    }
  })

  // Create initial performance record
  const performance = await tx.studentPerformance.create({
    data: {
      studentId: student.id,
      category: 'General',
      knowledgeLevel: 1
    }
  })

  return { student, careerPathAssignment, performance }
})
```

### 3.4 Database Indexing Strategy

```prisma
// Indexes for performance optimization
model Student {
  @@index([departmentId])
  @@index([year])
  @@index([registerNumber])
  @@index([email])
}

model Message {
  @@index([senderId])
  @@index([roomId])
  @@index([sentAt])
  @@index([isRead])
}

model AdaptiveQuiz {
  @@index([studentId])
  @@index([quizDate])
  @@index([isCompleted])
}

model CertificateSubmission {
  @@index([status])
  @@index([studentId])
  @@index([evaluatedBy])
}
```

---

## 4. API Implementation

### 4.1 API Route Structure

```
/app/api/
├── admin/
│   ├── college/route.ts
│   ├── department/route.ts
│   ├── faculty/route.ts
│   └── student/route.ts
├── faculty/
│   ├── assigned-students/route.ts
│   ├── roadmap/route.ts
│   ├── course/route.ts
│   └── workshop/route.ts
├── student/
│   ├── profile/route.ts
│   ├── daily-quiz/route.ts
│   ├── code-execution/route.ts
│   └── roadmaps/route.ts
├── auth/
│   ├── login/route.ts
│   └── register/route.ts
├── realtime/
│   ├── send-message/route.ts
│   └── messages/route.ts
└── socket/
    └── route.ts
```

### 4.2 API Route Implementation Pattern

#### Standard API Route Template
```typescript
// app/api/student/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Extract and verify token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Verify JWT token
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 403 }
      )
    }

    // 3. Fetch data from database
    const student = await prisma.student.findUnique({
      where: { email: decoded.email },
      include: {
        department: {
          include: {
            college: true
          }
        },
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // 4. Return formatted response
    return NextResponse.json({
      success: true,
      data: student
    })

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### POST Request with Validation
```typescript
// app/api/student/code-execution/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'
import axios from 'axios'

interface CodeExecutionRequest {
  language: string
  languageId: number
  code: string
  input?: string
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body: CodeExecutionRequest = await request.json()
    
    if (!body.code || !body.languageId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, languageId' },
        { status: 400 }
      )
    }

    // 3. Get student ID
    const student = await prisma.student.findUnique({
      where: { email: decoded.email },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // 4. Execute code via Judge0 API
    const judge0Response = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions`,
      {
        source_code: Buffer.from(body.code).toString('base64'),
        language_id: body.languageId,
        stdin: body.input ? Buffer.from(body.input).toString('base64') : undefined
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    )

    const submissionToken = judge0Response.data.token

    // 5. Poll for results
    let result
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const resultResponse = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/${submissionToken}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      )

      result = resultResponse.data

      if (result.status.id > 2) {
        break
      }

      attempts++
    }

    // 6. Store execution history
    await prisma.codeExecutionHistory.create({
      data: {
        studentId: student.id,
        language: body.language,
        languageId: body.languageId,
        code: body.code,
        input: body.input,
        output: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
        status: result.status.description,
        executionTime: result.time ? parseFloat(result.time) * 1000 : null,
        memoryUsed: result.memory,
        errorMessage: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null
      }
    })

    // 7. Return results
    return NextResponse.json({
      success: true,
      data: {
        output: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
        error: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
        status: result.status.description,
        executionTime: result.time,
        memory: result.memory
      }
    })

  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json(
      { error: 'Code execution failed' },
      { status: 500 }
    )
  }
}
```



### 4.3 Error Handling Strategy

```typescript
// lib/errorHandler.ts
export class APIError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  )
}

// Usage in API routes
try {
  // API logic
} catch (error) {
  return handleAPIError(error)
}
```

### 4.4 API Response Standardization

```typescript
// lib/apiResponse.ts
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export function successResponse<T>(
  data: T,
  message?: string,
  meta?: any
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta
  })
}

export function errorResponse(
  error: string,
  statusCode: number = 400
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status: statusCode }
  )
}
```

---

## 5. Authentication & Security

### 5.1 JWT Authentication Implementation

#### Token Generation
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '24h'

export interface TokenPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

#### Login Implementation
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateToken, comparePassword } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Return user data and token
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
```

### 5.2 Role-Based Access Control (RBAC)

```typescript
// lib/rbac.ts
export enum Role {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student'
}

export interface Permission {
  resource: string
  actions: string[]
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    { resource: 'college', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'department', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'faculty', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'student', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'careerPath', actions: ['create', 'read', 'update', 'delete'] }
  ],
  [Role.FACULTY]: [
    { resource: 'student', actions: ['read', 'update'] },
    { resource: 'roadmap', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'course', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'workshop', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'message', actions: ['create', 'read'] }
  ],
  [Role.STUDENT]: [
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'quiz', actions: ['read', 'create'] },
    { resource: 'code', actions: ['create', 'read'] },
    { resource: 'certificate', actions: ['create', 'read'] },
    { resource: 'course', actions: ['read'] },
    { resource: 'workshop', actions: ['read'] }
  ]
}

export function hasPermission(
  role: Role,
  resource: string,
  action: string
): boolean {
  const permissions = rolePermissions[role]
  
  return permissions.some(
    p => p.resource === resource && p.actions.includes(action)
  )
}

export function requireRole(allowedRoles: Role[]) {
  return (decoded: TokenPayload | null) => {
    if (!decoded) {
      throw new APIError('Unauthorized', 401)
    }
    
    if (!allowedRoles.includes(decoded.role as Role)) {
      throw new APIError('Insufficient permissions', 403)
    }
    
    return decoded
  }
}
```

### 5.3 Middleware for Authentication

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/']
  
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // Extract token from cookie or header
  const token = request.cookies.get('token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Verify token
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Role-based routing
  if (path.startsWith('/admin') && decoded.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/faculty') && decoded.role !== 'faculty') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/student') && decoded.role !== 'student') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/faculty/:path*',
    '/student/:path*',
    '/api/:path*'
  ]
}
```

### 5.4 Security Best Practices

```typescript
// Security headers configuration
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
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 6. Real-time Communication

### 6.1 Socket.IO Server Implementation

```typescript
// pages/api/socket.ts
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

interface SocketResponse extends NextApiResponse {
  socket: {
    server: SocketServer
  }
}

export default function handler(req: NextApiRequest, res: SocketResponse) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...')

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    // Authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = verifyToken(token)

      if (!decoded) {
        return next(new Error('Invalid token'))
      }

      socket.data.user = decoded
      next()
    })

    // Connection handler
    io.on('connection', (socket) => {
      const user = socket.data.user
      console.log(`User connected: ${user.email} (${user.role})`)

      // Join user-specific room
      socket.join(`user:${user.userId}`)

      // Join role-specific room
      socket.join(`role:${user.role}`)

      // Handle room joining
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${user.email} joined room: ${roomId}`)
        socket.to(roomId).emit('user_joined', {
          userId: user.userId,
          email: user.email
        })
      })

      // Handle room leaving
      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId)
        console.log(`User ${user.email} left room: ${roomId}`)
        socket.to(roomId).emit('user_left', {
          userId: user.userId,
          email: user.email
        })
      })

      // Handle message sending
      socket.on('send_message', async (data) => {
        const { roomId, message, recipientIds } = data

        // Broadcast to room
        if (roomId) {
          io.to(roomId).emit('new_message', {
            ...message,
            sender: {
              id: user.userId,
              email: user.email,
              role: user.role
            },
            timestamp: new Date()
          })
        }

        // Send to specific users
        if (recipientIds && Array.isArray(recipientIds)) {
          recipientIds.forEach((recipientId: number) => {
            io.to(`user:${recipientId}`).emit('new_message', {
              ...message,
              sender: {
                id: user.userId,
                email: user.email,
                role: user.role
              },
              timestamp: new Date()
            })
          })
        }
      })

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { roomId } = data
        socket.to(roomId).emit('user_typing', {
          userId: user.userId,
          email: user.email
        })
      })

      socket.on('typing_stop', (data) => {
        const { roomId } = data
        socket.to(roomId).emit('user_stopped_typing', {
          userId: user.userId,
          email: user.email
        })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.email}`)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
```

### 6.2 Socket.IO Client Hook

```typescript
// hooks/useSocket.ts
import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketOptions {
  token: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: any) => void
  onNotification?: (notification: any) => void
}

export function useSocket(options: UseSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      auth: {
        token: options.token
      },
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      options.onConnect?.()
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
      options.onDisconnect?.()
    })

    socketInstance.on('new_message', (message) => {
      options.onMessage?.(message)
    })

    socketInstance.on('notification', (notification) => {
      options.onNotification?.(notification)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [options.token])

  const joinRoom = useCallback((roomId: string) => {
    socket?.emit('join_room', roomId)
  }, [socket])

  const leaveRoom = useCallback((roomId: string) => {
    socket?.emit('leave_room', roomId)
  }, [socket])

  const sendMessage = useCallback((data: any) => {
    socket?.emit('send_message', data)
  }, [socket])

  const startTyping = useCallback((roomId: string) => {
    socket?.emit('typing_start', { roomId })
  }, [socket])

  const stopTyping = useCallback((roomId: string) => {
    socket?.emit('typing_stop', { roomId })
  }, [socket])

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping
  }
}
```

### 6.3 Real-time Messaging Component

```typescript
// components/RealtimeChat.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  content: string
  sender: {
    id: number
    email: string
    role: string
  }
  timestamp: Date
}

interface RealtimeChatProps {
  roomId: string
  token: string
  currentUserId: number
}

export function RealtimeChat({ roomId, token, currentUserId }: RealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { isConnected, joinRoom, sendMessage, startTyping, stopTyping } = useSocket({
    token,
    onConnect: () => {
      joinRoom(roomId)
    },
    onMessage: (message: Message) => {
      setMessages(prev => [...prev, message])
      scrollToBottom()
    }
  })

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Start typing indicator
    startTyping(roomId)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId)
    }, 2000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const message = {
      roomId,
      message: {
        content: inputValue,
        type: 'text'
      }
    }

    sendMessage(message)
    setInputValue('')
    stopTyping(roomId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <div className="p-2 bg-gray-100 dark:bg-gray-800">
        <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender.id === currentUserId ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender.id === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <p className="text-sm font-semibold">{message.sender.email}</p>
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
          />
          <Button onClick={handleSendMessage} disabled={!isConnected || !inputValue.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. AI Integration

### 7.1 Gemini AI Configuration

```typescript
// lib/gemini.ts
import axios from 'axios'

const GEMINI_API_KEY = process.env.llm_api_key
const GEMINI_MODEL = process.env.llm_model || 'gemini-2.0-flash'
const GEMINI_API_URL = process.env.llm_api_url ||
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface GeminiRequest {
  prompt: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
}

export interface GeminiResponse {
  text: string
  candidates?: any[]
}

export async function generateContent(request: GeminiRequest): Promise<GeminiResponse> {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: request.prompt
          }]
        }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 2048,
          topP: request.topP || 0.95,
          topK: request.topK || 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const text = response.data.candidates[0]?.content?.parts[0]?.text || ''

    return {
      text,
      candidates: response.data.candidates
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate content')
  }
}
```

### 7.2 Daily Quiz Generation

```typescript
// lib/quizGenerator.ts
import { generateContent } from './gemini'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  careerPath: string
  points: number
}

export async function generateDailyQuiz(
  careerPath: string,
  studentLevel: string,
  weekNumber: number
): Promise<QuizQuestion[]> {
  const prompt = `
Generate 20 multiple-choice questions for a student pursuing ${careerPath}.
Student Level: ${studentLevel}
Current Week: ${weekNumber}

Requirements:
1. Generate exactly 20 questions
2. Mix of difficulty levels: 8 EASY, 8 MEDIUM, 4 HARD
3. Cover various categories related to ${careerPath}
4. Each question should have 4 options
5. Provide detailed explanations for correct answers
6. Questions should be relevant to week ${weekNumber} of learning

Return the response in the following JSON format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation",
      "category": "Category name",
      "difficulty": "EASY|MEDIUM|HARD",
      "careerPath": "${careerPath}",
      "points": 1
    }
  ]
}
`

  try {
    const response = await generateContent({
      prompt,
      temperature: 0.8,
      maxTokens: 4096
    })

    // Parse JSON from response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz questions from AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.questions
  } catch (error) {
    console.error('Quiz generation error:', error)
    throw new Error('Failed to generate quiz questions')
  }
}
```

### 7.3 AI Roadmap Generation

```typescript
// lib/roadmapGenerator.ts
import { generateContent } from './gemini'

export interface Milestone {
  week: number
  title: string
  description: string
  topics: string[]
  resources: string[]
  deliverables: string[]
}

export interface Roadmap {
  title: string
  description: string
  totalDuration: string
  careerPath: string
  studentLevel: string
  milestones: Milestone[]
  learningPath: string
  careerOutcomes: string[]
}

export async function generateRoadmap(
  careerPath: string,
  studentLevel: string,
  duration: number
): Promise<Roadmap> {
  const prompt = `
Create a comprehensive learning roadmap for a ${studentLevel} level student pursuing ${careerPath}.
Duration: ${duration} weeks

Requirements:
1. Create week-by-week milestones
2. Include specific topics to cover each week
3. Recommend learning resources
4. Define deliverables for each milestone
5. Provide clear learning path progression
6. List expected career outcomes

Return the response in the following JSON format:
{
  "title": "Roadmap title",
  "description": "Brief description",
  "totalDuration": "${duration} weeks",
  "careerPath": "${careerPath}",
  "studentLevel": "${studentLevel}",
  "milestones": [
    {
      "week": 1,
      "title": "Milestone title",
      "description": "Milestone description",
      "topics": ["Topic 1", "Topic 2"],
      "resources": ["Resource 1", "Resource 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ],
  "learningPath": "Overall learning path description",
  "careerOutcomes": ["Outcome 1", "Outcome 2"]
}
`

  try {
    const response = await generateContent({
      prompt,
      temperature: 0.7,
      maxTokens: 4096
    })

    // Parse JSON from response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse roadmap from AI response')
    }

    const roadmap: Roadmap = JSON.parse(jsonMatch[0])
    return roadmap
  } catch (error) {
    console.error('Roadmap generation error:', error)
    throw new Error('Failed to generate roadmap')
  }
}
```



---

## 8. Code Execution System

### 8.1 Judge0 API Integration

```typescript
// lib/judge0.ts
import axios from 'axios'

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY

export interface CodeSubmission {
  source_code: string
  language_id: number
  stdin?: string
  expected_output?: string
  cpu_time_limit?: number
  memory_limit?: number
}

export interface ExecutionResult {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  status: {
    id: number
    description: string
  }
  time: string | null
  memory: number | null
  token: string
}

export async function submitCode(submission: CodeSubmission): Promise<string> {
  try {
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: Buffer.from(submission.source_code).toString('base64'),
        language_id: submission.language_id,
        stdin: submission.stdin ? Buffer.from(submission.stdin).toString('base64') : undefined,
        expected_output: submission.expected_output 
          ? Buffer.from(submission.expected_output).toString('base64') 
          : undefined,
        cpu_time_limit: submission.cpu_time_limit || 2,
        memory_limit: submission.memory_limit || 128000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    )

    return response.data.token
  } catch (error) {
    console.error('Judge0 submission error:', error)
    throw new Error('Failed to submit code')
  }
}

export async function getSubmissionResult(token: string): Promise<ExecutionResult> {
  try {
    const response = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}`,
      {
        params: {
          base64_encoded: true,
          fields: '*'
        },
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    )

    const data = response.data

    return {
      stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : null,
      stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString() : null,
      compile_output: data.compile_output 
        ? Buffer.from(data.compile_output, 'base64').toString() 
        : null,
      status: data.status,
      time: data.time,
      memory: data.memory,
      token: data.token
    }
  } catch (error) {
    console.error('Judge0 result fetch error:', error)
    throw new Error('Failed to fetch execution result')
  }
}

export async function executeCode(submission: CodeSubmission): Promise<ExecutionResult> {
  // Submit code
  const token = await submitCode(submission)

  // Poll for results
  let attempts = 0
  const maxAttempts = 10
  const pollInterval = 1000 // 1 second

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    const result = await getSubmissionResult(token)

    // Status IDs: 1 = In Queue, 2 = Processing
    if (result.status.id > 2) {
      return result
    }

    attempts++
  }

  throw new Error('Code execution timeout')
}

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  'javascript': 63,
  'python': 71,
  'java': 62,
  'c': 50,
  'cpp': 54,
  'csharp': 51,
  'go': 60,
  'rust': 73,
  'ruby': 72,
  'php': 68,
  'swift': 83,
  'kotlin': 78,
  'typescript': 74
}
```

### 8.2 Code Test System Implementation

```typescript
// lib/codeTestSystem.ts
import { executeCode, CodeSubmission } from './judge0'
import prisma from './prisma'

export interface TestCase {
  input: string
  expectedOutput: string
  points: number
}

export interface CodeQuestion {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  testCases: TestCase[]
  starterCode: string
  hints: string[]
}

export interface TestResult {
  testCaseIndex: number
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  executionTime: string | null
  error: string | null
}

export async function runCodeTests(
  code: string,
  languageId: number,
  testCases: TestCase[]
): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    try {
      const result = await executeCode({
        source_code: code,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.expectedOutput
      })

      const passed = result.stdout?.trim() === testCase.expectedOutput.trim()

      results.push({
        testCaseIndex: i,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout || '',
        executionTime: result.time,
        error: result.stderr || result.compile_output || null
      })
    } catch (error) {
      results.push({
        testCaseIndex: i,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        executionTime: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

export function calculateScore(results: TestResult[], maxScore: number = 5): number {
  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.length

  if (totalTests === 0) return 0

  return Math.round((passedTests / totalTests) * maxScore)
}

export async function saveTestSession(
  studentId: number,
  language: string,
  languageId: number,
  questions: CodeQuestion[],
  results: Map<string, TestResult[]>
): Promise<number> {
  // Calculate total score
  let totalScore = 0
  let totalTimeSpent = 0

  questions.forEach(question => {
    const questionResults = results.get(question.id) || []
    totalScore += calculateScore(questionResults)
  })

  // Create test session
  const session = await prisma.codeTestSession.create({
    data: {
      studentId,
      language,
      languageId,
      totalQuestions: questions.length,
      questions: JSON.stringify(questions),
      totalScore,
      maxScore: questions.length * 5,
      timeSpent: totalTimeSpent,
      isCompleted: true,
      completedAt: new Date()
    }
  })

  // Save individual question results
  for (const question of questions) {
    const questionResults = results.get(question.id) || []
    const score = calculateScore(questionResults)
    const passedTests = questionResults.filter(r => r.passed).length

    await prisma.codeTestQuestionResult.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        questionTitle: question.title,
        questionIndex: questions.indexOf(question),
        studentCode: '', // Store actual code here
        score,
        maxScore: 5,
        passedTests,
        totalTests: questionResults.length,
        testResults: JSON.stringify(questionResults),
        timeSpent: 0, // Track per question
        attempts: 1
      }
    })
  }

  return session.id
}
```

### 8.3 Monaco Editor Integration

```typescript
// components/CodeEditor.tsx
'use client'

import { useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string | undefined) => void
  height?: string
  theme?: 'vs-dark' | 'light'
  readOnly?: boolean
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = '500px',
  theme = 'vs-dark',
  readOnly = false
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true
    })

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Handle save
      console.log('Save triggered')
    })

    // Configure language-specific settings
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    })
  }

  function formatCode() {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run()
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 p-2 flex justify-between items-center">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={formatCode}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Format Code
        </button>
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true
        }}
      />
    </div>
  )
}
```

---

## 9. Frontend Architecture

### 9.1 Component Structure

```
components/
├── ui/                      # Shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── admin/                   # Admin-specific components
│   ├── CollegeManager.tsx
│   ├── DepartmentManager.tsx
│   ├── FacultyManager.tsx
│   └── StudentManager.tsx
├── faculty/                 # Faculty-specific components
│   ├── StudentList.tsx
│   ├── RoadmapCreator.tsx
│   ├── CourseManager.tsx
│   └── MessageComposer.tsx
├── student/                 # Student-specific components
│   ├── DailyQuizCard.tsx
│   ├── CodeEditor.tsx
│   ├── PerformanceChart.tsx
│   └── RoadmapViewer.tsx
├── shared/                  # Shared components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
└── layouts/                 # Layout components
    ├── AdminLayout.tsx
    ├── FacultyLayout.tsx
    └── StudentLayout.tsx
```

### 9.2 Custom Hooks

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  role: string
  firstName?: string
  lastName?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()

      // Store token and user
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      setToken(data.data.token)
      setUser(data.data.user)

      // Redirect based on role
      switch (data.data.user.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'faculty':
          router.push('/faculty/dashboard')
          break
        case 'student':
          router.push('/student/career-dashboard')
          break
        default:
          router.push('/')
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    router.push('/auth/login')
  }

  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  }
}
```

```typescript
// hooks/useAPI.ts
import { useState, useCallback } from 'react'

interface UseAPIOptions {
  token?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAPI<T = any>(options: UseAPIOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const request = useCallback(async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const responseData = await response.json()
      setData(responseData.data)
      options.onSuccess?.(responseData.data)

      return responseData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [options])

  const get = useCallback((url: string) => request(url, 'GET'), [request])
  const post = useCallback((url: string, body: any) => request(url, 'POST', body), [request])
  const put = useCallback((url: string, body: any) => request(url, 'PUT', body), [request])
  const del = useCallback((url: string) => request(url, 'DELETE'), [request])

  return {
    data,
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del
  }
}
```

### 9.3 Context Providers

```typescript
// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthContextType {
  user: any
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
```

```typescript
// contexts/ThemeContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### 9.4 Layout Components

```typescript
// components/layouts/StudentLayout.tsx
'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/shared/Sidebar'
import { Navbar } from '@/components/shared/Navbar'
import { useAuthContext } from '@/contexts/AuthContext'

interface StudentLayoutProps {
  children: ReactNode
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const { user } = useAuthContext()

  const sidebarItems = [
    { label: 'Dashboard', href: '/student/career-dashboard', icon: 'Home' },
    { label: 'Daily Quiz', href: '/student/daily-quiz', icon: 'Brain' },
    { label: 'Code Editor', href: '/student/code-execution', icon: 'Code' },
    { label: 'Code Tests', href: '/student/code-test', icon: 'FileCode' },
    { label: 'Roadmaps', href: '/student/roadmaps', icon: 'Map' },
    { label: 'Courses', href: '/student/courses', icon: 'BookOpen' },
    { label: 'Workshops', href: '/student/workshops', icon: 'Users' },
    { label: 'Mentor Talks', href: '/student/mentor-talks', icon: 'MessageSquare' },
    { label: 'Certificates', href: '/student/certificate-submission', icon: 'Award' },
    { label: 'Analytics', href: '/student/analytics', icon: 'BarChart' },
    { label: 'Messages', href: '/student/messages', icon: 'Mail' },
    { label: 'Profile', href: '/student/profile', icon: 'User' }
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 10. State Management

### 10.1 Local State with useState

```typescript
// Example: Quiz state management
const [quiz, setQuiz] = useState<Quiz | null>(null)
const [currentQuestion, setCurrentQuestion] = useState(0)
const [answers, setAnswers] = useState<number[]>([])
const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes

const handleAnswerSelect = (answerIndex: number) => {
  const newAnswers = [...answers]
  newAnswers[currentQuestion] = answerIndex
  setAnswers(newAnswers)
}

const handleNextQuestion = () => {
  if (currentQuestion < quiz.questions.length - 1) {
    setCurrentQuestion(currentQuestion + 1)
  }
}
```

### 10.2 Global State with Context

```typescript
// contexts/QuizContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface QuizState {
  currentQuiz: any
  answers: number[]
  timeSpent: number
  isSubmitted: boolean
}

interface QuizContextType {
  state: QuizState
  setCurrentQuiz: (quiz: any) => void
  setAnswer: (questionIndex: number, answerIndex: number) => void
  submitQuiz: () => Promise<void>
  resetQuiz: () => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({
    currentQuiz: null,
    answers: [],
    timeSpent: 0,
    isSubmitted: false
  })

  const setCurrentQuiz = (quiz: any) => {
    setState(prev => ({
      ...prev,
      currentQuiz: quiz,
      answers: new Array(quiz.questions.length).fill(-1)
    }))
  }

  const setAnswer = (questionIndex: number, answerIndex: number) => {
    setState(prev => {
      const newAnswers = [...prev.answers]
      newAnswers[questionIndex] = answerIndex
      return { ...prev, answers: newAnswers }
    })
  }

  const submitQuiz = async () => {
    // Submit quiz logic
    setState(prev => ({ ...prev, isSubmitted: true }))
  }

  const resetQuiz = () => {
    setState({
      currentQuiz: null,
      answers: [],
      timeSpent: 0,
      isSubmitted: false
    })
  }

  return (
    <QuizContext.Provider value={{
      state,
      setCurrentQuiz,
      setAnswer,
      submitQuiz,
      resetQuiz
    }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider')
  }
  return context
}
```

### 10.3 Server State with SWR (Alternative)

```typescript
// Using SWR for data fetching and caching
import useSWR from 'swr'

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json())

export function useStudent(studentId: number, token: string) {
  const { data, error, mutate } = useSWR(
    [`/api/student/${studentId}`, token],
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  return {
    student: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
```

---

## 11. Performance Optimization

### 11.1 Code Splitting and Lazy Loading

```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false
})

const Chart = dynamic(() => import('@/components/PerformanceChart'), {
  loading: () => <div>Loading chart...</div>
})
```

### 11.2 Image Optimization

```typescript
// Using Next.js Image component
import Image from 'next/image'

export function ProfileImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      quality={85}
      priority
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### 11.3 Memoization

```typescript
import { useMemo, useCallback } from 'react'

export function StudentList({ students }: { students: Student[] }) {
  // Memoize expensive calculations
  const sortedStudents = useMemo(() => {
    return students.sort((a, b) => a.name.localeCompare(b.name))
  }, [students])

  // Memoize callback functions
  const handleStudentClick = useCallback((studentId: number) => {
    console.log('Student clicked:', studentId)
  }, [])

  return (
    <div>
      {sortedStudents.map(student => (
        <div key={student.id} onClick={() => handleStudentClick(student.id)}>
          {student.name}
        </div>
      ))}
    </div>
  )
}
```

### 11.4 Database Query Optimization

```typescript
// Efficient Prisma queries with select and include
const students = await prisma.student.findMany({
  where: {
    departmentId: departmentId,
    year: year
  },
  select: {
    id: true,
    name: true,
    email: true,
    registerNumber: true,
    // Only select needed fields
    department: {
      select: {
        name: true
      }
    }
  },
  take: 50, // Pagination
  skip: page * 50,
  orderBy: {
    name: 'asc'
  }
})

// Use indexes for better performance
// Already defined in schema with @@index
```



---

## 12. Testing Strategy

### 12.1 Unit Testing with Jest

```typescript
// __tests__/lib/auth.test.ts
import { generateToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth'

describe('Authentication Functions', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'student'
      }

      const token = generateToken(payload)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'student'
      }

      const token = generateToken(payload)
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.role).toBe(payload.role)
    })

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token')
      expect(decoded).toBeNull()
    })
  })

  describe('Password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
    })

    it('should compare passwords correctly', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isMatch = await comparePassword(password, hashed)
      expect(isMatch).toBe(true)

      const isNotMatch = await comparePassword('wrongPassword', hashed)
      expect(isNotMatch).toBe(false)
    })
  })
})
```

### 12.2 Integration Testing

```typescript
// __tests__/api/student/profile.test.ts
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/student/profile/route'
import { generateToken } from '@/lib/auth'

describe('/api/student/profile', () => {
  it('should return student profile for authenticated user', async () => {
    const token = generateToken({
      userId: 1,
      email: 'student@example.com',
      role: 'student'
    })

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    await GET(req)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('should return 401 for unauthenticated request', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await GET(req)

    expect(res._getStatusCode()).toBe(401)
  })
})
```

### 12.3 Component Testing with React Testing Library

```typescript
// __tests__/components/DailyQuizCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyQuizCard } from '@/components/student/DailyQuizCard'

describe('DailyQuizCard', () => {
  it('should render quiz information', () => {
    const quiz = {
      id: 1,
      totalQuestions: 20,
      bestScore: 85,
      totalAttempts: 1,
      isCompleted: false
    }

    render(<DailyQuizCard quiz={quiz} />)

    expect(screen.getByText('Daily Quiz')).toBeInTheDocument()
    expect(screen.getByText('20 Questions')).toBeInTheDocument()
    expect(screen.getByText('Best Score: 85%')).toBeInTheDocument()
  })

  it('should call onStartQuiz when button is clicked', () => {
    const onStartQuiz = jest.fn()
    const quiz = {
      id: 1,
      totalQuestions: 20,
      bestScore: 0,
      totalAttempts: 0,
      isCompleted: false
    }

    render(<DailyQuizCard quiz={quiz} onStartQuiz={onStartQuiz} />)

    const button = screen.getByText('Start Quiz')
    fireEvent.click(button)

    expect(onStartQuiz).toHaveBeenCalledTimes(1)
  })
})
```

### 12.4 E2E Testing with Playwright

```typescript
// e2e/student-quiz.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Student Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'student@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/student/career-dashboard')
  })

  test('should complete daily quiz', async ({ page }) => {
    // Navigate to quiz
    await page.click('text=Daily Quiz')
    await page.waitForURL('/student/daily-quiz')

    // Start quiz
    await page.click('text=Start Quiz')

    // Answer questions
    for (let i = 0; i < 20; i++) {
      await page.click('input[type="radio"]')
      await page.click('text=Next')
    }

    // Submit quiz
    await page.click('text=Submit Quiz')

    // Verify results
    await expect(page.locator('text=Quiz Results')).toBeVisible()
    await expect(page.locator('text=Score:')).toBeVisible()
  })
})
```

---

## 13. Deployment Architecture

### 13.1 Vercel Deployment Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "llm_api_key": "@gemini-api-key",
    "JUDGE0_API_KEY": "@judge0-api-key"
  },
  "crons": [
    {
      "path": "/api/cron/daily-quiz-reset",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 13.2 Environment Variables Setup

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# AI Integration
llm_api_key="your-gemini-api-key"
llm_model="gemini-2.0-flash"
llm_api_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Code Execution
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"

# Real-time
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Jobs
CRON_SECRET="your-secure-cron-secret"

# Node Environment
NODE_ENV="development"
```

### 13.3 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: nexuspath-db
    environment:
      POSTGRES_USER: nexuspath
      POSTGRES_PASSWORD: nexuspath_password
      POSTGRES_DB: nexuspath
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nexuspath-app
    environment:
      DATABASE_URL: postgresql://nexuspath:nexuspath_password@postgres:5432/nexuspath
      JWT_SECRET: your-jwt-secret
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

### 13.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 14. Development Workflow

### 14.1 Git Workflow

```bash
# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# After review and approval, merge to main
```

### 14.2 Commit Message Convention

```
feat: Add new feature
fix: Fix bug in authentication
docs: Update documentation
style: Format code
refactor: Refactor code structure
test: Add tests
chore: Update dependencies
```

### 14.3 Development Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

### 14.4 Code Quality Tools

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

---

## 15. Code Examples

### 15.1 Complete API Route Example

```typescript
// app/api/faculty/roadmap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateRoadmap } from '@/lib/roadmapGenerator'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { 
      title, 
      careerPath, 
      studentLevel, 
      duration, 
      useAI 
    } = body

    // 3. Validate input
    if (!title || !careerPath || !studentLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Get faculty information
    const faculty = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, departmentId: true }
    })

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // 5. Generate or create roadmap
    let roadmapData

    if (useAI) {
      // AI-generated roadmap
      roadmapData = await generateRoadmap(
        careerPath,
        studentLevel,
        duration || 12
      )
    } else {
      // Manual roadmap
      roadmapData = {
        title,
        description: body.description || '',
        totalDuration: `${duration} weeks`,
        careerPath,
        studentLevel,
        milestones: body.milestones || [],
        learningPath: body.learningPath || '',
        careerOutcomes: body.careerOutcomes || []
      }
    }

    // 6. Save to database
    const roadmap = await prisma.roadmap.create({
      data: {
        title: roadmapData.title,
        description: roadmapData.description,
        totalDuration: roadmapData.totalDuration,
        year: body.year || 1,
        careerPath: roadmapData.careerPath,
        department: body.department || '',
        studentLevel: roadmapData.studentLevel,
        milestones: JSON.stringify(roadmapData.milestones),
        learningPath: roadmapData.learningPath,
        careerOutcomes: JSON.stringify(roadmapData.careerOutcomes),
        isAIGenerated: useAI,
        createdBy: faculty.id
      }
    })

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: roadmap,
      message: 'Roadmap created successfully'
    })

  } catch (error) {
    console.error('Roadmap creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get faculty ID
    const faculty = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true }
    })

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Fetch roadmaps created by this faculty
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        createdBy: faculty.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: roadmaps
    })

  } catch (error) {
    console.error('Fetch roadmaps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
      { status: 500 }
    )
  }
}
```

### 15.2 Complete Component Example

```typescript
// components/student/DailyQuizInterface.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
  difficulty: string
}

interface Quiz {
  id: number
  questions: Question[]
  totalAttempts: number
  bestScore: number
}

export function DailyQuizInterface() {
  const { token } = useAuthContext()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch quiz on mount
  useEffect(() => {
    fetchQuiz()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!quiz || isSubmitted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, isSubmitted, timeRemaining])

  const fetchQuiz = async () => {
    try {
      const response = await fetch('/api/student/daily-quiz', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch quiz')

      const data = await response.json()
      setQuiz(data.data)
      setAnswers(new Array(data.data.questions.length).fill(-1))
    } catch (error) {
      toast.error('Failed to load quiz')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/student/daily-quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId: quiz!.id,
          answers,
          timeSpent: 1800 - timeRemaining
        })
      })

      if (!response.ok) throw new Error('Failed to submit quiz')

      const data = await response.json()
      setResults(data.data)
      setIsSubmitted(true)
      toast.success('Quiz submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit quiz')
      console.error(error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!quiz) {
    return <div>No quiz available</div>
  }

  if (isSubmitted && results) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-4xl font-bold">{results.score}%</h2>
              <p className="text-gray-600">
                {results.correctAnswers} out of {results.totalQuestions} correct
              </p>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <Card key={question.id} className={
                  answers[index] === question.correctAnswer
                    ? 'border-green-500'
                    : 'border-red-500'
                }>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">{question.question}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Your answer: {question.options[answers[index]]}
                    </p>
                    <p className="text-sm text-green-600 mb-2">
                      Correct answer: {question.options[question.correctAnswer]}
                    </p>
                    <p className="text-sm text-gray-700">
                      {question.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={() => window.location.reload()} className="w-full">
              {quiz.totalAttempts < 2 ? 'Try Again' : 'Back to Dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daily Quiz</CardTitle>
          <div className="text-lg font-semibold">
            Time: {formatTime(timeRemaining)}
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>

          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`
                  w-10 h-10 rounded-md text-sm font-medium
                  ${index === currentQuestion ? 'bg-blue-500 text-white' : ''}
                  ${answers[index] !== -1 && index !== currentQuestion ? 'bg-green-200' : ''}
                  ${answers[index] === -1 && index !== currentQuestion ? 'bg-gray-200' : ''}
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 16. Conclusion

This technical documentation provides a comprehensive guide to the NexusPath platform's implementation details, covering:

- **Architecture**: Complete system architecture with clear separation of concerns
- **Technology Stack**: Modern, scalable technologies (Next.js 15, React 19, Prisma, PostgreSQL)
- **Database Design**: Well-structured schema with 40+ tables and complex relationships
- **API Implementation**: RESTful APIs with proper authentication and authorization
- **Security**: JWT-based authentication, RBAC, and security best practices
- **Real-time Features**: Socket.IO integration for live messaging
- **AI Integration**: Gemini AI for quiz generation and roadmap creation
- **Code Execution**: Judge0 API integration for multi-language code execution
- **Frontend Architecture**: Component-based architecture with proper state management
- **Performance**: Optimization strategies for database queries and frontend rendering
- **Testing**: Comprehensive testing strategy (unit, integration, E2E)
- **Deployment**: Production-ready deployment configuration
- **Development Workflow**: Best practices for development and collaboration

### Key Technical Achievements

✅ **Type-Safe Development**: Full TypeScript implementation
✅ **Scalable Architecture**: Modular, maintainable codebase
✅ **Real-time Communication**: WebSocket-based messaging
✅ **AI-Powered Features**: Intelligent content generation
✅ **Secure Authentication**: JWT with role-based access control
✅ **Performance Optimized**: Efficient database queries and caching
✅ **Production Ready**: Docker, CI/CD, and monitoring setup

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Maintained By**: Development Team  
**License**: Proprietary

---

For additional technical support or questions, please refer to the main project documentation or contact the development team.
