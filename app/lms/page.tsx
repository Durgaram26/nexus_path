'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  FileText,
  TrendingUp,
  BookOpen,
  Calendar,
  Settings,
  Menu,
  X,
  Bell,
  Award,
  Target,
  CheckCircle2,
  Play,
  Clock,
  ArrowRight,
  GraduationCap,
  Search,
  MoreVertical,
  Filter
} from 'lucide-react';

export default function LMSHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const student = {
    name: "John Doe",
    email: "john.doe@university.edu",
    department: "Computer Science",
    progress: 75,
    completedCourses: 6,
    totalCourses: 8,
    currentStreak: 12
  };

  const courses = [
    {
      id: 1, title: "Advanced Data Structures",
      instructor: "Dr. Sarah Johnson",
      difficulty: "Advanced", progress: 85, status: "In Progress",
      lessons: 24, quizzes: 6, lastAccessed: "2h ago"
    },
    {
      id: 2, title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Chen",
      difficulty: "Intermediate", progress: 60, status: "In Progress",
      lessons: 30, quizzes: 8, lastAccessed: "1d ago"
    },
    {
      id: 3, title: "Web Development Bootcamp",
      instructor: "Dr. Emily Rodriguez",
      difficulty: "Beginner", progress: 100, status: "Completed",
      lessons: 40, quizzes: 12, lastAccessed: "1w ago"
    }
  ];

  const quizzes = [
    {
      id: 1, title: "Adaptive Data Structures",
      type: "Adaptive", questions: 15, duration: "30 min",
      status: "Available", difficulty: "Medium", attempts: 0
    },
    {
      id: 2, title: "ML Concepts Assessment",
      type: "Standard", questions: 20, duration: "45 min",
      status: "In Progress", difficulty: "Hard", attempts: 1
    },
    {
      id: 3, title: "Web Dev Final Exam",
      type: "Standard", questions: 50, duration: "90 min",
      status: "Completed", difficulty: "Hard", score: 92
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'quizzes', label: 'Assessments', icon: FileText },
    { id: 'progress', label: 'Analytics', icon: TrendingUp },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0F172A]">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center mr-3">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">NexusPath</h1>
              <p className="text-slate-400 text-xs font-medium">LMS Enterprise</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-900/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold border border-slate-700">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{student.name}</p>
                <p className="text-slate-400 text-xs truncate">{student.department}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-[#0F172A] capitalize">
              {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search courses, resources..."
                className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">

            {activeTab === 'dashboard' && (
              <>
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back, John</h1>
                    <p className="text-[#64748B] mt-1">Here's what's happening with your learning path today.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-[#E2E8F0] text-[#0F172A]">
                      View Schedule
                    </Button>
                    <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                      Resume Learning
                    </Button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Overall Progress', value: '75%', sub: '+5% this week', icon: TrendingUp },
                    { label: 'Active Courses', value: '3', sub: '2 in progress', icon: BookOpen },
                    { label: 'Assessments', value: '88%', sub: 'Avg. score', icon: Target },
                    { label: 'Learning Hours', value: '12.5', sub: 'Last 7 days', icon: Clock }
                  ].map((stat, i) => (
                    <Card key={i} className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-[#64748B]">{stat.label}</p>
                          <div className="p-2 bg-[#F1F5F9] rounded-lg">
                            <stat.icon className="w-4 h-4 text-[#0F172A]" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-bold text-[#0F172A]">{stat.value}</h3>
                          <span className="text-xs text-[#10B981] font-medium">{stat.sub}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Recent Courses */}
                  <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#0F172A]">Recent Courses</h3>
                      <Button variant="ghost" className="text-sm text-[#4F46E5] hover:text-[#4338CA] hover:bg-[#EEF2FF]">
                        View All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <Card key={course.id} className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all group cursor-pointer">
                          <CardContent className="p-5 flex items-center gap-5">
                            <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#4F46E5] transition-colors">
                              <BookOpen className="w-6 h-6 text-[#4F46E5] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-semibold text-[#0F172A] truncate pr-4">{course.title}</h4>
                                <span className="text-xs text-[#64748B] flex-shrink-0">{course.lastAccessed}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-[#64748B] mb-3">
                                <span>{course.instructor}</span>
                                <span className="w-1 h-1 bg-[#CBD5E1] rounded-full" />
                                <span>{course.lessons - 8} lessons left</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${course.progress}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-[#0F172A] w-8 text-right">{course.progress}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Widgets */}
                  <div className="space-y-6">
                    <Card className="border-[#E2E8F0] shadow-sm">
                      <CardHeader className="border-b border-[#F1F5F9] py-4">
                        <CardTitle className="text-sm font-bold text-[#0F172A]">Upcoming Assessments</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {quizzes.map((quiz, i) => (
                          <div key={quiz.id} className={`p-4 flex items-start gap-3 ${i !== quizzes.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${quiz.status === 'Available' ? 'bg-green-500' :
                                quiz.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300'
                              }`} />
                            <div>
                              <h5 className="text-sm font-semibold text-[#0F172A]">{quiz.title}</h5>
                              <p className="text-xs text-[#64748B] mt-0.5">{quiz.questions} Qs • {quiz.duration}</p>
                              {quiz.status === 'Available' && (
                                <Button size="sm" variant="link" className="h-auto p-0 text-[#4F46E5] text-xs mt-1.5">
                                  Start Assessment
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-[#1E293B] text-white border-none shadow-md">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                        <p className="text-slate-300 text-sm mb-4">Complete your "Advanced Data Structures" quiz to unlock the next module.</p>
                        <Button variant="secondary" className="w-full bg-white text-[#0F172A] hover:bg-slate-100">
                          Go to Course
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {activeTab !== 'dashboard' && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="w-20 h-20 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-slate-400">
                    {sidebarItems.find(i => i.id === activeTab)?.icon({ className: "w-10 h-10" }) || <Settings className="w-10 h-10" />}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2 capitalize">{activeTab}</h2>
                <p className="text-[#64748B] max-w-md text-center">
                  This module is currently being updated with professional enterprise features.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
