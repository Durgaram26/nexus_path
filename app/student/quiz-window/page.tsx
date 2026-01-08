'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getTokenFromStorage } from '@/src/lib/auth-client';
import { 
  Target, 
  CheckCircle, 
  Flag, 
  ArrowLeft, 
  ArrowRight,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
}

export default function QuizWindowPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [score, setScore] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<{totalAttempts: number, canRetake: boolean} | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  // No mock data - all questions come from API

  // Helper function to deduplicate questions by ID
  const deduplicateQuestions = useCallback((questions: any[]) => {
    return questions.reduce((acc: any[], question: any, index: number) => {
      const existingIndex = acc.findIndex(q => q.id === question.id);
      if (existingIndex === -1) {
        acc.push(question);
      } else {
        // If duplicate, append index to make ID unique
        acc.push({
          ...question,
          id: `${question.id}-${index}`
        });
      }
      return acc;
    }, []);
  }, []);

  const loadQuizAttempts = useCallback(async (quizId: number) => {
    try {
      console.log('Loading quiz attempts for quiz ID:', quizId);
      const response = await api.get(`/student/quiz-attempts?quizId=${quizId}`);
      
      if (response.status === 200) {
        const attempts = response.data.attempts || [];
        console.log('Quiz attempts loaded:', attempts.length);
        
        // Store the attempts
        setQuizAttempts(attempts);
        
        // Update attempt info with actual data
        setAttemptInfo({
          totalAttempts: attempts.length,
          canRetake: attempts.length < 2
        });
        
        // If there are attempts, show the best score
        if (attempts.length > 0) {
          const bestAttempt = attempts.reduce((best: any, current: any) => 
            current.score > best.score ? current : best
          );
          console.log('Best score from attempts:', bestAttempt.score);
        }
      }
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      // Check URL parameters to determine quiz type
      const urlParams = new URLSearchParams(window.location.search);
      const review = urlParams.get('review');
      const quizId = urlParams.get('quizId');
      
      // Fetch daily quiz data
      let response;
      if (quizId) {
        // If quizId is provided, fetch that specific quiz
        response = await api.get(`/student/daily-quiz?quizId=${quizId}`);
      } else {
        // Otherwise, fetch the current daily quiz
        response = await api.get('/student/daily-quiz');
      }
      
      if (response.status === 200) {
        const data = response.data;
        
        // Check if this is review mode
        if (review === 'true') {
          setIsLoadingReview(true);
          // For review mode, fetch quiz history instead of current quiz
          try {
            const historyResponse = await api.get('/student/quiz-history');
            if (historyResponse.status === 200 && historyResponse.data.attempts && historyResponse.data.attempts.length > 0) {
              // Get the latest attempt
              const latestAttempt = historyResponse.data.attempts[0]; // Most recent attempt
              
              // Get the quiz data for this attempt
              const quizResponse = await api.get(`/student/daily-quiz`);
              if (quizResponse.status === 200 && quizResponse.data.quiz) {
                let questions;
                if (typeof quizResponse.data.quiz.questions === 'string') {
                  questions = JSON.parse(quizResponse.data.quiz.questions);
                } else {
                  questions = quizResponse.data.quiz.questions; // Already an object
                }
                
                // Deduplicate questions by ID to prevent duplicate keys
                setQuestions(deduplicateQuestions(questions));
                
                // Set up the quiz results for review
                let wrongAnswers = [];
                try {
                  wrongAnswers = typeof latestAttempt.wrongAnswers === 'string' 
                    ? JSON.parse(latestAttempt.wrongAnswers) 
                    : latestAttempt.wrongAnswers || [];
                } catch (parseError) {
                  console.error('Error parsing wrongAnswers:', parseError);
                  wrongAnswers = [];
                }
                
                setQuizResults({
                  wrongAnswers: wrongAnswers,
                  score: latestAttempt.score,
                  correctAnswers: latestAttempt.correctAnswers,
                  totalQuestions: latestAttempt.totalQuestions
                });
                
                // Set up answers for review
                try {
                  const answers = typeof latestAttempt.answers === 'string' 
                    ? JSON.parse(latestAttempt.answers || '[]') 
                    : latestAttempt.answers || [];
                  const reviewAnswers = questions.map((question: any, index: number) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    return {
                      questionId: question.id,
                      selectedAnswer: userAnswer,
                      isCorrect: isCorrect,
                      points: isCorrect ? question.points : 0,
                      category: question.category,
                      difficulty: question.difficulty
                    };
                  });
                  setAnswers(reviewAnswers);
                } catch (parseError) {
                  console.error('Error parsing answers for review:', parseError);
                  // Set empty answers if parsing fails
                  setAnswers([]);
                }
                
                setQuizCompleted(true);
                setShowReview(true);
                setIsLoadingReview(false);
                toast.info('Review mode - showing your latest quiz attempt');
                
                // If we don't have complete data, show a message
                if (questions.length === 0) {
                  toast.warning('Quiz data is incomplete. Some features may not work properly.');
                }
              } else {
                toast.error('No quiz data found for review.');
                setQuestions([]);
                setQuizCompleted(false);
                setShowReview(false);
                setIsLoadingReview(false);
              }
            } else {
              // No quiz history found - show a message and close window
              toast.error('No completed quiz found to review.');
              setIsLoadingReview(false);
              setTimeout(() => {
                window.close();
              }, 2000);
            }
          } catch (error) {
            console.error('Error loading quiz history for review:', error);
            toast.error('Failed to load quiz for review.');
            setQuestions([]);
            setQuizCompleted(false);
            setShowReview(false);
            setIsLoadingReview(false);
          }
        } else {
          // Normal quiz mode - check if quiz exists
          if (data.quiz && data.quiz.questions) {
            // Quiz exists, load it
            let questions;
            if (typeof data.quiz.questions === 'string') {
              questions = JSON.parse(data.quiz.questions);
            } else {
              questions = data.quiz.questions; // Already an object
            }
            
            // Deduplicate questions by ID to prevent duplicate keys
            setQuestions(deduplicateQuestions(questions));
            
            // Store quiz ID for submission
            localStorage.setItem('currentQuizId', data.quiz.id.toString());
            // Store attempt information
            const totalAttempts = data.quiz.totalAttempts || 0;
            setAttemptInfo({
              totalAttempts: totalAttempts,
              canRetake: totalAttempts < 2
            });
            
            // Load quiz attempts for this specific quiz
            await loadQuizAttempts(data.quiz.id);
            
            toast.success('Daily quiz loaded! AI-generated questions based on your career path.');
          } else {
            // No quiz exists, create one automatically
            toast.info('Creating your daily quiz...');
            const createResponse = await api.post('/student/create-quiz');
            
            if (createResponse.status === 200 && createResponse.data.quiz) {
              let questions;
              if (typeof createResponse.data.quiz.questions === 'string') {
                questions = JSON.parse(createResponse.data.quiz.questions);
              } else {
                questions = createResponse.data.quiz.questions; // Already an object
              }
              
              // Deduplicate questions by ID to prevent duplicate keys
              setQuestions(deduplicateQuestions(questions));
              
              // Store quiz ID for submission
              localStorage.setItem('currentQuizId', createResponse.data.quiz.id.toString());
              // Store attempt information
              setAttemptInfo({
                totalAttempts: 0,
                canRetake: true
              });
              toast.success('Daily quiz created! AI-generated questions based on your career path.');
            } else {
              throw new Error('Failed to create quiz');
            }
          }
        }
      } else {
        const errorData = response.data || {};
        if (response.status === 401 || response.status === 403) {
          toast.error('Please log in to access the quiz.');
          window.close();
        } else {
          toast.error(errorData.message || 'Failed to load quiz questions.');
          setQuestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      const urlParams = new URLSearchParams(window.location.search);
      const review = urlParams.get('review');
      
      if (review === 'true') {
        toast.error('Failed to load quiz for review.');
        setQuestions([]);
        setQuizCompleted(false);
        setShowReview(false);
      } else {
        toast.error('Failed to load quiz questions.');
        setQuestions([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Anti-cheat measures
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Alt+Tab, Ctrl+Tab, etc.
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.altKey && e.key === 'Tab') ||
          (e.ctrlKey && e.key === 'Tab') ||
          (e.ctrlKey && e.key === 'w') ||
          (e.altKey && e.key === 'F4')) {
        e.preventDefault();
        toast.error('This action is not allowed during the quiz');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !quizCompleted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your will be lost.';
        return 'Are you sure you want to leave? Your will be lost.';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && quizStarted && !quizCompleted) {
        toast.error('Please do not switch tabs during the quiz!');
        // Optionally auto-submit or take other action
      }
    };

    if (quizStarted) {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStarted, quizCompleted]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted]);

  const startQuiz = () => {
    // Check if already in fullscreen
    if (document.fullscreenElement) {
      setQuizStarted(true);
      toast.success('Quiz started! Good luck!');
    } else {
      // Try to enter fullscreen first
      enterFullscreen();
      
      // Check if fullscreen was successful after a short delay
      setTimeout(() => {
        if (document.fullscreenElement) {
          setQuizStarted(true);
          toast.success('Quiz started! Good luck!');
        } else {
          toast.error('Fullscreen mode is required to start the quiz. Please allow fullscreen and try again.');
        }
      }, 1000);
    }
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setFullscreenMode(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullscreenMode(false);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      toast.error('Question not found. Please refresh and try again.');
      return;
    }
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    // Store answer
    const answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      points: isCorrect ? currentQuestion.points : 0,
      category: currentQuestion.category,
      difficulty: currentQuestion.difficulty
    };

    setAnswers(prev => [...prev, answer]);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizCompleted(true);
    setQuizStarted(false);
    
    // Calculate final score
    const finalScore = Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    
    // Prepare submission data
    const quizId = localStorage.getItem('currentQuizId');
    const submissionData = {
      quizId: quizId ? parseInt(quizId) : null,
      answers: answers.map(a => a.selectedAnswer),
      timeSpent
    };
    
    // Submit to API if we have a valid quiz ID
    if (quizId) {
      try {
        const response = await api.post('/student/daily-quiz', submissionData);
        
        if (response.status === 200) {
          console.log('Quiz results received:', response.data);
          console.log('Wrong answers count:', response.data.wrongAnswers?.length || 0);
          console.log('Correct answers:', response.data.correctAnswers);
          console.log('Total questions:', response.data.totalQuestions);
          setQuizResults(response.data);
          toast.success('Quiz submitted successfully!');
          
          // Update attempt info
          setAttemptInfo(prev => ({
            totalAttempts: (prev?.totalAttempts || 0) + 1,
            canRetake: (prev?.totalAttempts || 0) + 1 < 2
          }));
          
          // Send results to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'QUIZ_COMPLETED',
              result: {
                ...response.data,
                timeSpent,
                completedAt: new Date().toISOString()
              }
            }, '*');
          }
        } else {
          toast.error('Failed to submit quiz, but your answers were recorded locally.');
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
        toast.error('Failed to submit quiz, but your answers were recorded locally.');
      }
    } else {
      // Fallback for mock quiz
      const result = {
        id: 'quiz_' + Date.now(),
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent,
        completedAt: new Date().toISOString(),
        questions: answers
      };

      // Send message to parent window
      if (window.opener) {
        console.log('Sending quiz results to parent:', result);
        window.opener.postMessage({
          type: 'QUIZ_COMPLETED',
          result
        }, '*');
      }
      
      toast.success('Quiz completed! You can close this window.');
    }
    
    // Clean up
    localStorage.removeItem('currentQuizId');
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (questions.length === 0) {
      toast.error('No questions available');
      return;
    }
    
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading screen for review mode
  if (isLoadingReview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Loading Quiz Review</h2>
            <p className="text-gray-600">Fetching your quiz data and answers...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted && !quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="text-center">Quiz Instructions</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Secure Quiz Window</h2>
              <p className="text-gray-600">AI-generated questions with anti-cheat security measures</p>
              {attemptInfo && (
                <div className="mt-3 flex justify-center gap-2">
                  <Badge variant="outline">
                    Attempt {(attemptInfo.totalAttempts || 0) + 1} of 2
                  </Badge>
                  <Badge variant={attemptInfo.canRetake ? "secondary" : "destructive"}>
                    {attemptInfo.canRetake ? `${2 - (attemptInfo.totalAttempts || 0)} attempts left` : "No attempts left"}
                  </Badge>
                </div>
              )}
              
              {/* Attempt History */}
              {quizAttempts.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Previous Attempts</h3>
                  <div className="space-y-2">
                    {quizAttempts.map((attempt, index) => {
                      const bestScore = Math.max(...quizAttempts.map(a => a.score));
                      const isBest = attempt.score === bestScore;
                      return (
                        <div key={attempt.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                          isBest ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isBest ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {attempt.attemptNumber}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                Attempt {attempt.attemptNumber}
                                {isBest && <span className="ml-2 text-green-600 text-sm">🏆 Best</span>}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(attempt.attemptedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              attempt.score >= 80 ? 'text-green-600' : 
                              attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {Math.round(attempt.score)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {attempt.correctAnswers}/{attempt.totalQuestions} correct
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-blue-600">Questions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">30</div>
                <div className="text-sm text-green-600">Minutes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">AI-Generated</div>
                <div className="text-sm text-purple-600">Personalized</div>
              </div>
              {quizAttempts.length > 0 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(Math.max(...quizAttempts.map(a => a.score)))}%
                  </div>
                  <div className="text-sm text-yellow-600">Best Score</div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Answer all questions to complete the quiz</li>
                <li>• You cannot go back to previous questions</li>
                <li>• Quiz will auto-submit when time expires</li>
                <li>• Flag questions you want to review</li>
                <li>• <strong>Fullscreen mode is mandatory</strong> - quiz will not start without it</li>
                <li>• Do not switch tabs or minimize the window during the quiz</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={startQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                size="lg"
              >
                Start Quiz (Fullscreen Required)
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Quiz will automatically enter fullscreen mode when started
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted && !showReview) {
    const finalScore = quizResults ? quizResults.score : Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100);
    const correctCount = quizResults ? quizResults.correctAnswers : answers.filter(a => a.isCorrect).length;
    const wrongCount = questions.length - correctCount;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <div className="text-center text-green-600">Quiz Completed!</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Finished</h2>
              <p className="text-gray-600">Your results have been saved and submitted successfully.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{finalScore}%</div>
                <div className="text-sm text-green-600">Final Score</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{correctCount}</div>
                <div className="text-sm text-blue-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
                <div className="text-sm text-red-600">Wrong</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
                <div className="text-sm text-purple-600">Time</div>
              </div>
            </div>

            {/* Performance feedback */}
            {quizResults && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Performance Summary</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {quizResults.isNewBestScore && (
                    <p className="text-green-700 font-medium">🎉 New best score achieved!</p>
                  )}
                  {quizResults.previousScore !== null && (
                    <p>Previous attempt: {Math.round(quizResults.previousScore)}%</p>
                  )}
                  {quizResults.improvement !== null && quizResults.improvement > 0 && (
                    <p className="text-green-700">Improved by {Math.round(quizResults.improvement)}%</p>
                  )}
                  {quizResults.canRetake && (
                    <p className="text-orange-700">You can retake this quiz once more today</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setShowReview(true)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                size="lg"
              >
                Review All Answers
              </Button>
              {wrongCount > 0 && (
                <Button 
                  onClick={() => setShowReview(true)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  Review Wrong Answers ({wrongCount})
                </Button>
              )}
              <Button 
                onClick={() => window.close()}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review mode for all answers
  if (quizCompleted && showReview) {
    const wrongAnswers = quizResults?.wrongAnswers || [];
    const allAnswers = answers || [];
    
    console.log('Review mode - quizResults:', quizResults);
    console.log('Review mode - wrongAnswers:', wrongAnswers);
    console.log('Review mode - allAnswers:', allAnswers);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quiz Review</h1>
                <p className="text-sm text-gray-500">Review your wrong answers with explanations</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowReview(false)}
              >
                Back to Results
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Review</h2>
            <p className="text-gray-600">Review all your answers and explanations</p>
          </div>
          
          {questions.map((question, index: number) => {
            const userAnswer = allAnswers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer ? userAnswer.isCorrect : false;
            const selectedAnswer = userAnswer ? userAnswer.selectedAnswer : null;
            
            return (
              <Card key={`${question.id}-${index}`} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-lg mb-2">Question {index + 1}: {question.question}</div>
                      <div className="flex items-center space-x-2">
                        <div className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </div>
                        <Badge variant="outline">
                          {question.category}
                        </Badge>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? "Correct" : "Wrong"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Options with correct/wrong indicators */}
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isCorrectOption = optionIndex === question.correctAnswer;
                      const isSelected = optionIndex === selectedAnswer;
                      
                      return (
                        <div 
                          key={optionIndex}
                          className={`p-3 border rounded-lg ${
                            isCorrectOption 
                              ? 'bg-green-50 border-green-200' 
                              : isSelected 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCorrectOption 
                                ? 'bg-green-600 text-white' 
                                : isSelected 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCorrectOption ? '✓' : isSelected ? '✗' : optionIndex + 1}
                            </div>
                            <span className={isCorrectOption ? 'font-medium text-green-800' : isSelected ? 'text-red-800' : 'text-gray-700'}>
                              {option}
                            </span>
                            {isCorrectOption && <Badge variant="secondary" className="ml-auto">Correct Answer</Badge>}
                            {isSelected && !isCorrectOption && <Badge variant="destructive" className="ml-auto">Your Answer</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Explanation */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                    <p className="text-blue-700">
                      {question.explanation || 'No explanation available for this question.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <div className="text-center pt-6">
            <Button 
              onClick={() => setShowReview(false)}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Back to Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check to prevent accessing undefined currentQuestion
  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="text-center text-red-600">Loading Error</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Loading Error</h2>
              <p className="text-gray-600">Unable to load quiz questions. Please try again.</p>
            </div>
            <div className="text-center">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full width, no sidebar */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full fixed top-0 left-0 right-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Quiz in Progress</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
                {attemptInfo && (
                  <Badge variant="outline" className="text-xs">
                    Attempt {(attemptInfo.totalAttempts || 0) + 1}/2
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {!fullscreenMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enterFullscreen}
                  className="bg-red-100 text-red-700 border-red-300"
                >
                  Enter Fullscreen (Required)
                </Button>
              )}
            </div>
          </div>
          <Progress value={(timeSpent / (30 * 60)) * 100} className="mt-2" />
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto p-6 pt-24">
        {/* Security Warning */}
        {quizStarted && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <div>
                <div className="font-semibold">Security Mode Active</div>
                <div className="text-sm">Tab switching, right-click, and developer tools are disabled. Focus on your quiz!</div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg">{currentQuestion.question}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </div>
                  <Badge variant="outline">
                    {currentQuestion.points} points
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlag}
                className={flaggedQuestions.has(currentQuestionIndex) ? 'bg-yellow-100' : ''}
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {currentQuestion.options.map((option, optionIndex) => (
                  <label 
                    key={optionIndex} 
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="quiz-answer"
                      value={optionIndex}
                      checked={selectedAnswer === optionIndex}
                      onChange={() => setSelectedAnswer(optionIndex)}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigateQuestion('prev')}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigateQuestion('next')}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <Button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
