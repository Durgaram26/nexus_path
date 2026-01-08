'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Mail,
  Building,
  Phone,
  Calendar,
  BookMarked,
  Wrench,
  Award
} from 'lucide-react';

interface FacultyLayoutProps {
  children: React.ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [facultyData, setFacultyData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Navigation items for faculty
  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/faculty/dashboard' },
    { id: 'students', title: 'Student Management', icon: Users, href: '/faculty/students' },
    { id: 'student-list', title: 'My Assigned Students', icon: GraduationCap, href: '/faculty/student-list' },
    { id: 'learning-management', title: 'Learning Management', icon: BookOpen, href: '/faculty/learning-management' },
    { id: 'course-management', title: 'Course Management', icon: BookMarked, href: '/faculty/course-management' },
    { id: 'workshop-management', title: 'Workshop Management', icon: Wrench, href: '/faculty/workshop-management' },
    { id: 'mentor-talks', title: 'Industry Mentor Talks', icon: Users, href: '/faculty/mentor-talks' },
    { id: 'certificate-evaluation', title: 'Certificate Evaluation', icon: Award, href: '/faculty/certificate-evaluation' },
    { id: 'resource-management', title: 'Resource Management', icon: BookOpen, href: '/faculty/resource-management' },
    { id: 'messaging', title: 'Messaging', icon: MessageSquare, href: '/faculty/messaging' },
    { id: 'analytics', title: 'Student Analytics', icon: BarChart3, href: '/faculty/analytics' },
    { id: 'settings', title: 'Settings', icon: Settings, href: '/faculty/settings' }
  ];

  // Get current section from pathname
  const getCurrentSection = () => {
    if (!pathname) return 'dashboard';
    if (pathname === '/faculty/dashboard') return 'dashboard';
    const section = pathname.split('/faculty/')[1];
    return section || 'dashboard';
  };

  const currentSection = getCurrentSection();

  // Get section title
  const getSectionTitle = (section: string) => {
    const item = navigationItems.find(item => item.id === section);
    return item ? item.title : 'Faculty Dashboard';
  };

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user?.role !== 'faculty') {
      router.push('/unauthorized');
      return;
    }

    // Fetch faculty data on load
    fetchFacultyData();
  }, [isAuthenticated, user, isLoading, router]);

  const fetchFacultyData = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/faculty/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFacultyData(data);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading faculty portal...</p>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Faculty Portal</h1>
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
              <button className="p-2 rounded-md hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{facultyData?.name || user?.name || user?.email || 'Faculty'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{facultyData?.name || user?.name || user?.email || 'Faculty'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          fetchFacultyData();
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

      {/* Click outside to close profile dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileDropdown(false)}
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
                  ) : facultyData ? (
                    <>
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <User className="h-4 w-4 text-gray-500" />
                              <span>{facultyData.name || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{facultyData.email}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <span className="capitalize">{facultyData.gender?.toLowerCase() || 'Not specified'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{facultyData.phoneNumber || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Department Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">College</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span>{facultyData.department?.college?.name || 'Not assigned'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                              <GraduationCap className="h-4 w-4 text-gray-500" />
                              <span>{facultyData.department?.name || 'Not assigned'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Permissions */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Faculty Permissions</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-blue-900">Cross-Department Access</h4>
                              <p className="text-sm text-blue-700">
                                {facultyData.canAssignCrossDepartment 
                                  ? 'You can manage students across multiple departments'
                                  : 'You can only manage students in your department'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                facultyData.canAssignCrossDepartment 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {facultyData.canAssignCrossDepartment ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>

                          {facultyData.assignedYears && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Assigned Years</h4>
                              <p className="text-sm text-gray-600">{facultyData.assignedYears}</p>
                            </div>
                          )}

                          {facultyData.allowedDepartments && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Allowed Departments</h4>
                              <p className="text-sm text-gray-600">{facultyData.allowedDepartments}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Account Status</h4>
                            <p className="text-sm text-gray-600">
                              Created: {facultyData.createdAt ? new Date(facultyData.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Failed to load profile data</p>
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
