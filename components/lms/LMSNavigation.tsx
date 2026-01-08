'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';



interface LMSNavigationProps {
  studentName: string;
  department: string;
  notifications?: number;
  onNavigate: (section: string) => void;
  : string;
}

export default function LMSNavigation({ 
  studentName, 
  department, 
  notifications = 0,
  onNavigate}: LMSNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useStatesetLoading(false);
  const [profileOpen, setProfileOpen] = useStatesetLoading(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/lms' },
    { id: 'courses', label: 'My Courses', icon: '📚', path: '/lms/courses' },
    { id: 'quizzes', label: 'Quizzes', icon: '🧠', path: '/lms/quiz' },
    { id: 'assignments', label: 'Assignments', icon: '📝', path: '/lms/assignments' },
    { id: 'grades', label: 'Grades', icon: '📈', path: '/lms/grades' },
    { id: 'calendar', label: '', icon: '📅', path: '/lms/calendar' },
    { id: '', label: 'Resources', icon: '📁', path: '/lms/' },
    { id: 'settings', label: '', icon: '⚙️', path: '/lms/settings' }
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpensetLoading(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">NexusPath</h2>
                  <p className="text-sm text-gray-500">LMS Platform</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpensetLoading(false)}
              >
                <div className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpensetLoadingsetLoading(false);
                }}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {studentName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {department}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mr-4"
                onClick={() => setSidebarOpensetLoading(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">NexusPath LMS</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Learning Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                      {notifications}
                    </>
                  )}
                </Button>
              </div>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {studentName.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{studentName}</p>
                    <p className="text-xs text-gray-500">{department}</p>
                  </div>
                  <div className="w-4 h-4" />
                </Button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onNavigate('profile')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onNavigate('settings')}
                    >
                      <div className="w-4 h-4 mr-2" />
                      </Button>
                    <hr className="my-1" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
