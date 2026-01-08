'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  BarChart3,
  Clock,
  Calendar
} from 'lucide-react';
// import { isAuthenticated } from '@/lib/auth';

interface QuizAttempt {
  id: number;
  attemptNumber: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  timeSpent: number;
  wrongAnswers: unknown[];
  feedback: unknown[];
  quizDate: string;
}

interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  recentAverage: number;
  recentAttempts: number;
}

export default function QuizHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'best'>('all');

  useEffect(() => {
    // Check authentication - for now, always proceed
    // if (!isAuthenticated()) {
    //   router.push('/auth/login');
    //   return;
    // }
    loadQuizHistory();
  }, [router]);

  const loadQuizHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/student/quiz-history');
      
      if (response.status !== 200) {
        throw new Error('Failed to load quiz history');
      }
      
      const data = response.data;
      setAttempts(data.attempts || []);
      setStats(data.statistics || null);
    } catch (error) {
      console.error('Error loading quiz history:', error);
      setError('Failed to load quiz history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-5 w-5" />;
    if (score >= 60) return <CheckCircle className="h-5 w-5" />;
    return <div className="h-5 w-5" />;
  };

  const getTrendIcon = (currentScore: number, previousScore: number) => {
    if (currentScore > previousScore) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (currentScore < previousScore) return <div className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const getImprovement = (currentScore: number, previousScore: number) => {
    const diff = currentScore - previousScore;
    if (diff > 0) return `+${diff.toFixed(1)}%`;
    if (diff < 0) return `${diff.toFixed(1)}%`;
    return '0%';
  };

  const filteredAttempts = () => {
    switch (filter) {
      case 'recent':
        return attempts.slice(0, 5);
      case 'best':
        return [...attempts].sort((a, b) => b.score - a.score).slice(0, 5);
      default:
        return attempts;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadQuizHistory}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
          <p className="text-gray-600">Track your learning and performance over time</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold text-blue-800">Best Score</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.bestScore.toFixed(1)}%</div>
                <div className="text-sm text-blue-600">Personal best</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-green-800">Average Score</span>
                </div>
                <div className="text-3xl font-bold text-green-900">{stats.averageScore.toFixed(1)}%</div>
                <div className="text-sm text-green-600">Overall performance</div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Current Streak</span>
                </div>
                <div className="text-3xl font-bold text-yellow-900">{stats.currentStreak}</div>
                <div className="text-sm text-yellow-600">Days in a row (70%+)</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-6 w-6 text-purple-600" />
                  <span className="font-semibold text-purple-800">Total Attempts</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">{stats.totalAttempts}</div>
                <div className="text-sm text-purple-600">All time attempts</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Attempts
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            onClick={() => setFilter('recent')}
            size="sm"
          >
            Recent
          </Button>
          <Button
            variant={filter === 'best' ? 'default' : 'outline'}
            onClick={() => setFilter('best')}
            size="sm"
          >
            Best Scores
          </Button>
        </div>

        {/* Attempts List */}
        {filteredAttempts().length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quiz Attempts Yet</h3>
                <p className="text-gray-600 mb-4">Complete your first daily quiz to start tracking your progress!</p>
                <Button onClick={() => router.push('/student/daily-quiz')}>
                  Start Daily Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAttempts().map((attempt, index) => {
              const previousAttempt = index < attempts.length - 1 ? attempts[index + 1] : null;
              const improvement = previousAttempt ? getImprovement(attempt.score, previousAttempt.score) : null;
              
              return (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreColor(attempt.score)}`}>
                          {getScoreIcon(attempt.score)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">Attempt {attempt.attemptNumber}</h3>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(attempt.completedAt)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {attempt.correctAnswers}/{attempt.totalQuestions} correct answers
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold">{attempt.score.toFixed(1)}%</span>
                          {improvement && previousAttempt && (
                            <div className="flex items-center gap-1">
                              {getTrendIcon(attempt.score, previousAttempt.score)}
                              <span className="text-sm text-gray-600">{improvement}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(attempt.timeSpent)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(attempt.quizDate).toLocaleDateString('en-US')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

