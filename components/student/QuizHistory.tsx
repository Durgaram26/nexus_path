'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  CheckCircle, 
  TrendingUp, 
  Target 
} from 'lucide-react';

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
}

interface QuizHistoryProps {
  studentId: number;
  compact?: boolean;
}

export default function QuizHistory({ studentId, compact = false }: QuizHistoryProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const loadQuizHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/student/${studentId}/quiz-history`);
      
      if (response.status !== 200) {
        throw new Error('Failed to load quiz history');
      }
      
      const data = response.data;
      setAttempts(data.attempts || []);
    } catch (error) {
      console.error('Error loading quiz history:', error);
      setError('Failed to load quiz history');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadQuizHistory();
  }, [loadQuizHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
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
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-4 w-4" />;
    if (score >= 60) return <CheckCircle className="h-4 w-4" />;
    return <div className="h-4 w-4" />;
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

  const getStreakCount = () => {
    if (attempts.length < 2) return 0;
    let streak = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].score >= 70) streak++;
      else break;
    }
    return streak;
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return total / attempts.length;
  };

  const getBestScore = () => {
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(attempt => attempt.score));
  };

  if (isLoading) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <div className={compact ? 'p-2' : ''}>
          <div className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Quiz History
          </div>
        </div>
        <CardContent className={compact ? 'p-2' : ''}>
          <p className="text-gray-600 text-sm">No quiz attempts yet</p>
          <p className="text-xs text-gray-500 mt-1">Complete your first quiz to see your history!</p>
        </CardContent>
      </Card>
    );
  }

  const displayAttempts = showAll ? attempts : attempts.slice(0, 3);
  const streakCount = getStreakCount();
  const averageScore = getAverageScore();
  const bestScore = getBestScore();

  return (
    <Card className={compact ? 'p-3' : ''}>
      <div className={compact ? 'p-2' : ''}>
        <div className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Quiz History
          <Badge variant="outline" className="text-xs">
            {attempts.length} attempts
          </Badge>
        </div>
      </div>
      
      <CardContent className={compact ? 'p-2' : ''}>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">{bestScore.toFixed(1)}%</div>
            <div className="text-xs text-blue-600">Best Score</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">{averageScore.toFixed(1)}%</div>
            <div className="text-xs text-green-600">Average</div>
          </div>
        </div>

        {/* Streak Counter */}
        {streakCount > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {streakCount} day streak!
              </span>
            </div>
          </div>
        )}

        {/* Recent Attempts */}
        <div className="space-y-2">
          {displayAttempts.map((attempt, index) => {
            const previousAttempt = index < attempts.length - 1 ? attempts[index + 1] : null;
            const improvement = previousAttempt ? getImprovement(attempt.score, previousAttempt.score) : null;
            
            return (
              <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getScoreColor(attempt.score)}`}>
                    {getScoreIcon(attempt.score)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Attempt {attempt.attemptNumber}</div>
                    <div className="text-xs text-gray-600">{formatDate(attempt.completedAt)}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">{attempt.score.toFixed(1)}%</span>
                    {improvement && previousAttempt && (
                      <div className="flex items-center gap-1">
                        {getTrendIcon(attempt.score, previousAttempt.score)}
                        <span className="text-xs text-gray-600">{improvement}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {attempt.correctAnswers}/{attempt.totalQuestions} • {formatTime(attempt.timeSpent)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {attempts.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 text-xs"
          >
            {showAll ? 'Show Less' : `Show All ${attempts.length} Attempts`}
          </Button>
        )}

        {/* Performance Insights */}
        {attempts.length >= 2 && (
          <div className="mt-4 p-2 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-1">💡 Performance Insight</div>
              {averageScore >= 80 ? (
                <div>Excellent performance! Keep up the great work!</div>
              ) : averageScore >= 60 ? (
                <div>Good ! Try to aim for 80%+ consistently.</div>
              ) : (
                <div>Focus on understanding the concepts better. Review explanations carefully.</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
