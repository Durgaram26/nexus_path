'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award, Activity } from 'lucide-react';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Performance Overview Chart
export function PerformanceOverviewChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Performance Overview</CardTitle>
          </div>
          <CardDescription>Your learning over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Performance Data Yet</p>
              <p className="text-sm">Complete some quizzes to see your progress over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Performance Overview</CardTitle>
        </div>
        <CardDescription>Your learning over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data as { month: string; score: number }[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Quiz Performance Chart
export function QuizPerformanceChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle>Quiz Performance</CardTitle>
          </div>
          <CardDescription>Your quiz scores by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Quiz Data Yet</p>
              <p className="text-sm">Take some quizzes to see your performance breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          <CardTitle>Quiz Performance</CardTitle>
        </div>
        <CardDescription>Your quiz scores by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data as { subject: string; score: number }[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Learning Chart
export function LearningProgressChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <CardTitle>Learning Progress</CardTitle>
          </div>
          <CardDescription>Topics completed by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Learning Data Yet</p>
              <p className="text-sm">Complete topics to see your progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          <CardTitle>Learning Progress</CardTitle>
        </div>
        <CardDescription>Topics completed by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as { name: string; value: number }[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Skills Radar Chart
export function SkillsRadarChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            <CardTitle>Skills Assessment</CardTitle>
          </div>
          <CardDescription>Your proficiency in different areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Skills Data Yet</p>
              <p className="text-sm">Complete assessments to see your skills</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-600" />
          <CardTitle>Skills Assessment</CardTitle>
        </div>
        <CardDescription>Your proficiency in different areas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data as { subject: string; level: number }[]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Proficiency"
                dataKey="level"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Study Time Chart
export function StudyTimeChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <CardTitle>Study Time Distribution</CardTitle>
          </div>
          <CardDescription>Hours spent on different subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Study Time Data Yet</p>
              <p className="text-sm">Complete some quizzes to see your study time distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <CardTitle>Study Time Distribution</CardTitle>
        </div>
        <CardDescription>Hours spent on different subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as { subject: string; hours: number }[]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="subject" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="hours" fill="#82CA9D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Achievement Progress
export function AchievementProgress({ achievements }: { achievements: { id: string; title: string; description: string; completed: boolean }[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          <CardTitle>Achievements</CardTitle>
        </div>
        <CardDescription>Your learning milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">{achievement.title}</p>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            </div>
            <Badge variant={achievement.completed ? "default" : "secondary"}>
              {achievement.completed ? "Completed" : "In Progress"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Quick Stats Cards
export function QuickStatsCards({ stats }: { stats: { totalQuizzes: number; averageScore: number; studyHours: number; streak: number } }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={stats.averageScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
              <p className="text-2xl font-bold">{stats.studyHours}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+5h this week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak</p>
              <p className="text-2xl font-bold">{stats.streak} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Keep it up!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Recent Activity Timeline
export function RecentActivityTimeline({ activities }: { activities: { id: string; title: string; description: string; time: string; type: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
        <CardDescription>Your latest learning activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Coding Test Performance Chart
export function CodingTestPerformanceChart({ data }: { data: unknown[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle>Coding Test Performance</CardTitle>
          </div>
          <CardDescription>Your coding test results over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Coding Test Data Yet</p>
              <p className="text-sm">Complete some coding tests to see your performance over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          <CardTitle>Coding Test Performance</CardTitle>
        </div>
        <CardDescription>Your coding test results over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: any) => [
                  name === 'successRate' ? `${value}%` : value,
                  name === 'successRate' ? 'Success Rate' :
                    name === 'totalTests' ? 'Total Tests' :
                      name === 'avgExecutionTime' ? 'Avg Execution Time (ms)' : name
                ]}
              />
              <Area
                type="monotone"
                dataKey="successRate"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="successRate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Combined Performance Chart (Quiz + Coding Tests)
export function CombinedPerformanceChart({ quizData, codingData }: { quizData: unknown[], codingData: unknown[] }) {
  if ((!quizData || quizData.length === 0) && (!codingData || codingData.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Combined Performance</CardTitle>
          </div>
          <CardDescription>Your overall learning performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Performance Data Yet</p>
              <p className="text-sm">Complete quizzes and coding tests to see your progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use coding data as it contains the combined performance data with both quiz and coding scores
  const chartData = codingData.length > 0 ? codingData : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Combined Performance</CardTitle>
        </div>
        <CardDescription>Quiz scores and coding test success rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: any) => [
                  name === 'quizScore' ? `${value}%` :
                    name === 'codingSuccess' ? `${value}%` : value,
                  name === 'quizScore' ? 'Quiz Score' :
                    name === 'codingSuccess' ? 'Coding Success Rate' : name
                ]}
              />
              <Area
                type="monotone"
                dataKey="quizScore"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="quizScore"
              />
              <Area
                type="monotone"
                dataKey="codingSuccess"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="codingSuccess"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}