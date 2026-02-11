'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Activity,
  Clock,
  FileText,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
}

interface Task {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due: string;
  status: 'pending' | 'completed' | 'overdue';
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingEvaluations: 0,
    messagesCount: 0,
    totalAssessments: 0,
    completionRate: 0
  });

  const [recentSectorsActivity, setRecentSectorsActivity] = useState<Activity[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const statsRes = await fetch('/api/faculty/dashboard-stats', { headers });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalStudents: statsData.totalStudents || 0,
            activeCourses: statsData.activeCourses || 0,
            pendingEvaluations: statsData.pendingEvaluations || 0,
            messagesCount: statsData.messagesCount || 0,
            totalAssessments: statsData.totalAssessments || 0,
            completionRate: statsData.completionRate || 0
          });
          setRecentSectorsActivity(statsData.recentActivity || []);
          setPendingTasks(statsData.pendingTasks || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickStats = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: '#4F46E5', bg: '#EEF2FF', sub: 'Enrolled' },
    { title: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: '#10B981', bg: '#ECFDF5', sub: 'In progress' },
    { title: 'Pending Reviews', value: stats.pendingEvaluations, icon: FileText, color: '#F59E0B', bg: '#FFFBEB', sub: 'Needs action' },
    { title: 'Messages', value: stats.messagesCount, icon: MessageSquare, color: '#8B5CF6', bg: '#F5F3FF', sub: 'Unread' }
  ];

  const quickActions = [
    { title: 'Course Management', description: 'Create and manage your courses', href: '/faculty/course-management', icon: BookOpen },
    { title: 'Student Progress', description: 'Track student learning progress', href: '/faculty/students', icon: TrendingUp },
    { title: 'Certificate Evaluation', description: 'Review submitted certificates', href: '/faculty/certificate-evaluation', icon: FileText },
    { title: 'Workshop Management', description: 'Manage workshops and events', href: '/faculty/workshop-management', icon: Calendar }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#E2E8F0] border-t-[#0F172A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in p-6">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Faculty Portal</h1>
          <p className="text-[#64748B] mt-1 text-[15px]">
            Manage your academic responsibilities
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
            Create Course
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-[#64748B]">{stat.title}</p>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: stat.bg }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-[#0F172A]">{stat.value}</h3>
                </div>
                <p className="text-xs font-medium text-[#64748B] mt-2 flex items-center gap-1.5">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Academic Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.href} className="block group">
                    <Card className="h-full border-[#E2E8F0] shadow-sm group-hover:shadow-md group-hover:border-[#CBD5E1] transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#F8FAFC] group-hover:bg-[#EEF2FF] rounded-lg flex items-center justify-center transition-colors">
                            <Icon className="w-5 h-5 text-[#64748B] group-hover:text-[#4F46E5] transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#0F172A] text-sm group-hover:text-[#4F46E5] transition-colors flex items-center justify-between">
                              {action.title}
                              <ArrowUpRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#4F46E5]" />
                            </h3>
                            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <Card className="border-[#E2E8F0] bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-[#F8FAFC]">
                <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#0F172A]">
                  <AlertCircle className="h-4.5 w-4.5 text-[#F59E0B]" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {pendingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-[#EF4444]' :
                            task.priority === 'medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0F172A] truncate">{task.title}</p>
                          <p className="text-[12px] text-[#94A3B8]">Due: {task.due}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded capitalize">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <p className="text-[13px] text-[#64748B]">All caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-[#E2E8F0] bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-[#F8FAFC]">
                <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#0F172A]">
                  <Activity className="h-4.5 w-4.5 text-[#4F46E5]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {recentSectorsActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentSectorsActivity.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#0F172A] leading-tight">{activity.action}</p>
                          <p className="text-[11px] text-[#94A3B8] mt-1">{activity.user} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                    <p className="text-[13px] text-[#64748B]">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Add Calendar Widget or similar here if needed */}
          <Card className="bg-[#0F172A] text-white border-none shadow-md">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-2">Faculty Guide</h4>
              <p className="text-slate-300 text-sm mb-4">View the latest guidelines for continuous assessment implementation.</p>
              <Button variant="secondary" className="w-full bg-white text-[#0F172A] hover:bg-slate-100 font-medium">
                Download Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}