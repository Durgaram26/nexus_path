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
  TestTube,
  Brain,
  Award,
  Wrench
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

  // Check if current page is quiz window, code window, or test window - if so, render without sidebar
  const isQuizWindow = pathname?.includes('/quiz-window');
  const isCodeWindow = pathname?.includes('/code-window');
  const isTestWindow = pathname?.includes('/code-test-old');
  const isWindowMode = isQuizWindow || isCodeWindow || isTestWindow;

  // Navigation items for student
  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/student/career-dashboard' },
    { id: 'career-paths', title: 'Career Paths', icon: Target, href: '/student/career-paths' },
    { id: 'roadmap', title: 'Learning Roadmap', icon: Brain, href: '/student/roadmap' },
    { id: 'learning-plan', title: 'My Learning Plan', icon: Calendar, href: '/student/learning-plan' },
    { id: 'courses', title: 'My Courses', icon: BookOpen, href: '/student/courses' },
    { id: 'workshops', title: 'My Workshops', icon: Wrench, href: '/student/workshops' },
    { id: 'mentor-talks', title: 'Industry Mentor Talks', icon: Users, href: '/student/mentor-talks' },
    { id: 'certificate-submission', title: 'Certificate Submission', icon: Award, href: '/student/certificate-submission' },
    { id: 'code-test', title: 'Code Test', icon: Code, href: '/student/code-test' },
    { id: 'daily-quiz', title: 'Daily Quiz', icon: Trophy, href: '/student/daily-quiz' },
    { id: 'analytics', title: 'Analytics & Insights', icon: BarChart3, href: '/student/analytics' },
    { id: 'messages', title: 'Messages', icon: MessageSquare, href: '/student/messages' }
  ];

  // Get current section from pathname
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

    // Fetch student data on load
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
        // Update local state
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
      // Set empty notifications if API fails
      setNotifications([]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // For quiz window, code window, or test window, render without sidebar
  if (isWindowMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo/Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Student Info */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {studentData?.name || user?.email || 'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {studentData?.department?.name || 'Student'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Section title */}
            <h1 className="text-xl font-semibold text-gray-900">
              {getSectionTitle(currentSection)}
            </h1>
            
            {/* Profile menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-md hover:bg-gray-100 relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                // Mark as read
                                setNotifications(prev => 
                                  prev.map(n => 
                                    n.id === notification.id ? { ...n, isRead: true } : n
                                  )
                                );
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'quiz' ? 'bg-blue-500' :
                                  notification.type === 'career' ? 'bg-green-500' :
                                  notification.type === 'achievement' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${
                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                          }}
                          className="w-full text-sm text-blue-600 hover:text-blue-800"
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
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{studentData?.name || user?.email || 'Student'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{studentData?.name || user?.email || 'Student'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          fetchStudentData();
                          setShowProfileModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-6 space-y-6">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : studentData ? (
                    <>
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.name || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.email || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Register Number</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.registerNumber || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Year</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.year || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Favorite Language</label>
                            <select 
                              value={studentData?.favoriteLanguage || 'python'}
                              onChange={(e) => {
                                const newLanguage = e.target.value;
                                setStudentData((prev: any) => ({ ...prev, favoriteLanguage: newLanguage }));
                                // Update the language in the backend
                                updateFavoriteLanguage(newLanguage);
                              }}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.department?.name || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">College</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{studentData.department?.college?.name || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Career Paths */}
                      {studentData.careerPaths && studentData.careerPaths.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Career Paths</h3>
                          <div className="space-y-3">
                            {studentData.careerPaths.map((careerPath: any) => (
                              <div key={careerPath.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{careerPath.name}</h4>
                                    {careerPath.description && (
                                      <p className="text-sm text-gray-600 mt-1">{careerPath.description}</p>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2 space-y-1">
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
                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowProfileModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Failed to load profile data</p>
                      <button
                        onClick={() => {
                          fetchStudentData();
                        }}
                        className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
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
