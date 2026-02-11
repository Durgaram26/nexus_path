'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoadmapCard from '@/components/student/RoadmapCard';
import LearningResourcesSection from '@/components/student/LearningResourcesSection';
import {
  Target,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Trophy,
  BookOpen
} from 'lucide-react';

// ======================
// Interfaces
// ======================

interface Department {
  id: number;
  name: string;
  college: {
    id: number;
    name: string;
  };
}

interface Student {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  department: Department;
  year: number;
  registerNumber: string;
  favoriteLanguage?: string;
}

interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: string;
  learningPath: string;
  careerOutcomes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  createdByUser: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// ======================
// Main Component
// ======================

export default function StudentCareerDashboardPage() {
  const router = useRouter();

  // Auth & Data
  const [student, setStudent] = useState<Student | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<{ [key: number]: number }>({});
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  // Auth State
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Loading States
  const [profileLoading, setProfileLoading] = useState(true);
  const [roadmapsLoading, setRoadmapsLoading] = useState(false);
  const [quizDataLoading, setQuizDataLoading] = useState(false);

  // ======================
  // Data Fetching
  // ======================

  const getAuthPayload = () => {
    if (typeof window === 'undefined') return null;
    let token = localStorage.getItem('access_token');

    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      if (accessTokenCookie) token = accessTokenCookie.split('=')[1];
    }

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) return null;
      return payload;
    } catch {
      return null;
    }
  };

  const fetchStudentProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await api.get('/auth/me');
      if (response.status === 200) setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchRoadmaps = async () => {
    try {
      setRoadmapsLoading(true);
      const response = await api.get('/student/assigned-roadmaps');
      if (response.status === 200) {
        setRoadmaps(response.data.roadmaps || []);
        setRoadmapProgress(response.data.progress || {});
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setRoadmapsLoading(false);
    }
  };

  const loadQuizData = async () => {
    try {
      if (!isAuth) return;
      setQuizDataLoading(true);

      try {
        const statusResponse = await api.get('/student/daily-quiz');
        if (statusResponse.status === 200) setQuizStatus(statusResponse.data);
      } catch {
        setQuizStatus(null);
      }

      try {
        const historyResponse = await api.get('/student/quiz-history');
        if (historyResponse.status === 200) {
          const history = historyResponse.data.attempts || [];
          if (history.length > 0) {
            const scores = history.map((attempt: any) => attempt.score || 0);
            const totalScore = scores.reduce((sum: number, score: number) => sum + score, 0);
            setAverageScore(Math.round(totalScore / scores.length));
            setBestScore(Math.max(...scores));

            const correctAnswers = history.reduce((sum: number, attempt: any) => sum + (attempt.correctAnswers || 0), 0);
            const totalQuestions = history.reduce((sum: number, attempt: any) => sum + (attempt.totalQuestions || 0), 0);
            setAccuracy(totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0);
          }
        }
      } catch (error) {
        console.error('Error loading quiz history:', error);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setQuizDataLoading(false);
    }
  };

  // ======================
  // Effects
  // ======================

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
      if (authPayload) fetchStudentProfile();
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (student) {
      setTimeout(() => {
        fetchRoadmaps();
        loadQuizData();
      }, 100);
    }
  }, [student]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  // Calculate current progress for the first roadmap
  const currentRoadmapProgress = roadmaps.length > 0 ? (roadmapProgress[roadmaps[0].id] || 0) : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in pb-10">

      {/* Clean Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Welcome back, {student?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your progress, complete quizzes, and achieve your learning goals.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Active Learning</span>
        </div>
      </div>

      {/* KPI Grid - Improved Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Roadmap Card */}
        <Card className="border border-border/60 bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Learning Path</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{roadmaps.length}</span>
                <span className="text-sm text-muted-foreground">active</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{currentRoadmapProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${currentRoadmapProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Performance Card */}
        <Card className="border border-border/60 bg-card hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.4%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{averageScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average quiz score</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        {/* Best Accuracy Card */}
        <Card className="border border-border/60 bg-card hover:shadow-lg hover:border-amber-300 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Success Rate</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{accuracy}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Best accuracy</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">Correct answers ratio</p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quiz Card - Enhanced */}
        <QuizStatusCard quizStatus={quizStatus} onStart={() => router.push('/student/quiz-window')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Active Roadmap Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Current Learning Path
              </h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 group" onClick={() => router.push('/student/roadmaps')}>
                View Full Roadmap
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {roadmapsLoading ? (
              <Card className="h-64 animate-pulse bg-secondary/50 border-border/50" />
            ) : roadmaps.length > 0 ? (
              <div className="transform transition-all hover:scale-[1.01] duration-300">
                <RoadmapCard roadmap={roadmaps[0]} progress={roadmapProgress[roadmaps[0].id] || 0} />
              </div>
            ) : (
              <Card className="border-dashed border-2 border-border bg-secondary/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No Roadmap Assigned</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Your learning path hasn't been assigned yet. Please check back later or contact your faculty advisor.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommended Resources */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Recommended Resources</h2>
            </div>
            <LearningResourcesSection studentId={student?.id ? String(student.id) : ''} departmentId={student?.department?.id ? String(student.department.id) : ''} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">

          {/* Calendar / Schedule Widget */}
          <Card className="bg-card border-border/60 shadow-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 hover:bg-secondary/40 transition-colors flex gap-4 items-center group cursor-pointer">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-xs font-medium text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <span className="font-bold text-lg leading-none">1{i}</span>
                      <span className="text-[10px] uppercase mt-0.5">FEB</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Advanced Data Structures</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Project</span>
                        <span className="text-xs text-muted-foreground">Due at 11:59 PM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/40">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">View Full Calendar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Code Playground */}
          <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                  <Code className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground">Code Playground</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Practice coding with real-time feedback
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/student/code-window?practice=true')}
                className="w-full"
                size="sm"
              >
                Open Compiler
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Mini Status */}
          <Card className="bg-card border-border/60 shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Weekly Streak</h4>
                <p className="text-xs text-muted-foreground">You are on a 3-day streak! Keep it up.</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

function QuizStatusCard({ quizStatus, onStart }: { quizStatus: any, onStart: () => void }) {
  if (!quizStatus) {
    return (
      <Card className="border border-border/60 bg-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-5 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Quiz</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">All caught up!</p>
            <p className="text-xs text-muted-foreground">No quizzes available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = quizStatus.attemptsRemaining === 0;

  return (
    <Card className={`border transition-all duration-300 group ${isCompleted ? 'border-border/60 bg-card hover:shadow-lg' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-lg hover:shadow-orange-100'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-50' : 'bg-orange-100'}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Trophy className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <span className={`text-xs font-semibold ${isCompleted ? 'text-muted-foreground' : 'text-orange-700'}`}>
            Daily Quiz
          </span>
        </div>

        {isCompleted ? (
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-foreground">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Great job today!</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Come back tomorrow</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-foreground">{quizStatus.attemptsRemaining}</span>
              <span className="text-sm text-muted-foreground">left</span>
            </div>
            <p className="text-xs text-orange-700 font-medium mt-1">attempts remaining today</p>
            <Button
              onClick={onStart}
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-none shadow-md shadow-orange-200 font-semibold"
            >
              Start Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Code(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
