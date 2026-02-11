'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  Route,
  UserPlus,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { themes, getTheme, setTheme } from '@/lib/theme-config';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('indigo');

  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { id: 'user-management', title: 'User Management', icon: Users, href: '/admin/user-management' },
    { id: 'college', title: 'College Management', icon: Building2, href: '/admin/college' },
    { id: 'departments', title: 'Departments', icon: GraduationCap, href: '/admin/departments' },
    { id: 'faculty', title: 'Faculty Management', icon: UserCheck, href: '/admin/faculty' },
    { id: 'students', title: 'Student Management', icon: Users, href: '/admin/students' },
    // { id: 'career-paths', title: 'Career Paths', icon: Route, href: '/admin/career-paths' }, // Removed from sidebar
    { id: 'provision-accounts', title: 'Account Provisioning', icon: UserPlus, href: '/admin/provision-accounts' },
    { id: 'analytics', title: 'System Analytics', icon: BarChart3, href: '/admin/analytics' },
    { id: 'settings', title: 'Settings', icon: Settings, href: '/admin/settings' }
  ];

  const getCurrentSection = () => {
    if (!pathname) return 'dashboard';
    if (pathname === '/admin') return 'dashboard';
    const section = pathname.split('/admin/')[1];
    return section || 'dashboard';
  };

  const currentSection = getCurrentSection();

  const getSectionTitle = (section: string) => {
    const item = navigationItems.find(item => item.id === section);
    return item ? item.title : 'Admin Dashboard';
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    // initialize current theme from localStorage
    try {
      const t = getTheme();
      setCurrentTheme(t);
    } catch (e) {
      // ignore
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#E2E8F0] border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Loading</h2>
          <p className="text-sm text-[#64748B]">Loading admin portal...</p>
        </div>
      </div>
    );
  }

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
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="text-sidebar-foreground font-semibold text-[15px] tracking-tight">Profectus</span>
                <span className="block text-[11px] text-sidebar-foreground/50 font-medium -mt-0.5">Admin Panel</span>
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
                <span className="text-white text-sm font-semibold">{(user?.email || 'A').charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email || 'Admin'}</p>
                <p className="text-[11px] text-sidebar-foreground/50 truncate">Administrator</p>
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
            {/* Left */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-pointer group"
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

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[#F1F5F9] relative transition-colors cursor-pointer">
                <Bell className="w-[18px] h-[18px] text-[#64748B]" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 px-2 py-1.5 pr-3 rounded-xl hover:bg-secondary/80 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/40"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                      <span className="text-white text-sm font-bold">
                        {(user?.email || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-foreground leading-tight">{user?.email || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground leading-tight">Administrator</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all hidden sm:block" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">{(user?.email || 'A').charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{user?.email || 'Admin'}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      {/* Theme selector removed */}
                    </div>
                    <div className="border-t border-border/60 py-2">
                      <button
                        onClick={() => { setShowProfileDropdown(false); logout(); }}
                        className="w-full text-left px-5 py-3 text-sm font-semibold text-destructive hover:bg-red-50 flex items-center gap-3 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Sign Out</p>
                          <p className="text-xs text-muted-foreground">Sign out of admin</p>
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

      {/* Click outside to close profile dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  );
}
