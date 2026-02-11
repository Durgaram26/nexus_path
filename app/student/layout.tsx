'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  BarChart3,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  GraduationCap,
  Target,
  Calendar,
  Trophy,
  Code,
  Brain,
  Award,
  Wrench,
  Search,
  Settings
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isQuizWindow = pathname?.includes('/quiz-window');
  const isCodeWindow = pathname?.includes('/code-window');
  const isTestWindow = pathname?.includes('/code-test-old');
  const isWindowMode = isQuizWindow || isCodeWindow || isTestWindow;

  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/student/career-dashboard' },
    { id: 'career-paths', title: 'Career Paths', icon: Target, href: '/student/career-paths' },
    { id: 'roadmap', title: 'Learning Roadmap', icon: Brain, href: '/student/roadmap' },
    { id: 'learning-plan', title: 'My Learning Plan', icon: Calendar, href: '/student/learning-plan' },
    { id: 'courses', title: 'My Courses', icon: BookOpen, href: '/student/courses' },
    { id: 'workshops', title: 'My Workshops', icon: Wrench, href: '/student/workshops' },
    { id: 'mentor-talks', title: 'Mentor Talks', icon: Users, href: '/student/mentor-talks' },
    { id: 'certificate-submission', title: 'Certificates', icon: Award, href: '/student/certificate-submission' },
    { id: 'code-test', title: 'Code Test', icon: Code, href: '/student/code-test' },
    { id: 'daily-quiz', title: 'Daily Quiz', icon: Trophy, href: '/student/daily-quiz' },
    { id: 'analytics', title: 'Analytics', icon: BarChart3, href: '/student/analytics' },
    { id: 'messages', title: 'Messages', icon: MessageSquare, href: '/student/messages' },
    { id: 'settings', title: 'Settings', icon: Settings, href: '/student/settings' }
  ];

  const getCurrentSection = () => {
    if (!pathname) return 'dashboard';
    if (pathname === '/student/career-dashboard') return 'dashboard';
    if (pathname.startsWith('/student/career-paths')) return 'career-paths';
    if (pathname.startsWith('/student/roadmap')) return 'roadmap';
    if (pathname.startsWith('/student/learning-plan')) return 'learning-plan';
    if (pathname.startsWith('/student/courses')) return 'courses';
    if (pathname.startsWith('/student/workshops')) return 'workshops';
    if (pathname.startsWith('/student/mentor-talks')) return 'mentor-talks';
    if (pathname.startsWith('/student/certificate-submission')) return 'certificate-submission';
    if (pathname.startsWith('/student/code-test')) return 'code-test';
    if (pathname.startsWith('/student/daily-quiz')) return 'daily-quiz';
    if (pathname.startsWith('/student/analytics')) return 'analytics';
    if (pathname.startsWith('/student/messages')) return 'messages';
    if (pathname.startsWith('/student/settings')) return 'settings';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  const getSectionTitle = (section: string) => {
    const item = navigationItems.find(item => item.id === section);
    return item ? item.title : 'Student Dashboard';
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'student') {
      router.push('/unauthorized');
      return;
    }

    fetchStudentData();
    loadNotifications();
  }, [isAuthenticated, user, isLoading, router]);

  const fetchStudentData = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateFavoriteLanguage = async (newLanguage: string) => {
    try {
      const response = await fetch('/api/student/update-favorite-language', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ favoriteLanguage: newLanguage })
      });

      if (response.ok) {
        setStudentData((prev: any) => ({ ...prev, favoriteLanguage: newLanguage }));
        toast.success('Favorite language updated successfully!');
      } else {
        toast.error('Failed to update favorite language');
      }
    } catch (error) {
      console.error('Error updating favorite language:', error);
      toast.error('Failed to update favorite language');
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/student/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#E2E8F0] border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Loading</h2>
          <p className="text-sm text-[#64748B]">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isWindowMode) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {children}
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar border-r border-sidebar-border/50 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="text-sidebar-foreground font-semibold text-[15px] tracking-tight">Profectus</span>
                <span className="block text-[11px] text-sidebar-foreground/50 font-medium -mt-0.5">Student Portal</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5 text-sidebar-foreground/70" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentSection === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 text-[14px] font-medium rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${isActive
                    ? 'bg-sidebar-primary text-white shadow-lg shadow-primary/25'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="px-3 py-4 border-t border-white/8">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-sm font-semibold">
                  {(studentData?.name || user?.email || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {studentData?.name || user?.email || 'Student'}
                </p>
                <p className="text-[11px] text-sidebar-foreground/50 truncate">
                  {studentData?.department?.name || 'Student'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b border-border/60 h-20 flex items-center flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between w-full px-6 lg:px-8">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-pointer group"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              <div className="flex flex-col">
                <h1 className="text-[18px] font-bold text-foreground leading-tight tracking-tight">
                  {getSectionTitle(currentSection)}
                </h1>
                <p className="text-[12px] text-muted-foreground hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-all duration-200 cursor-pointer group border border-border/40"
                onClick={() => {
                  // Search functionality can be added here
                  toast.info('Search feature coming soon!');
                }}
              >
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground hidden lg:inline">Search...</span>
                <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground group"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-white animate-pulse" />
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-foreground">Notifications</h3>
                          {unreadCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-2 rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                          aria-label="Close notifications"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                            <Bell className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm font-medium text-foreground">All caught up!</p>
                          <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`px-5 py-4 hover:bg-secondary/50 cursor-pointer transition-all duration-200 group relative ${!notification.isRead ? 'bg-primary/5' : ''
                                } animate-in fade-in slide-in-from-top-1`}
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => {
                                setNotifications(prev =>
                                  prev.map(n =>
                                    n.id === notification.id ? { ...n, isRead: true } : n
                                  )
                                );
                              }}
                            >
                              {!notification.isRead && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === 'quiz' ? 'bg-indigo-100 text-indigo-600' :
                                  notification.type === 'career' ? 'bg-emerald-100 text-emerald-600' :
                                    notification.type === 'achievement' ? 'bg-amber-100 text-amber-600' :
                                      'bg-secondary text-muted-foreground'
                                  }`}>
                                  {notification.type === 'quiz' ? <Trophy className="w-5 h-5" /> :
                                    notification.type === 'career' ? <Target className="w-5 h-5" /> :
                                      notification.type === 'achievement' ? <Award className="w-5 h-5" /> :
                                        <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/70 mt-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-5 py-3 border-t border-border/60 bg-secondary/30">
                        <button
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            toast.success('All notifications marked as read');
                          }}
                          className="w-full text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer flex items-center justify-center gap-2 py-1"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 px-2 py-1.5 pr-3 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/40"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                      <span className="text-white text-sm font-bold">
                        {(studentData?.name || user?.email || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {(studentData?.name || user?.email || 'Student').split(' ')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {studentData?.department?.name || 'Student'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-y-0.5 hidden sm:block" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">
                              {(studentData?.name || user?.email || 'S').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {studentData?.name || user?.email || 'Student'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {user?.email}
                          </p>
                          {studentData?.registerNumber && (
                            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                              {studentData.registerNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          fetchStudentData();
                          setShowProfileModal(true);
                        }}
                        className="w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary/80 flex items-center gap-3 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Profile Settings</p>
                          <p className="text-xs text-muted-foreground">Manage your account</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          router.push('/student/settings');
                        }}
                        className="w-full text-left px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary/80 flex items-center gap-3 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <Settings className="w-4.5 h-4.5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Settings</p>
                          <p className="text-xs text-muted-foreground">Preferences & privacy</p>
                        </div>
                      </button>
                    </div>
                    <div className="border-t border-border/60 py-2">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                          toast.success('Logged out successfully');
                        }}
                        className="w-full text-left px-5 py-3 text-sm font-semibold text-destructive hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-950/60 transition-colors">
                          <LogOut className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Sign Out</p>
                          <p className="text-xs text-muted-foreground">See you next time!</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
                <h2 className="text-lg font-semibold text-[#0F172A]">Profile Settings</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 text-[#64748B]" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-72px)]">
                <div className="p-6 space-y-6">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-3 border-[#E2E8F0] border-t-[#4F46E5] rounded-full animate-spin" />
                    </div>
                  ) : studentData ? (
                    <>
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { label: 'Name', value: studentData.name, icon: User },
                            { label: 'Email', value: studentData.email, icon: User },
                            { label: 'Register Number', value: studentData.registerNumber, icon: User },
                            { label: 'Year', value: studentData.year, icon: User },
                          ].map((field) => (
                            <div key={field.label} className="space-y-1.5">
                              <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">{field.label}</label>
                              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                                <field.icon className="h-3.5 w-3.5 text-[#94A3B8]" />
                                <span className="text-sm text-[#0F172A]">{field.value || 'Not provided'}</span>
                              </div>
                            </div>
                          ))}
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Favorite Language</label>
                            <select
                              value={studentData?.favoriteLanguage || 'python'}
                              onChange={(e) => {
                                const newLanguage = e.target.value;
                                setStudentData((prev: any) => ({ ...prev, favoriteLanguage: newLanguage }));
                                updateFavoriteLanguage(newLanguage);
                              }}
                              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] text-sm text-[#0F172A] transition-all cursor-pointer"
                            >
                              <option value="python">Python 3</option>
                              <option value="javascript">JavaScript</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                              <option value="c">C</option>
                              <option value="csharp">C#</option>
                              <option value="go">Go</option>
                              <option value="rust">Rust</option>
                              <option value="php">PHP</option>
                              <option value="ruby">Ruby</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Department Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Department Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Department</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <GraduationCap className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{studentData.department?.name || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">College</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <GraduationCap className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{studentData.department?.college?.name || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Career Paths */}
                      {studentData.careerPaths && studentData.careerPaths.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Assigned Career Paths</h3>
                          <div className="space-y-2.5">
                            {studentData.careerPaths.map((careerPath: any) => (
                              <div key={careerPath.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-[#0F172A] text-sm">{careerPath.name}</h4>
                                    {careerPath.description && (
                                      <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">{careerPath.description}</p>
                                    )}
                                    <div className="text-[11px] text-[#94A3B8] mt-2 space-y-0.5">
                                      <p>Assigned: {new Date(careerPath.assignedAt).toLocaleDateString()}</p>
                                      {careerPath.assignedByUser && (
                                        <p>Assigned by: {careerPath.assignedByUser.name || careerPath.assignedByUser.email}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
                        <button
                          onClick={() => setShowProfileModal(false)}
                          className="px-5 py-2.5 text-sm font-medium text-[#334155] bg-[#F1F5F9] rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#64748B]">Failed to load profile data</p>
                      <button
                        onClick={() => fetchStudentData()}
                        className="mt-4 px-4 py-2 text-sm font-medium text-[#4F46E5] bg-[#EEF2FF] rounded-lg hover:bg-[#E0E7FF] transition-colors cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
