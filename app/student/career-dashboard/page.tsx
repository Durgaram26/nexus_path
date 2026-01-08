'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

// UI Components
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Layout & Sections
import RoadmapCard from '@/components/student/RoadmapCard';
import LearningResourcesSection from '@/components/student/LearningResourcesSection';
import AnalyticsDashboard from '@/components/student/AnalyticsDashboard';
import { NotificationCenter } from '@/components/ui/notification-center';
import { MessageInbox } from '@/components/student/MessageInbox';

// Icons
import { Trophy, TrendingUp, Award, Target, CheckCircle, Edit } from 'lucide-react';

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

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'achievement' | 'assignment' | 'quiz';
  status: 'completed' | 'pending' | 'in-progress';
}

const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
];

// ======================
// Main Component
// ======================

export default function StudentCareerDashboardPage() {
  const router = useRouter();

  // Auth & Data
  const [student, setStudent] = useState<Student | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<{ [key: number]: number }>({});
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  // UI State
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [selectedFavoriteLanguage, setSelectedFavoriteLanguage] = useState<string>('');
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  
  // Auth State
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Loading States
  const [profileLoading, setProfileLoading] = useState(true);
  const [roadmapsLoading, setRoadmapsLoading] = useState(false);
  const [quizDataLoading, setQuizDataLoading] = useState(false);

  // ======================
  // Auth Helper
  // ======================

  const getAuthPayload = () => {
    if (typeof window === 'undefined') return null;
    
    // Try to get token from localStorage first
    let token = localStorage.getItem('access_token');
    
    // If not in localStorage, try to extract from cookie
    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
      }
    }
    
    if (!token) {
      localStorage.removeItem('access_token');
      return null;
    }
    
    try {
      // Simple token validation - in production, use proper JWT verification
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('access_token');
        return null;
      }
      return payload;
    } catch (error) {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  const isAuthenticated = () => !!getAuthPayload();

  // ======================
  // Data Fetching
  // ======================

  const fetchStudentProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await api.get('/auth/me');
      
      if (response.status === 200) {
        setStudent(response.data);
        setSelectedFavoriteLanguage(response.data.favoriteLanguage || '');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to load profile');
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
      toast.error('Failed to load roadmaps');
    } finally {
      setRoadmapsLoading(false);
    }
  };

  const loadQuizData = async () => {
    try {
      if (!isAuth) {
        router.push('/auth/login');
        return;
      }
      
      setQuizDataLoading(true);
      
      // Load daily quiz status first
      try {
        const statusResponse = await api.get('/student/daily-quiz');
        if (statusResponse.status === 200) {
          setQuizStatus(statusResponse.data);
        }
      } catch (error) {
        console.log('No quiz available today');
        setQuizStatus(null);
      }
      
      // Load quiz history
      try {
        const historyResponse = await api.get('/student/quiz-history');
        if (historyResponse.status === 200) {
          const history = historyResponse.data.attempts || [];
          setQuizHistory(history);
          
          // Calculate statistics
          if (history.length > 0) {
            const scores = history.map((attempt: any) => attempt.score || 0);
            const totalScore = scores.reduce((sum: number, score: number) => sum + score, 0);
            const avgScore = totalScore / scores.length;
            const maxScore = Math.max(...scores);
            
            setAverageScore(Math.round(avgScore));
            setBestScore(maxScore);
            
            // Calculate accuracy (simplified)
            const correctAnswers = history.reduce((sum: number, attempt: any) => sum + (attempt.correctAnswers || 0), 0);
            const totalQuestions = history.reduce((sum: number, attempt: any) => sum + (attempt.totalQuestions || 0), 0);
            const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
            setAccuracy(Math.round(accuracyRate));
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

  const saveFavoriteLanguage = async () => {
    if (!student || !selectedFavoriteLanguage) return;
    
    try {
      setIsSavingLanguage(true);
      const response = await api.put('/student/favorite-language', {
        favoriteLanguage: selectedFavoriteLanguage
      });
      
      if (response.status === 200) {
        setStudent(prev => prev ? { ...prev, favoriteLanguage: selectedFavoriteLanguage } : null);
        setIsEditingLanguage(false);
        toast.success('Favorite language updated successfully!');
      }
    } catch (error) {
      console.error('Error saving favorite language:', error);
      toast.error('Failed to save favorite language');
    } finally {
      setIsSavingLanguage(false);
    }
  };

  // ======================
  // Effects
  // ======================

  // Check authentication on client side only
  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
      
      if (authPayload) {
        fetchStudentProfile();
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuth) {
      fetchStudentProfile();
    }
  }, [isAuth]);

  useEffect(() => {
    if (student) {
      setTimeout(() => {
        fetchRoadmaps();
        loadQuizData();
      }, 100);
    }
  }, [student]);

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {student?.name || 'Student'}! 👋</h2>
        <p className="text-blue-100">Track your learning progress and achieve your career goals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roadmaps.length}</div>
            <p className="text-xs text-muted-foreground">
              Learning paths in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Quiz performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}%</div>
            <p className="text-xs text-muted-foreground">
              Personal best
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Overall accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Roadmaps */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Learning Roadmaps</h3>
        {roadmapsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : roadmaps.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {/* Show only the first (and should be only) roadmap */}
            <RoadmapCard
              key={roadmaps[0].id}
              roadmap={roadmaps[0]}
              progress={roadmapProgress[roadmaps[0].id] || 0}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmaps assigned</h3>
              <p className="text-gray-500">Contact your faculty to get assigned learning roadmaps</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Learning Resources */}
      <LearningResourcesSection studentId={student?.id || 0} departmentId={student?.department?.id || 0} />

      {/* Daily Quiz Status */}
      {quizStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Today's Quiz
            </CardTitle>
            <CardDescription>
              Complete your daily quiz to improve your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {quizStatus.attemptsRemaining > 0 
                    ? `You have ${quizStatus.attemptsRemaining} attempts remaining`
                    : 'Quiz completed for today'
                  }
                </p>
              </div>
              <Button 
                onClick={() => router.push('/student/quiz-window')}
                disabled={quizStatus.attemptsRemaining === 0}
              >
                {quizStatus.attemptsRemaining > 0 ? 'Take Quiz' : 'Completed'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
