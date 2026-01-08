'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, TrendingUp, RefreshCw, Calendar, Trophy, Flame, BarChart3, Clock, Award } from 'lucide-react';

interface Student {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  departmentId: number;
  department: {
    id: number;
    name: string;
    college: {
      id: number;
      name: string;
    };
  };
  year: number;
  registerNumber: string;
}

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

interface QuizHistory {
  date: string;
  score: number;
  attempts: number;
  bestScore: number;
  completed: boolean;
}

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export default function DailyQuizPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [quizStatus, setQuizStatus] = useState<DailyQuizStatus | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Authentication check
  const isAuthenticated = () => {
    return localStorage.getItem('access_token') !== null;
  };

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    console.log('🚀 Daily Quiz page loading...');
    loadStudentData();
    loadQuizStatus();
    loadQuizHistory();
    loadQuizStats();
  }, []);

  // Monitor quiz history state changes
  useEffect(() => {
    console.log('📊 Quiz history state changed, length:', quizHistory.length);
    if (quizHistory.length > 0) {
      console.log('✅ Quiz history entries:', quizHistory);
    } else {
      console.log('❌ No quiz history entries');
    }
  }, [quizHistory]);

  const loadStudentData = async () => {
    try {
      if (!isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      const response = await api.get('/auth/me');

      if (response.status === 200) {
        setStudent(response.data);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load information');
    }
  };

  const loadQuizStatus = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated()) {
        router.push('/auth/login');
        throw new Error('User not authenticated. Redirecting to login...');
      }
      
      const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
      const response = await api.get(`/student/daily-quiz${cacheBuster}`);
      
      if (response.status === 200) {
        const apiData = response.data;
        
        if (apiData.quiz) {
          const totalAttempts = Number(apiData.quiz.totalAttempts) || 0;
          const bestScore = Number(apiData.quiz.bestScore) || 0;
          
          const transformedData = {
            quizId: apiData.quiz.id,
            totalAttempts: totalAttempts,
            bestScore: bestScore,
            canRetake: totalAttempts < 2,
            attempts: [],
            isNewGeneration: apiData.isNew,
            message: apiData.isNew ? 'New quiz generated for today' : 'Quiz already exists'
          };
          
          setQuizStatus(transformedData);
        } else {
          setQuizStatus(null);
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login');
          throw new Error('Authentication required. Redirecting to login...');
        }
        throw new Error(`HTTP ${response.status}: Failed to load quiz status`);
      }
    } catch (error) {
      console.error('Error loading quiz status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load quiz status');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizHistory = async () => {
    try {
      console.log('📚 Loading quiz history...');
      setIsLoadingHistory(true);
      const response = await api.get('/student/quiz-history');
      console.log('📡 Quiz history API response status:', response.status);
      
      if (response.status === 200) {
        console.log('📊 Quiz history API response data:', response.data);
        
        // Transform the response to match our interface
        const history = response.data.attempts || [];
        console.log('📝 Raw quiz history data:', history);
        
        if (history.length > 0) {
          const groupedByDate = history.reduce((acc: any, attempt: any) => {
            // Use quizDate if available, otherwise fall back to completedAt
            const dateToUse = attempt.quizDate || attempt.completedAt;
            const date = new Date(dateToUse).toDateString();
            if (!acc[date]) {
              acc[date] = {
                date: date,
                attempts: [],
                bestScore: 0,
                completed: true
              };
            }
            acc[date].attempts.push(attempt);
            acc[date].bestScore = Math.max(acc[date].bestScore, attempt.score || 0);
            return acc;
          }, {});

          const historyArray = Object.values(groupedByDate).map((day: any) => ({
            date: day.date,
            score: day.bestScore,
            attempts: day.attempts.length,
            bestScore: day.bestScore,
            completed: true
          }));

          console.log('✅ Grouped quiz history:', historyArray);
          setQuizHistory(historyArray);
          console.log('📊 Quiz history state updated, length:', historyArray.length);
        } else {
          console.log('❌ No quiz history found');
          setQuizHistory([]);
          console.log('📊 Quiz history state updated, length: 0');
        }
      } else {
        console.error('❌ Failed to load quiz history, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading quiz history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadQuizStats = async () => {
    try {
      const response = await api.get('/student/quiz-stats');
      if (response.status === 200) {
        const stats = response.data;
        setQuizStats({
          totalQuizzes: stats.totalQuizzes || 0,
          averageScore: stats.averageScore || 0,
          bestScore: stats.bestScore || 0,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0,
          totalQuestions: stats.totalQuestions || 0,
          correctAnswers: stats.correctAnswers || 0,
          accuracy: stats.accuracy || 0
        });
      }
    } catch (error) {
      console.error('Error loading quiz stats:', error);
      // Set default stats if API fails
      setQuizStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0
      });
    }
  };

  const forceRefresh = () => {
    setQuizStatus(null);
    setError(null);
    setRefreshKey(prev => prev + 1);
    loadQuizStatus(true);
    loadQuizHistory();
    loadQuizStats();
  };

  const startQuizWithAIGeneration = async () => {
    try {
      setIsGeneratingQuiz(true);
      console.log('🤖 Starting AI quiz generation...');
      
      // Call the start-quiz API to generate questions
      const response = await api.post('/student/start-quiz');
      
      if (response.status === 200) {
        console.log('✅ AI quiz generated successfully:', response.data);
        toast.success('AI quiz generated! Opening quiz window...');
        
        // Open quiz window with the generated quiz
        const quizWindow = window.open(
          `/student/quiz-window?quizId=${response.data.quizId}`,
          'quizWindow',
          'width=1200,height=800,scrollbars=yes,resizable=yes'
        );
        
        if (quizWindow) {
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'QUIZ_COMPLETED') {
              console.log('Quiz completed:', event.data.result);
              toast.success('Quiz completed successfully!');
              loadQuizStatus();
              loadQuizHistory();
              loadQuizStats();
              window.removeEventListener('message', handleMessage);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          const checkClosed = setInterval(() => {
            if (quizWindow.closed) {
              window.removeEventListener('message', handleMessage);
              clearInterval(checkClosed);
              loadQuizStatus();
              loadQuizHistory();
              loadQuizStats();
            }
          }, 1000);
        } else {
          toast.error('Failed to open quiz window. Please check your popup blocker.');
        }
      } else {
        throw new Error(`Failed to generate quiz: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error generating AI quiz:', error);
      toast.error('Failed to generate AI quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const openQuizWindow = (quizId?: number) => {
    const url = quizId ? `/student/quiz-window?quizId=${quizId}` : '/student/quiz-window';
    const quizWindow = window.open(
      url,
      'quizWindow',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
    
    if (quizWindow) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'QUIZ_COMPLETED') {
          console.log('Quiz completed:', event.data.result);
          toast.success('Quiz completed successfully!');
          loadQuizStatus();
          loadQuizHistory();
          loadQuizStats();
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      const checkClosed = setInterval(() => {
        if (quizWindow.closed) {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          loadQuizStatus();
          loadQuizHistory();
          loadQuizStats();
        }
      }, 1000);
    } else {
      toast.error('Failed to open quiz window. Please check your popup blocker.');
    }
  };

  const openReviewWindow = (quizId?: number) => {
    const url = quizId ? `/student/quiz-window?review=true&quizId=${quizId}` : '/student/quiz-window?review=true';
    const reviewWindow = window.open(
      url,
      'reviewWindow',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
    
    if (!reviewWindow) {
      toast.error('Failed to open review window. Please check your popup blocker.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading daily quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Quiz</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => loadQuizStatus()} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* AI Generation Loading Overlay */}
      {isGeneratingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generating Questions</h3>
                <p className="text-gray-600 mb-4">
                  Creating personalized questions based on your roadmap...
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Analyzing your academic profile</p>
                  <p>• Generating 10 general technical questions</p>
                  <p>• Creating 10 coding MCQ questions</p>
                  <p>• Personalizing based on your career path</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Quiz</h1>
        <p className="text-gray-600">Track your learning with personalized daily challenges</p>
      </div>

      {/* Stats Overview */}
      {quizStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{quizStats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{Math.round(quizStats.bestScore)}%</div>
              <p className="text-xs text-muted-foreground">personal best</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{Math.round(quizStats.averageScore)}%</div>
              <p className="text-xs text-muted-foreground">overall average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.round(quizStats.accuracy)}%</div>
              <p className="text-xs text-muted-foreground">correct answers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {quizStatus ? (
        <div key={refreshKey}>
          {/* Today's Quiz Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Quiz</h2>
                    <p className="text-gray-600">20 questions tailored for today's practice</p>
                  </div>
                  <Button 
                    onClick={forceRefresh}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {/* Attempt Tracking */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Badge variant="outline" className="px-3 py-1">
                    Attempts: {quizStatus.totalAttempts}/2
                  </Badge>
                  <Badge variant={quizStatus.totalAttempts >= 2 ? "destructive" : "default"} className="px-3 py-1">
                    {quizStatus.totalAttempts >= 2 ? "No attempts left" : `${2 - quizStatus.totalAttempts} attempts left`}
                  </Badge>
                  {quizStatus.canRetake && quizStatus.totalAttempts > 0 && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Retake Available
                    </Badge>
                  )}
                </div>
                
                {quizStatus.totalAttempts === 0 ? (
                  <Button 
                    onClick={startQuizWithAIGeneration}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    disabled={isGeneratingQuiz}
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        AI Generating Questions...
                      </>
                    ) : (
                      'Start Quiz ➝'
                    )}
                  </Button>
                ) : quizStatus.canRetake ? (
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => openQuizWindow(quizStatus.quizId)}
                      size="lg"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
                    >
                      Retake Quiz ➝
                    </Button>
                    <Button 
                      onClick={() => openReviewWindow(quizStatus.quizId)}
                      size="lg"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
                    >
                      Review Answers ➝
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Button 
                      onClick={() => openReviewWindow(quizStatus.quizId)}
                      size="lg"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
                    >
                      Review Answers ➝
                    </Button>
                    <p className="text-sm text-gray-500">All attempts used for today. New quiz available tomorrow!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Status */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              {quizStatus.totalAttempts === 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Ready to start today's quiz!
                    </h3>
                    <p className="text-gray-600 mb-2">Challenge yourself with 20 personalized questions</p>
                    <p className="text-sm text-blue-600 mb-3">You have 2 attempts available for today's quiz</p>
                    <Button 
                      onClick={startQuizWithAIGeneration} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isGeneratingQuiz}
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI Generating Questions...
                        </>
                      ) : (
                        'Start Now'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Best Score: {Math.round((quizStatus.bestScore / 100) * 20)} / 20 ({Math.round(quizStatus.bestScore)}%)
                    </h3>
                    <div className="text-gray-600 mb-3 space-y-1">
                      <p>Attempts used: {quizStatus.totalAttempts}/2</p>
                      {quizStatus.canRetake ? (
                        <p className="text-orange-600">You can retake this quiz once more today</p>
                      ) : (
                        <p className="text-green-600">All attempts completed for today</p>
                      )}
                    </div>
                    <Button onClick={() => openReviewWindow(quizStatus.quizId)} variant="outline">
                      Review Answers ➝
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Performance Tips */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800">Performance Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
                <div>
                  <h4 className="font-medium mb-2">Study Strategy</h4>
                  <ul className="space-y-1">
                    <li>• Review explanations for wrong answers</li>
                    <li>• Focus on your weak areas</li>
                    <li>• Practice regularly for better retention</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quiz Tips</h4>
                  <ul className="space-y-1">
                    <li>• Read questions carefully</li>
                    <li>• Use both attempts wisely</li>
                    <li>• Take your time to think</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Quiz</h2>
              <p className="text-gray-600 mb-4">20 questions tailored for today's practice</p>
              <div className="flex justify-center items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                  2 attempts left
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  AI-Generated Questions
                </span>
              </div>
              <Button 
                onClick={startQuizWithAIGeneration}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                disabled={isGeneratingQuiz}
              >
                {isGeneratingQuiz ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI Generating Questions...
                  </>
                ) : (
                  'Start Quiz ➝'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz History - Always Visible */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quiz History (Last 7 Days)
            </CardTitle>
            <Button
              onClick={loadQuizHistory}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            console.log('🔍 Rendering quiz history, length:', quizHistory.length);
            return null;
          })()}
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading quiz history...</span>
            </div>
          ) : quizHistory.length > 0 ? (
            <div className="space-y-3">
              {quizHistory.slice(0, 7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{day.attempts} attempt{day.attempts !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={day.score >= 80 ? "default" : day.score >= 60 ? "secondary" : "destructive"}>
                      {Math.round(day.score)}%
                    </Badge>
                    {day.score >= 80 && <Award className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No quiz history yet</p>
              <p className="text-sm">Take your first quiz to see your history here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
