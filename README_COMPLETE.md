# NexusPath - AI-Powered Learning Management System

<div align="center">

![NexusPath Logo](https://via.placeholder.com/200x200?text=NexusPath)

**Next-Generation Learning Management System with AI Integration**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Demo](#demo) • [Support](#support)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

**NexusPath** is a comprehensive, AI-powered Learning Management System designed to revolutionize education through personalized learning, real-time communication, and intelligent career guidance. Built with modern technologies, it provides a scalable solution for educational institutions, training centers, and online learning platforms.

### Why NexusPath?

- 🤖 **AI-Powered**: Personalized quiz generation and roadmap creation using Google Gemini AI
- ⚡ **Real-time**: Socket.IO-based instant messaging and notifications
- 💻 **Code Execution**: Integrated Monaco Editor with Judge0 API supporting 70+ languages
- 📊 **Analytics**: Comprehensive performance tracking and insights
- 🎯 **Career Focused**: Dynamic career path management and tracking
- 🔐 **Secure**: JWT authentication with role-based access control
- 📱 **Responsive**: Modern UI with Tailwind CSS and Radix UI
- 🚀 **Scalable**: Built for enterprise-level deployment

---

## ✨ Features

### For Students

- 📚 **Daily Adaptive Quizzes**: AI-generated 20-question quizzes with 2 attempts per day
- 💻 **Code Execution Environment**: Practice coding in 70+ programming languages
- 🧪 **Automated Code Testing**: 5-question tests with instant feedback
- 🗺️ **Learning Roadmaps**: AI-generated personalized learning paths
- 📊 **Performance Analytics**: Track progress and identify weak areas
- 📝 **Certificate Submission**: Submit external course certificates for evaluation
- 🎓 **Course Enrollment**: Enroll in courses and workshops
- 💬 **Real-time Messaging**: Communicate with faculty instantly
- 🎤 **Mentor Talks**: Register for industry expert sessions
- 📈 **Progress Tracking**: Visualize learning journey

### For Faculty

- 👥 **Dynamic Student Management**: View students based on department, year, and career path
- 🗺️ **Roadmap Creator**: Create learning roadmaps manually or with AI assistance
- 📚 **Resource Management**: Create and manage learning resources
- 📖 **Course Management**: Create courses, assignments, and track progress
- 🎓 **Workshop Management**: Schedule and manage workshops
- ✅ **Certificate Evaluation**: Review and grade student certificates
- 💬 **Broadcast Messaging**: Send announcements to students
- 📊 **Analytics Dashboard**: Monitor student performance
- 🎤 **Mentor Talk Scheduling**: Organize industry expert sessions
- 🔔 **Real-time Notifications**: Stay updated with student activities

### For Administrators

- 🏢 **College & Department Management**: Organize institutional hierarchy
- 👤 **User Management**: Manage faculty and students with CRUD operations
- 🎯 **Career Path Configuration**: Create and assign career paths
- 🔧 **Faculty Assignment**: Configure dynamic student visibility
- 📊 **System Analytics**: Monitor platform-wide metrics
- 🔐 **Access Control**: Role-based permissions
- 📈 **Performance Monitoring**: Track system health
- 🔄 **Bulk Operations**: Efficient user provisioning

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 with App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI, Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Code Editor**: Monaco Editor

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma 6.16.3
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO
- **AI**: Google Gemini 2.0 Flash
- **Code Execution**: Judge0 API

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: PostgreSQL (Supabase, Neon, or self-hosted)
- **Cron Jobs**: Vercel Cron or GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

```bash
# Clone the repository
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

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexuspath"

# Authentication
JWT_SECRET="your-secret-key-here"

# AI Integration (Google Gemini)
llm_api_key="your-gemini-api-key"
llm_model="gemini-2.0-flash"
llm_api_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Code Execution (Judge0)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"

# Real-time Communication
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Jobs
CRON_SECRET="your-cron-secret"
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## 📖 Usage

### Default Login Credentials

After seeding the database, use these credentials:

**Admin**:
- Email: admin@nexuspath.com
- Password: admin123

**Faculty**:
- Email: faculty@nexuspath.com
- Password: faculty123

**Student**:
- Email: student@nexuspath.com
- Password: student123

### User Roles

1. **Admin**: Full system access, manage colleges, departments, users, and career paths
2. **Faculty**: Manage assigned students, create content, evaluate submissions
3. **Student**: Access learning materials, take quizzes, submit assignments

---

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **[COMPLETE_PROJECT_DOCUMENTATION.md](COMPLETE_PROJECT_DOCUMENTATION.md)** - Complete system documentation
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Quick start guide for admins and faculty
- **[DAILY_QUIZ_SYSTEM.md](DAILY_QUIZ_SYSTEM.md)** - Daily quiz system documentation
- **[REALTIME_MESSAGING_GUIDE.md](REALTIME_MESSAGING_GUIDE.md)** - Real-time messaging guide
- **[ROADMAP_CREATOR_GUIDE.md](ROADMAP_CREATOR_GUIDE.md)** - Roadmap creator guide
- **[DATABASE_DOCUMENTATION_COMPLETE.md](DATABASE_DOCUMENTATION_COMPLETE.md)** - Database schema documentation
- **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)** - Technical implementation details

---

## 🏗️ Project Structure

```
nexuspath/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin portal
│   ├── faculty/           # Faculty portal
│   ├── student/           # Student portal
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # UI components (Shadcn/ui)
│   ├── admin/            # Admin components
│   ├── faculty/          # Faculty components
│   ├── student/          # Student components
│   └── shared/           # Shared components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Authentication utilities
│   ├── gemini.ts         # AI integration
│   └── judge0.ts         # Code execution
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/                # Static assets
├── hooks/                 # Custom React hooks
├── .env                   # Environment variables
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 🐛 Bug Reports & Feature Requests

- **Bug Reports**: Use GitHub Issues with the `bug` label
- **Feature Requests**: Use GitHub Issues with the `enhancement` label
- **Security Issues**: Email security@nexuspath.com

---

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB
- **Database**: PostgreSQL 12+
- **Node.js**: 18+

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Database**: PostgreSQL 14+
- **Node.js**: 20+

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel Dashboard
```

### Docker Deployment

```bash
# Build Docker image
docker build -t nexuspath .

# Run container
docker run -p 3000:3000 nexuspath
```

### Traditional Server

```bash
# Build application
npm run build

# Start production server
npm start
```

---

## 📈 Performance

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Real-time Latency**: < 50ms
- **Concurrent Users**: 1000+

---

## 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Security headers
- Rate limiting (recommended)

---

## 📄 License

This project is proprietary software. © 2025 NexusPath. All rights reserved.

Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👥 Team

- **Project Lead**: [Name]
- **Backend Development**: [Name]
- **Frontend Development**: [Name]
- **UI/UX Design**: [Name]
- **Database Architecture**: [Name]
- **DevOps**: [Name]

---

## 🙏 Acknowledgments

- Next.js by Vercel
- React by Meta
- Prisma by Prisma Data
- PostgreSQL by PostgreSQL Global Development Group
- Socket.IO by Automattic
- Google Gemini AI by Google
- Judge0 by Judge0
- Tailwind CSS by Tailwind Labs
- Radix UI by WorkOS
- All open-source contributors

---

## 📞 Support

- **Documentation**: [COMPLETE_PROJECT_DOCUMENTATION.md](COMPLETE_PROJECT_DOCUMENTATION.md)
- **Email**: support@nexuspath.com
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Community Forum**: [Join the discussion](https://forum.nexuspath.com)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Gamification system

### Q2 2025
- [ ] Machine learning recommendations
- [ ] Peer-to-peer mentoring
- [ ] LMS integrations

### Q3 2025
- [ ] Virtual classroom
- [ ] AR/VR learning experiences
- [ ] Blockchain certificates

### Q4 2025
- [ ] AI tutoring system
- [ ] Industry partnerships
- [ ] Global expansion

---

## 📊 Statistics

- **42+** Database Tables
- **100+** API Endpoints
- **70+** Programming Languages Supported
- **20** Questions per Daily Quiz
- **5** Questions per Code Test
- **10** Activity Categories in Roadmaps
- **3** User Roles (Admin, Faculty, Student)

---

<div align="center">

**Made with ❤️ by the NexusPath Team**

[Website](https://nexuspath.com) • [Documentation](COMPLETE_PROJECT_DOCUMENTATION.md) • [GitHub](https://github.com/your-repo)

</div>
