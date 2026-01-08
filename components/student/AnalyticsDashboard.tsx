'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Award, Activity, Target } from 'lucide-react';
import { PerformanceOverviewChart, QuizPerformanceChart, CodingTestPerformanceChart, CombinedPerformanceChart, StudyTimeChart, LearningProgressChart, SkillsRadarChart, AchievementProgress } from '@/components/ui/charts';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface Stats {
  totalQuizzes: number;
  averageScore: number;
  studyHours: number;
  streak: number;
}

interface AnalyticsData {
  performanceData: unknown[];
  quizData: unknown[];
  codingTestData: unknown[];
  codingTestPerformanceData: unknown[];
  learningData: unknown[];
  skillsData: unknown[];
  studyTimeData: unknown[];
  achievements: Achievement[];
  stats: Stats;
  activities: unknown[];
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real analytics data from API
  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching analytics data with token:', token ? 'Token present' : 'No token');
      
      const response = await api.get('/student/analytics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Analytics API response:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      // Show toast notification for user feedback
      toast.error('Failed to load analytics data. Please try again.');
      
      // Return empty data structure on error
      return {
        performanceData: [],
        quizData: [],
        codingTestData: [],
        codingTestPerformanceData: [],
        learningData: [],
        skillsData: [],
        studyTimeData: [],
        achievements: [],
        stats: {
          totalQuizzes: 0,
          averageScore: 0,
          studyHours: 0,
          streak: 0
        },
        activities: []
      };
    }
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        toast.error('Failed to load analytics data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'coding', label: 'Coding Tests', icon: Target },
    { id: 'learning', label: 'Learning', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your learning and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              setLoading(true);
              try {
                const data = await fetchAnalyticsData();
                setAnalyticsData(data);
                toast.success('Analytics data refreshed successfully!');
              } catch (error) {
                console.error('Failed to refresh analytics data:', error);
                toast.error('Failed to refresh data. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button variant="outline" size="sm">
            <div className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold">{(analyticsData.stats as any)?.totalQuizzes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{(analyticsData.stats as any)?.averageScore || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold">{(analyticsData.stats as any)?.studyHours || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold">{(analyticsData.stats as any)?.streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Combined Performance</h3>
              <div className="h-64">
                <CombinedPerformanceChart 
                  quizData={analyticsData?.quizData || []} 
                  codingData={analyticsData?.codingTestData || []} 
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quiz Performance</h3>
              <div className="h-64">
                <QuizPerformanceChart data={analyticsData?.quizData || []} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="h-64">
                <PerformanceOverviewChart data={analyticsData?.performanceData || []} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Study Time</h3>
              <div className="h-64">
                <StudyTimeChart data={analyticsData?.studyTimeData || []} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'coding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coding Test Performance</h3>
              <div className="h-64">
                <CodingTestPerformanceChart data={analyticsData?.codingTestPerformanceData || []} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Combined Performance</h3>
              <div className="h-64">
                <CombinedPerformanceChart 
                  quizData={analyticsData?.quizData || []} 
                  codingData={analyticsData?.codingTestData || []} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <LearningProgressChart data={analyticsData?.learningData || []} />
          </div>
          <div className="h-64">
            <SkillsRadarChart data={analyticsData?.skillsData || []} />
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AchievementProgress achievements={analyticsData?.achievements || []} />
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Learning Goals</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Your current learning objectives</p>
              <div className="space-y-4">
                {analyticsData?.stats && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Complete 10 quizzes this month</span>
                        <span className="text-green-600">{analyticsData.stats.totalQuizzes}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(analyticsData.stats.totalQuizzes * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Maintain 80% average score</span>
                        <span className="text-blue-600">{analyticsData.stats.averageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(analyticsData.stats.averageScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Study {analyticsData.stats.studyHours} hours this week</span>
                        <span className="text-purple-600">In Progress</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(analyticsData.stats.studyHours * 5, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
