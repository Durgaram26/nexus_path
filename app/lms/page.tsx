'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, TrendingUp, BookOpen, Calendar, Settings, Menu, Search, Bell, Award, Target, CheckCircle, Play } from 'lucide-react';





interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  avatar?: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
  currentStreak: number;
  lastActive: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  thumbnail: string;
  lessons: number;
  quizzes: number;
  lastAccessed: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Available' | 'In Progress' | 'Completed' | 'Locked';
  score?: number;
  attempts: number;
  maxAttempts: number;
  dueDate?: string;
  isAdaptive: boolean;
}

export default function LMSHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const student: Student = {
    id: 1,
    name: "John Doe",
    email: "john.doe@university.edu",
    department: "Computer Science",
    year: 3,
    progress: 75,
    totalCourses: 8,
    completedCourses: 6,
    currentStreak: 12,
    lastActive: "2 hours ago"
  };

  const courses: Course[] = [
    {
      id: 1,
      title: "Advanced Data Structures",
      description: "Master complex data structures and algorithms",
      instructor: "Dr. Sarah Johnson",
      duration: "8 weeks",
      difficulty: "Advanced",
      progress: 85,
      status: "In Progress",
      thumbnail: "//placeholder/300/200",
      lessons: 24,
      quizzes: 6,
      lastAccessed: "2 hours ago"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      description: "Introduction to ML concepts and applications",
      instructor: "Prof. Michael Chen",
      duration: "10 weeks",
      difficulty: "Intermediate",
      progress: 60,
      status: "In Progress",
      thumbnail: "//placeholder/300/200",
      lessons: 30,
      quizzes: 8,
      lastAccessed: "1 day ago"
    },
    {
      id: 3,
      title: "Web Development Bootcamp",
      description: "Full-stack web development with modern frameworks",
      instructor: "Dr. Emily Rodriguez",
      duration: "12 weeks",
      difficulty: "Beginner",
      progress: 100,
      status: "Completed",
      thumbnail: "//placeholder/300/200",
      lessons: 40,
      quizzes: 12,
      lastAccessed: "1 week ago"
    }
  ];

  const quizzes: Quiz[] = [
    {
      id: 1,
      title: "Adaptive Data Structures Quiz",
      description: "AI-powered quiz adapting to your learning pace",
      duration: 30,
      questions: 15,
      difficulty: "Medium",
      status: "Available",
      attempts: 0,
      maxAttempts: 3,
      dueDate: "2024-02-15",
      isAdaptive: true
    },
    {
      id: 2,
      title: "Machine Learning Concepts",
      description: "Test your understanding of ML fundamentals",
      duration: 45,
      questions: 20,
      difficulty: "Hard",
      status: "In Progress",
      score: 85,
      attempts: 1,
      maxAttempts: 2,
      dueDate: "2024-02-20",
      isAdaptive: false
    },
    {
      id: 3,
      title: "Web Development Assessment",
      description: "Comprehensive web development knowledge test",
      duration: 60,
      questions: 25,
      difficulty: "Medium",
      status: "Completed",
      score: 92,
      attempts: 2,
      maxAttempts: 2,
      isAdaptive: false
    }
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, active: true },
    { id: 'courses', label: 'My Courses', icon: BookOpen, active: false },
    { id: 'quizzes', label: 'Quizzes & Tests', icon: FileText, active: false },
    { id: 'progress', label: 'Progress', icon: TrendingUp, active: false },
    { id: 'calendar', label: 'Calendar', icon: Calendar, active: false },
    { id: 'settings', label: 'Settings', icon: Settings, active: false }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In ': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuizStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In ': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-purple-100 text-purple-800';
      case 'Locked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <div className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex items-center ml-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">NexusPath LMS</h1>
                  <p className="text-sm text-gray-500">Learning Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.department}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {student.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">NexusPath</h2>
                  <p className="text-sm text-gray-500">LMS Platform</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{student.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{student.completedCourses} of {student.totalCourses} courses</span>
                  <span>🔥 {student.currentStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {student.name}!</h2>
                    <p className="text-blue-100">Continue your learning journey with adaptive assessments</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{student.progress}%</div>
                    <div className="text-blue-100">Overall Progress</div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <div className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'In Progress').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{student.completedCourses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                        <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.status === 'Completed').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <div className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Study Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{student.currentStreak} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2" />
                      My Courses
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-500">{course.instructor}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={getDifficultyColor(course.difficulty)}>
                                {course.difficulty}
                              </div>
                              <div className={getStatusColor(course.status)}>
                                {course.status}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{course.progress}%</div>
                            <div className="w-16 h-2 mt-1 bg-gray-200 rounded-full">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Recent Quizzes
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quizzes.slice(0, 3).map((quiz) => (
                        <div key={quiz.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                            <p className="text-sm text-gray-500">{quiz.questions} questions • {quiz.duration} min</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={getQuizStatusColor(quiz.status)}>
                                {quiz.status}
                              </div>
                              {quiz.isAdaptive && (
                                <div className="bg-purple-100 text-purple-800">
                                  AI Adaptive
                                </div>
                              )}
                              {quiz.score && (
                                <span className="text-sm font-medium text-green-600">
                                  {quiz.score}%
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            {quiz.status === 'Available' ? <Play className="w-4 h-4" /> : 
                             quiz.status === 'In Progress' ? <div className="w-4 h-4" /> :
                             <CheckCircle className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quizzes & Assessments</h2>
                  <p className="text-gray-600">Test your knowledge with adaptive and traditional quizzes</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start New Quiz
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-lg">{quiz.title}</div>
                          <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        </div>
                        {quiz.isAdaptive && (
                          <div className="bg-purple-100 text-purple-800 ml-2">
                            AI
                          </div>
                        )}
                      </div>
                    </>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{quiz.duration} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Questions</span>
                          <span className="font-medium">{quiz.questions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Difficulty</span>
                          <div className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status</span>
                          <div className={getQuizStatusColor(quiz.status)}>
                            {quiz.status}
                          </div>
                        </div>
                        {quiz.score && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Score</span>
                            <span className="font-medium text-green-600">{quiz.score}%</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Attempts</span>
                          <span className="font-medium">{quiz.attempts}/{quiz.maxAttempts}</span>
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            className="w-full" 
                            variant={quiz.status === 'Available' ? 'default' : 'outline'}
                            disabled={quiz.status === 'Locked'}
                          >
                            {quiz.status === 'Available' ? 'Start Quiz' :
                             quiz.status === 'In Progress' ? 'Continue Quiz' :
                             quiz.status === 'Completed' ? 'Review Results' :
                             'Locked'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
