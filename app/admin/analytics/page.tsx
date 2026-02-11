'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const progressData = [
  { month: 'Jan', progress: 12 },
  { month: 'Feb', progress: 25 },
  { month: 'Mar', progress: 35 },
  { month: 'Apr', progress: 48 },
  { month: 'May', progress: 60 },
  { month: 'Jun', progress: 72 },
  { month: 'Jul', progress: 80 },
  { month: 'Aug', progress: 86 },
  { month: 'Sep', progress: 90 },
  { month: 'Oct', progress: 92 },
  { month: 'Nov', progress: 95 },
  { month: 'Dec', progress: 98 }
];

const careerCounts = [
  { name: 'Web Dev', count: 120 },
  { name: 'Data Science', count: 80 },
  { name: 'Cloud', count: 60 },
  { name: 'Embedded', count: 40 }
];

const roles = [
  { name: 'Students', value: 320 },
  { name: 'Faculty', value: 45 },
  { name: 'Admins', value: 5 }
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Analytics</h1>
          <p className="text-sm text-muted-foreground">Overview of student progress, career path assignments and system metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Student Progress (monthly)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={progressData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Role Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roles} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {roles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Career Path Popularity</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={careerCounts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Interactive Career Path Stats</h3>
          <p className="text-sm text-muted-foreground">This section will host interactive graphs and network visualizations for career-path progress and transitions. Integrate a graph library (e.g., vis-network or cytoscape) later for detailed interactive displays.</p>
        </div>
      </div>
    </div>
  );
}
