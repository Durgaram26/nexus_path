'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Flag, CheckCircle, ArrowLeft, ArrowRight, Play, Brain, Shield, AlertTriangle, Zap, Target } from 'lucide-react';





interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  timeLimit?: number;
}

interface QuizSession {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  timeLimit: number;
  isAdaptive: boolean;
  currentQuestion: number;
  answers: unknown[];
  timeSpent: number;
  timeRemaining: number;
  started: boolean;
  completed: boolean;
}

export default function LMSQuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Mock quiz data - in real app, this would come from API
  const mockQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the time complexity of binary search in a sorted array?',
      options: [
        'O(n)',
        'O(log n)',
        'O(n²)',
        'O(1)'
      ],
      correctAnswer: 1,
      explanation: 'Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.',
      category: 'Data Structures',
      difficulty: 'MEDIUM',
      points: 2,
      timeLimit: 60
    },
    {
      id: '2',
      question: 'Which data structure follows LIFO (Last In, First Out) principle?',
      options: [
        'Queue',
        'Stack',
        'Array',
        'Linked List'
      ],
      correctAnswer: 1,
      explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
      category: 'Data Structures',
      difficulty: 'EASY',
      points: 1,
      timeLimit: 45
    },
    {
      id: '3',
      question: 'What is the main advantage of using a hash table?',
      options: [
        'Constant time average case lookup',
        'Guaranteed sorted order',
        'Memory efficiency',
        'Easy to implement'
      ],
      correctAnswer: 0,
      explanation: 'Hash tables provide O(1) average case time complexity for insert, delete, and lookup operations.',
      category: 'Algorithms',
      difficulty: 'HARD',
      points: 3,
      timeLimit: 90
    }
  ];

  const initializeQuiz = () => {
    const newSession: QuizSession = {
      id: 'quiz_' + Date.now(),
      title: 'Adaptive Data Structures Assessment',
      description: 'AI-powered adaptive quiz that adjusts to your learning pace and performance',
      totalQuestions: mockQuestions.length,
      timeLimit: 30, // 30 minutes
      isAdaptive: true,
      currentQuestion: 1,
      answers: [],
      timeSpent: 0,
      timeRemaining: 30 * 60, // 30 minutes in seconds
      started: false,
      completed: false
    };
    
    setSession(newSession);
    setQuestions(mockQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowInstructions(true);
    setFlaggedQuestions(new Set());
  };

  
  const startQuiz = () => {
    setShowInstructions(false);
    setSession(prev => prev ? { ...prev, started: true } : null);
    
    // Start timer
    const timer = setInterval(() => {
      setSession(prev => {
        if (!prev || prev.completed) {
          clearInterval(timer);
          return prev;
        }
        
        const newTimeSpent = prev.timeSpent + 1;
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          finishQuiz();
          clearInterval(timer);
        }
        
        return {
          ...prev,
          timeSpent: newTimeSpent,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);
    
    (window as any).quizTimer = timer;
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer before proceeding');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
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
      timeSpent: session?.timeSpent || 0,
      category: currentQuestion.category,
      difficulty: currentQuestion.difficulty
    };

    setSession(prev => prev ? {
      ...prev,
      answers: [...prev.answers, answer],
      currentQuestion: prev.currentQuestion + 1
    } : null);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setSession(prev => prev ? { ...prev, completed: true } : null);
    setShowResults(true);
    
    if ((window as any).quizTimer) {
      clearInterval((window as any).quizTimer);
    }
    
    toast.success(`Quiz completed! Score: ${score}/${questions.reduce((sum, q) => sum + q.points, 0)}`);
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
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

  // Anti-cheat measures
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        toast.error('This action is not allowed during the quiz');
      }
    };

    if (session?.started) {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [session?.started]);

  useEffect(() => {
    initializeQuiz();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {session?.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {session?.isAdaptive ? 'AI Adaptive Quiz' : 'Standard Quiz'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {session?.started && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-600">
                    {formatTime(session.timeRemaining)}
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreenMode(!fullscreenMode)}
              >
                {fullscreenMode ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Instructions */}
        {showInstructions && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center text-blue-800">
                <div className="w-5 h-5 mr-2" />
                Quiz Instructions
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Time Limit: {session?.timeLimit} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-blue-600 mr-2" />
                    <span>{session?.totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Adaptive Assessment</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    <span>Answer all questions</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                    <span>No going back to previous questions</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-600 mr-2" />
                    <span>AI-powered adaptive difficulty</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Important Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• This is an adaptive assessment that adjusts to your performance</li>
                  <li>• Each question has a single correct answer</li>
                  <li>• You cannot return to previous questions once answered</li>
                  <li>• The quiz will auto-submit when time expires</li>
                  <li>• Flag questions you want to review later</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={startQuiz}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Content */}
        {session?.started && !session.completed && currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {currentQuestion.category} • {currentQuestion.difficulty}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </div>
                  <div className="px-2 py-1 text-xs border rounded">
                    {currentQuestion.points} points
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
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label 
                        key={index} 
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="quiz-answer"
                          value={index}
                          checked={selectedAnswer === index}
                          onChange={() => setSelectedAnswer(index)}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigateQuestion('')}
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
                    onClick={() => { if (currentQuestionIndex < questions.length - 1) navigateQuestion('next'); else finishQuiz(); }}
                    disabled={selectedAnswer === null}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                <div className="text-lg font-semibold">Quiz Results</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-green-600">Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100)}%
                    </div>
                    <div className="text-sm text-blue-600">Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatTime(session?.timeSpent || 0)}
                    </div>
                    <div className="text-sm text-purple-600">Time Spent</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {flaggedQuestions.size}
                    </div>
                    <div className="text-sm text-orange-600">Questions Flagged</div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <Button 
                    onClick={initializeQuiz}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <div className="w-4 h-4 mr-2" />
                    Take Another Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
