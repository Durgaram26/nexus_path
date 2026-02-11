'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  UserPlus,
  BarChart3,
  Settings,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
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
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const statsRes = await fetch('/api/admin/stats', { headers });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.stats) {
            setStats({
              totalUsers: statsData.stats.totalUsers || 0,
              totalColleges: statsData.stats.totalColleges || 0,
              totalDepartments: statsData.stats.totalDepartments || 0,
              totalFaculty: statsData.stats.totalFaculty || 0,
              totalStudents: statsData.stats.totalStudents || 0,
              totalCareerPaths: statsData.stats.totalCareerPaths || 0,
              totalRoadmaps: statsData.stats.totalRoadmaps || 0
            });
          }
        }
        setRecentActivity([]); // Placeholder for now
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickStats = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: '#4F46E5', bg: '#EEF2FF', sub: '+12% this month' },
    { title: 'Students', value: stats.totalStudents, icon: GraduationCap, color: '#10B981', bg: '#ECFDF5', sub: 'Active learners' },
    { title: 'Faculty', value: stats.totalFaculty, icon: UserCheck, color: '#F59E0B', bg: '#FFFBEB', sub: 'Verified staff' },
    { title: 'Colleges', value: stats.totalColleges, icon: Building2, color: '#8B5CF6', bg: '#F5F3FF', sub: 'Partner institutions' }
  ];

  const quickActions = [
    { title: 'Provision Accounts', description: 'Generate bulk accounts for new academic year', href: '/admin/provision-accounts', icon: UserPlus },
    { title: 'Manage Colleges', description: 'Add or update college details and settings', href: '/admin/college', icon: Building2 },
    { title: 'System Analytics', description: 'View detailed platform usage reports', href: '/admin/analytics', icon: BarChart3 }
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
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Admin Console</h1>
          <p className="text-[#64748B] mt-1 text-[15px]">
            System overview and management controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-[#64748B]">System Operational</span>
          </div>
          <Button variant="outline" className="border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200">
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
                  <TrendingUp className="w-3 h-3 text-[#10B981]" />
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
              <h2 className="text-lg font-bold text-[#0F172A]">Management Shortcuts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.href} className="block group">
                    <Card className="h-full border-[#E2E8F0] shadow-sm group-hover:shadow-md group-hover:border-[#CBD5E1] transition-all">
                      <CardContent className="p-6">
                        <div className="w-10 h-10 bg-[#F8FAFC] group-hover:bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4 transition-colors">
                          <Icon className="w-5 h-5 text-[#64748B] group-hover:text-[#4F46E5] transition-colors" />
                        </div>
                        <h3 className="font-semibold text-[#0F172A] text-sm mb-1.5 group-hover:text-[#4F46E5] transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* System Health / Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#E2E8F0] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#F8FAFC]">
                <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#64748B]">Firewall Status</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#64748B]">Last Backup</span>
                    <span className="text-sm font-medium text-[#0F172A]">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#64748B]">Failed Logins (24h)</span>
                    <span className="text-sm font-medium text-[#0F172A]">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#F8FAFC]">
                <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4F46E5]" />
                  Platform Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#64748B]">Storage Usage</span>
                      <span className="font-bold text-[#0F172A]">45%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                      <div className="bg-[#4F46E5] h-1.5 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#64748B]">API Requests</span>
                      <span className="font-bold text-[#0F172A]">62%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                      <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          <Card className="border-[#E2E8F0] shadow-sm h-full">
            <CardHeader className="pb-3 border-b border-[#F8FAFC]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#0F172A]">Audit Log</CardTitle>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-[#4F46E5]">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#0F172A] font-medium leading-none">{activity.action}</p>
                        <p className="text-xs text-[#64748B] mt-1">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-10 h-10 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                  <p className="text-sm text-[#64748B]">No recent system events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
