'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Target, 
  Trophy, 
  CheckCircle, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface DailyQuizStatus {
  quizId: number;
  totalAttempts: number;
  bestScore: number;
  canRetake: boolean;
  attempts: Array<{
    attemptNumber: number;
    score: number;
    completedAt: string;
    correctAnswers: number;
    totalQuestions: number;
  }>;
  isNewGeneration: boolean;
  message: string;
}

export default function DailyQuizCard() {
  const router = useRouter();
  const [quizStatus, setQuizStatus] = useState<DailyQuizStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuizStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/student/daily-quiz');
      
      if (response.status !== 200) {
        throw new Error('Failed to load quiz status');
      }
      
      const data = response.data;
      setQuizStatus(data);
    } catch (error) {
      console.error('Error loading quiz status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load quiz status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizStatus();
  }, [loadQuizStatus]);

  const getStatusColor = (attempts: number, bestScore: number) => {
    if (attempts === 0) return 'text-blue-600';
    if (attempts === 1 && bestScore < 70) return 'text-yellow-600';
    if (bestScore >= 80) return 'text-green-600';
    return 'text-orange-600';
  };

  const getStatusText = (attempts: number, bestScore: number, canRetake: boolean) => {
    if (attempts === 0) return 'Ready to start';
    if (attempts === 1 && canRetake) return 'Second attempt available';
    if (attempts === 1 && !canRetake) return 'Completed';
    if (attempts === 2) return 'All attempts completed';
    return 'In progress';
  };

  const getStatusIcon = (attempts: number, bestScore: number) => {
    if (attempts === 0) return <Target className="h-4 w-4" />;
    if (bestScore >= 80) return <Trophy className="h-4 w-4" />;
    if (attempts === 1 && bestScore < 70) return <div className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Quiz</h3>
          <p className="text-gray-600">AI is generating personalized questions for your daily challenge...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Daily Quiz
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadQuizStatus} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quizStatus) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">No quiz available today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getStatusIcon(quizStatus.totalAttempts, quizStatus.bestScore)}
          <span>Daily Quiz</span>
          <Badge variant="outline" className="ml-auto">
            {quizStatus.totalAttempts}/2 attempts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`font-medium ${getStatusColor(quizStatus.totalAttempts, quizStatus.bestScore)}`}>
              {getStatusText(quizStatus.totalAttempts, quizStatus.bestScore, quizStatus.canRetake)}
            </span>
            {quizStatus.bestScore > 0 && (
              <span className="text-sm text-gray-600">
                Best: {quizStatus.bestScore.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Progress */}
          {quizStatus.totalAttempts > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{quizStatus.totalAttempts}/2 attempts</span>
              </div>
              <Progress 
                value={(quizStatus.totalAttempts / 2) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Recent Attempts */}
          {quizStatus.attempts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Attempts</h4>
              <div className="space-y-1">
                {quizStatus.attempts.slice(0, 2).map((attempt, index) => (
                  <div key={attempt.attemptNumber} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 text-gray-500" />
                      <span>Attempt {attempt.attemptNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{attempt.score.toFixed(1)}%</span>
                      <span className="text-gray-500">
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {quizStatus.totalAttempts === 0 ? (
              <Link href="/student/daily-quiz">
                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Start Daily Quiz
                </Button>
              </Link>
            ) : quizStatus.canRetake ? (
              <Link href="/student/daily-quiz">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Second Attempt
                </Button>
              </Link>
            ) : (
              <Link href="/student/daily-quiz">
                <Button variant="outline" className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Results
                </Button>
              </Link>
            )}
          </div>

          {/* Motivational Message */}
          {quizStatus.totalAttempts === 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">🎯 Today's Challenge</p>
              <p>Complete your daily quiz to track your learning and strengthen your knowledge!</p>
            </div>
          )}

          {quizStatus.totalAttempts === 1 && quizStatus.bestScore < 70 && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <p className="font-medium mb-1">🔄 Second Chance</p>
              <p>You have one more attempt to improve your score. Review the explanations and try again!</p>
            </div>
          )}

          {quizStatus.bestScore >= 80 && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <p className="font-medium mb-1">🏆 Excellent Work!</p>
              <p>Great job on your quiz! Keep up the excellent learning progress.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
