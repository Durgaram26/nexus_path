'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StudentSidebarProps {
  student?: any;
  onNavigate: (section: string) => void;
  activeTab: string;
}

export default function StudentSidebar({ 
  student,
  onNavigate, 
  activeTab
}: StudentSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'profile', label: 'My Profile', icon: '👤', color: 'blue' },
    { id: 'career-paths', label: 'Career Paths', icon: '🎯', color: 'green' },
    { id: 'roadmaps', label: 'Learning Roadmaps', icon: '🗺️', color: 'purple' },
    { id: 'learning-plan', label: 'My Learning Plan', icon: '📋', color: 'orange' },
    { id: 'daily-quiz', label: 'Daily Quiz', icon: '🎯', color: 'teal' },
    { id: 'code-execution', label: 'Code Execution', icon: '💻', color: 'emerald' },
    { id: 'analytics', label: '& Analytics', icon: '📊', color: 'cyan' },
    { id: 'messages', label: 'Messages', icon: '💬', color: 'pink' },
    { id: '', label: 'Learning Resources', icon: '📚', color: 'indigo' },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
      teal: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100',
      pink: 'bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100'};
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-gray-900">Student Portal</h2>
              <p className="text-sm text-gray-600">Learning Dashboard</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1"
          >
            {isCollapsed ? '→' : '←'}
          </Button>
        </div>
      </div>

      {/* Student Info */}
      {!isCollapsed && student && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {student?.name?.charAt(0).toUpperCase() || 'S'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{student?.name || 'Student'}</p>
              <p className="text-xs text-gray-500">Year {student?.year || '1'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{student?.department?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Career Paths:</span>
              <Badge variant="outline" className="text-xs">
                {student?.careerPaths?.length || 0}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : getColorClasses(item.color)
              }`}
              onClick={() => {
                if (item.id === 'code-execution') {
                  // Navigate to code execution dashboard instead of opening popup directly
                  window.location.href = '/student/code-execution-dashboard';
                } else {
                  onNavigate(item.id);
                }
              }}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>


      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-medium text-sm text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate('daily-quiz')}
            >
              Daily Quiz
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate('learning-plan')}
            >
              My Learning Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate('roadmaps')}
            >
              View Roadmaps
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                window.location.href = '/student/code-execution-dashboard';
              }}
            >
              Code Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
