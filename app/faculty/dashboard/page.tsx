'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  MessageSquare,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  GraduationCap,
  FileText,
  Calendar
} from 'lucide-react';

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
}

interface Task {
  id: number;
  task: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedStudents: 0,
    totalResources: 0,
    unreadMessages: 0,
    upcomingAssignments: 0,
    completedAssignments: 0
  });

  const [facultyName, setFacultyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Fetch faculty dashboard statistics
    const fetchStats = async () => {
      try {
        // Get auth token for API calls
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No auth token found, using default stats');
          setIsLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch faculty-specific data
        const [profileRes, assignedStudentsRes, resourcesRes] = await Promise.all([
          fetch('/api/faculty/profile', { headers }),
          fetch('/api/faculty/assigned-students', { headers }),
          fetch('/api/faculty/learning-resources', { headers })
        ]);

        const [profile, assignedStudentsData, resources] = await Promise.all([
          profileRes.ok ? profileRes.json() : null,
          assignedStudentsRes.ok ? assignedStudentsRes.json() : { students: [] },
          resourcesRes.ok ? resourcesRes.json() : []
        ]);

        // Set faculty name
        if (profile && profile.name) {
          setFacultyName(profile.name);
        }

        // Extract students from the assigned-students response
        const assignedStudents = assignedStudentsData?.students || [];
        
        setStats({
          totalStudents: Array.isArray(assignedStudents) ? assignedStudents.length : 0,
          assignedStudents: Array.isArray(assignedStudents) ? assignedStudents.length : 0,
          totalResources: Array.isArray(resources?.learningResources) ? resources.learningResources.length : 0,
          unreadMessages: 0, // Messages API not implemented yet
          upcomingAssignments: 0,
          completedAssignments: 0
        });
      } catch (error) {
        console.error('Error fetching faculty stats:', error);
        // Set some default stats if API fails
        setStats({
          totalStudents: 0,
          assignedStudents: 0,
          totalResources: 0,
          unreadMessages: 0,
          upcomingAssignments: 0,
          completedAssignments: 0
        });
    } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Quick stats cards
  const quickStats = [
    {
      title: 'Assigned Students',
      value: stats.assignedStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Learning Resources',
      value: stats.totalResources,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Upcoming Tasks',
      value: upcomingTasks.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '',
      changeType: 'neutral'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Manage Students',
      description: 'View and manage your assigned students',
      href: '/faculty/students',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Learning Resources',
      description: 'Create and manage learning materials',
      href: '/faculty/resource-management',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Student performance and insights',
      href: '/faculty/analytics',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  if (isLoading) {
  return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {facultyName || 'Faculty'}! 👋</h2>
          <p className="text-blue-100">Manage your students and teaching resources</p>
        </div>

        {/* Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
        
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty dashboard...</p>
        </div>
              </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {facultyName || 'Faculty'}! 👋</h2>
        <p className="text-blue-100">Manage your students and teaching resources effectively</p>
                </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.change && (
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <IconComponent className="w-6 h-6" />
                </div>
                <div className="ml-4">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
              </Link>
            );
          })}
        </div>
      </div>
          
      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.user}</p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity to display.</p>
                    <p className="text-sm text-gray-500 mt-2">Activity will appear here as you interact with students and resources.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          
        {/* Upcoming Tasks */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Tasks</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.task}</p>
                          <p className="text-xs text-gray-500">Due: {task.due}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming tasks scheduled.</p>
                    <p className="text-sm text-gray-500 mt-2">Tasks will appear here as they are assigned or created.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

      {/* Teaching Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Student Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.totalStudents > 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Performance data will be available once students are assigned and complete assignments.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students assigned yet. Performance data will appear here once you have students.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teaching Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Teaching Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Lecture Materials</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalResources}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Assignments</span>
                <span className="text-lg font-bold text-green-600">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Quizzes</span>
                <span className="text-lg font-bold text-purple-600">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Resources Shared</span>
                <span className="text-lg font-bold text-orange-600">{stats.totalResources}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}