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

  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/faculty/dashboard' },
    { id: 'students', title: 'Student Management', icon: Users, href: '/faculty/students' },
    { id: 'student-list', title: 'Assigned Students', icon: GraduationCap, href: '/faculty/student-list' },
    { id: 'learning-management', title: 'Learning Management', icon: BookOpen, href: '/faculty/learning-management' },
    { id: 'course-management', title: 'Course Management', icon: BookMarked, href: '/faculty/course-management' },
    { id: 'workshop-management', title: 'Workshops', icon: Wrench, href: '/faculty/workshop-management' },
    { id: 'mentor-talks', title: 'Mentor Talks', icon: Users, href: '/faculty/mentor-talks' },
    { id: 'certificate-evaluation', title: 'Certificates', icon: Award, href: '/faculty/certificate-evaluation' },
    { id: 'resource-management', title: 'Resources', icon: BookOpen, href: '/faculty/resource-management' },
    { id: 'messaging', title: 'Messaging', icon: MessageSquare, href: '/faculty/messaging' },
    { id: 'analytics', title: 'Analytics', icon: BarChart3, href: '/faculty/analytics' },
    { id: 'settings', title: 'Settings', icon: Settings, href: '/faculty/settings' }
  ];

  const getCurrentSection = () => {
    if (!pathname) return 'dashboard';
    if (pathname === '/faculty/dashboard') return 'dashboard';
    const section = pathname.split('/faculty/')[1];
    return section || 'dashboard';
  };

  const currentSection = getCurrentSection();

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#E2E8F0] border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Loading</h2>
          <p className="text-sm text-[#64748B]">Loading faculty portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1E1B4B] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold text-[15px] tracking-tight">Profectus</span>
                <span className="block text-[11px] text-indigo-300/60 font-medium -mt-0.5">Faculty Portal</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5 text-indigo-200" />
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
                  className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 cursor-pointer ${isActive
                      ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-900/30'
                      : 'text-indigo-200/70 hover:bg-white/8 hover:text-white'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Faculty Info */}
          <div className="px-3 py-4 border-t border-white/8">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {(facultyData?.name || user?.email || 'F').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {facultyData?.name || user?.email || 'Faculty'}
                </p>
                <p className="text-[11px] text-indigo-300/50 truncate">
                  {facultyData?.department?.name || 'Faculty'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-6 h-16 flex items-center flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5 text-[#64748B]" />
              </button>

              <h1 className="text-[17px] font-semibold text-[#0F172A]">
                {getSectionTitle(currentSection)}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[#F1F5F9] relative transition-colors cursor-pointer">
                <Bell className="w-[18px] h-[18px] text-[#64748B]" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {(facultyData?.name || user?.email || 'F').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#334155] hidden sm:block">{facultyData?.name || user?.email || 'Faculty'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] z-50 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F1F5F9]">
                      <p className="text-sm font-semibold text-[#0F172A]">{facultyData?.name || user?.email || 'Faculty'}</p>
                      <p className="text-[12px] text-[#94A3B8] mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          fetchFacultyData();
                          setShowProfileModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#94A3B8]" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close profile dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowProfileDropdown(false)}
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
                  ) : facultyData ? (
                    <>
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Name</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <User className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{facultyData.name || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Email</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{facultyData.email}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Gender</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <span className="capitalize text-sm text-[#0F172A]">{facultyData.gender?.toLowerCase() || 'Not specified'}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Phone</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{facultyData.phoneNumber || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Department Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Department Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">College</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <Building className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{facultyData.department?.college?.name || 'Not assigned'}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide">Department</label>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#F1F5F9]">
                              <GraduationCap className="h-3.5 w-3.5 text-[#94A3B8]" />
                              <span className="text-sm text-[#0F172A]">{facultyData.department?.name || 'Not assigned'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Permissions */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Permissions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF]">
                            <div>
                              <h4 className="font-semibold text-[#312E81] text-sm">Cross-Department Access</h4>
                              <p className="text-[13px] text-[#4338CA]/70 mt-0.5">
                                {facultyData.canAssignCrossDepartment
                                  ? 'Can manage students across multiple departments'
                                  : 'Can only manage students in your department'
                                }
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${facultyData.canAssignCrossDepartment
                                ? 'bg-[#10B981]/10 text-[#059669]'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                              }`}>
                              {facultyData.canAssignCrossDepartment ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>

                          {facultyData.assignedYears && (
                            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                              <h4 className="font-semibold text-[#0F172A] text-sm mb-1">Assigned Years</h4>
                              <p className="text-[13px] text-[#64748B]">{facultyData.assignedYears}</p>
                            </div>
                          )}

                          {facultyData.allowedDepartments && (
                            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                              <h4 className="font-semibold text-[#0F172A] text-sm mb-1">Allowed Departments</h4>
                              <p className="text-[13px] text-[#64748B]">{facultyData.allowedDepartments}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-4">Account Information</h3>
                        <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                          <div>
                            <h4 className="font-semibold text-[#0F172A] text-sm">Account Status</h4>
                            <p className="text-[13px] text-[#64748B] mt-0.5">
                              Created: {facultyData.createdAt ? new Date(facultyData.createdAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-[#10B981]/10 text-[#059669] rounded-full text-[11px] font-semibold">
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Close button */}
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
