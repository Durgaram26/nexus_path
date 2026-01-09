'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Route, 
  UserPlus,
  BarChart3,
  Settings,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    totalDepartments: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalCareerPaths: 0,
    totalRoadmaps: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; user: string; time: string }>>([]);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // Get auth token for API calls
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No auth token found, using default stats');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch admin statistics from dedicated API
        console.log('Fetching admin stats with token:', token ? 'Present' : 'Missing');
        const statsRes = await fetch('/api/admin/stats', { headers });
        
        console.log('Stats API response status:', statsRes.status);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          console.log('Admin stats response:', statsData);
          
          if (statsData.success && statsData.stats) {
            console.log('Setting stats from API:', statsData.stats);
            setStats({
              totalUsers: statsData.stats.totalUsers || 0,
              totalColleges: statsData.stats.totalColleges || 0,
              totalDepartments: statsData.stats.totalDepartments || 0,
              totalFaculty: statsData.stats.totalFaculty || 0,
              totalStudents: statsData.stats.totalStudents || 0,
              totalCareerPaths: statsData.stats.totalCareerPaths || 0,
              totalRoadmaps: statsData.stats.totalRoadmaps || 0
            });
          } else {
            console.log('Stats API returned unsuccessful response:', statsData);
            setStats({
              totalUsers: 0,
              totalColleges: 0,
              totalDepartments: 0,
              totalFaculty: 0,
              totalStudents: 0,
              totalCareerPaths: 0,
              totalRoadmaps: 0
            });
          }
        } else {
          const errorText = await statsRes.text();
          console.log('Stats API failed:', statsRes.status, statsRes.statusText, errorText);
          setStats({
            totalUsers: 0,
            totalColleges: 0,
            totalDepartments: 0,
            totalFaculty: 0,
            totalStudents: 0,
            totalCareerPaths: 0,
            totalRoadmaps: 0
          });
        }

        // TODO: Add API call to fetch recent activity when endpoint is available
        // For now, set empty array to show "No Recent Activity" message
        setRecentActivity([]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set some default stats if API fails
        setStats({
          totalUsers: 0,
          totalColleges: 0,
          totalDepartments: 0,
          totalFaculty: 0,
          totalStudents: 0,
          totalCareerPaths: 0,
          totalRoadmaps: 0
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Quick stats cards
  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Faculty',
      value: stats.totalFaculty,
      icon: UserCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Provision Accounts',
      description: 'Generate accounts for faculty and students',
      href: '/admin/provision-accounts',
      icon: UserPlus,
      color: 'bg-blue-500'
    },
    {
      title: 'Add College',
      description: 'Create a new college',
      href: '/admin/college',
      icon: Building2,
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'System performance and insights',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h2>
          <p className="text-blue-100">Manage your educational institution with ease</p>
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
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h2>
        <p className="text-blue-100">Manage your educational institution with ease</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-600">Activity will appear here as users interact with the system</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students vs Faculty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>User Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Students</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Faculty</span>
                <span className="text-lg font-bold text-green-600">{stats.totalFaculty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Users</span>
                <span className="text-lg font-bold text-gray-900">{stats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Departments</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalDepartments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Career Paths</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalCareerPaths}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Roadmaps</span>
                <span className="text-lg font-bold text-green-600">{stats.totalRoadmaps || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
