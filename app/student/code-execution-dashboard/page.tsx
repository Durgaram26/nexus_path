'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Play, Code, Zap, Trophy, TrendingUp, RefreshCw } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
// import { isAuthenticated } from '@/lib/auth';

// Simple authentication check
const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';

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
  favoriteLanguage?: string;
}

interface ProgrammingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  languageId: number;
  starterCode: string;
  expectedOutput: string;
  testCases: TestCase[];
  hints: string[];
  category: string;
  points: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface Language {
  id: number;
  name: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { id: 71, name: 'Python 3' },
  { id: 62, name: 'Java' },
  { id: 54, name: 'C++' },
  { id: 50, name: 'C' },
  { id: 63, name: 'JavaScript' },
  { id: 68, name: 'PHP' },
  { id: 72, name: 'Ruby' },
  { id: 73, name: 'Rust' },
  { id: 74, name: 'TypeScript' },
];

export default function CodeExecutionDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Test states
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [canTakeTest, setCanTakeTest] = useState(true);
  const [testTaken, setTestTaken] = useState(false);
  const [lastTestDate, setLastTestDate] = useState<string | null>(null);
  
  // Statistics
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);
  const [languagePerformance, setLanguagePerformance] = useState<any[]>([]);

  // Check if it's a new day and reset test availability
  const checkDailyReset = useCallback(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastTestDate');
    
    if (storedDate !== today) {
      // New day - reset test availability
      setCanTakeTest(true);
      setTestTaken(false);
      setLastTestDate(today);
      localStorage.setItem('lastTestDate', today);
      localStorage.removeItem('testTaken');
      console.log('Daily reset: New day detected, test available again');
    } else {
      // Same day - check if test was already taken
      const testTakenToday = localStorage.getItem('testTaken') === 'true';
      setTestTaken(testTakenToday);
      setCanTakeTest(!testTakenToday);
      setLastTestDate(storedDate);
    }
  }, []);

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/me');
      setStudent(response.data);
      
      // Set default language based on user's favorite language
      if (response.data.favoriteLanguage) {
        const favoriteLanguage = SUPPORTED_LANGUAGES.find(
          lang => lang.name === response.data.favoriteLanguage
        );
        if (favoriteLanguage) {
          setSelectedLanguage(favoriteLanguage);
        }
      }
      
      // Check daily reset
      checkDailyReset();
      
      // Load statistics
      await loadStatistics();
    } catch (error: unknown) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
      if ((error as any)?.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  }, [checkDailyReset]);

  const loadStatistics = async () => {
    try {
      console.log('Loading statistics from database...');
      
      // Get current student ID from auth
      const authResponse = await api.get('/auth/me');
      const studentId = authResponse.data.id;
      
      // Fetch test sessions from database
      const sessionsResponse = await fetch(`/api/student/code-test-results?studentId=${studentId}`);
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        if (sessionsData.success && sessionsData.sessions) {
          const sessions = sessionsData.sessions;
          setTotalSessions(sessions.length);
          setSessionHistory(sessions);
          console.log('Loaded sessions:', sessions.length);

          // Calculate average score
          if (sessions.length > 0) {
            const totalScore = sessions.reduce((sum: number, session: any) => sum + (session.totalScore || 0), 0);
            const maxScore = sessions.reduce((sum: number, session: any) => sum + (session.maxScore || 25), 0);
            const avgScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
            setAverageScore(avgScore);
            console.log('Average score calculated:', avgScore);
          }

          // Calculate day streak
          const streak = calculateDayStreak(sessions);
          setDayStreak(streak);
          console.log('Day streak calculated:', streak);

          // Calculate language performance
          const langPerf = calculateLanguagePerformance(sessions);
          setLanguagePerformance(langPerf);
          console.log('Language performance calculated:', langPerf);
        }
      }

      // Fetch execution history from database
      const historyResponse = await fetch(`/api/student/code-execution-history?studentId=${studentId}&limit=100`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success && historyData.history) {
          setTotalExecutions(historyData.history.length);
          console.log('Loaded execution history:', historyData.history.length);
        }
      }
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set defaults on error
      setTotalSessions(0);
      setTotalExecutions(0);
      setSessionHistory([]);
      setAverageScore(0);
      setDayStreak(0);
      setLanguagePerformance([]);
    }
  };

  const startTest = async () => {
    if (!canTakeTest) {
      toast.error('You have already taken today\'s coding test. Come back tomorrow!');
      return;
    }

    setIsStartingTest(true);
    setError(null);
    
    // Show initial loading message
    toast.info('Generating AI questions... This may take a moment.', {
      duration: 5000
    });
    
    try {
      console.log('Starting test with language:', selectedLanguage.name);
      
      // Generate questions automatically when starting test
      const response = await api.post('/code-execution/generate-questions', {
        language: selectedLanguage.name,
        languageId: selectedLanguage.id,
        difficulty: selectedDifficulty || 'MEDIUM', // Use selected difficulty
        count: selectedQuestionCount || 5, // Use selected question count
        category: 'Daily Coding Test'
      }, {
        timeout: 60000 // 60 seconds for AI question generation
      });
      
      console.log('Questions generated successfully:', response.data);

      const { questions: generatedQuestions } = response.data;
      
        // Mark test as taken for today immediately
        setTestTaken(true);
        setCanTakeTest(false);
        localStorage.setItem('testTaken', 'true');
        localStorage.setItem('lastTestDate', new Date().toDateString());

      // Show success message first
      toast.success('Questions generated successfully! Opening test window...');
      
      // Wait a moment for the toast to show, then open the test window
      setTimeout(() => {
        const testWindow = window.open(
          '/student/code-test-old?test=true',
          'codeTestWindow',
          'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
        );
        
        if (testWindow) {
          // Send questions to the test window when it loads
          const sendQuestions = () => {
            testWindow.postMessage({
              type: 'PRELOAD_QUESTIONS',
              questions: generatedQuestions,
              language: selectedLanguage
            }, '*');
          };
          
          // Wait for window to load, then send questions
          setTimeout(sendQuestions, 2000);
          
          toast.success('Daily coding test started! Complete all 5 questions.');
        } else {
          toast.error('Please allow popups to open the test window');
          // Reset states if window failed to open
          setTestTaken(false);
          setCanTakeTest(true);
        }
      }, 1000);
    } catch (error: unknown) {
      console.error('Test start error:', error);
      
      let errorMessage = 'Failed to start test';
      if ((error as any).code === 'ECONNABORTED' || (error as Error).message.includes('timeout')) {
        errorMessage = 'Test generation timed out';
        toast.error(errorMessage, {
          description: 'The AI is taking longer than expected. Please try again.'
        });
      } else {
        errorMessage = (error as any)?.response?.data?.message || (error as Error).message || 'Failed to start test';
        toast.error(errorMessage);
      }
      
      setError(errorMessage);
      // Reset states on error
      setTestTaken(false);
      setCanTakeTest(true);
    } finally {
      setIsStartingTest(false);
    }
  };

  const openFreeCodeEditor = () => {
    const codeWindow = window.open(
      '/student/code-window',
      'codeWindow',
      'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no'
    );
    
    if (!codeWindow) {
      toast.error('Please allow popups to open the code execution platform');
    }
  };

  const handleLanguageChange = (languageName: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.name === languageName);
    if (language) {
      setSelectedLanguage(language);
    }
  };

  // Manual daily reset (for testing purposes)
  const resetDailyTest = () => {
    localStorage.removeItem('testTaken');
    localStorage.removeItem('lastTestDate');
    setTestTaken(false);
    setCanTakeTest(true);
    toast.success('Daily test reset! You can now take a fresh test.');
  };

  // Calculate day streak from test sessions
  const calculateDayStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date (newest first)
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.sessionDate);
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(sessionDate.getTime() - 24 * 60 * 60 * 1000); // Previous day
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate language performance from test sessions
  const calculateLanguagePerformance = (sessions: any[]) => {
    if (sessions.length === 0) return [];
    
    const languageStats: { [key: string]: { count: number; totalScore: number; maxScore: number } } = {};
    
    sessions.forEach(session => {
      const lang = session.language || 'Unknown';
      if (!languageStats[lang]) {
        languageStats[lang] = { count: 0, totalScore: 0, maxScore: 0 };
      }
      languageStats[lang].count++;
      languageStats[lang].totalScore += session.totalScore || 0;
      languageStats[lang].maxScore += session.maxScore || 25;
    });
    
    return Object.entries(languageStats).map(([language, stats]) => ({
      language,
      tests: stats.count,
      averageScore: stats.maxScore > 0 ? Math.round((stats.totalScore / stats.maxScore) * 100) : 0
    }));
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  // Listen for messages from code execution window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CODE_EXECUTED') {
        console.log('Code executed:', event.data.result);
        
        // Update statistics
        setTotalExecutions(prev => prev + 1);
      } else if (event.data.type === 'TEST_COMPLETED') {
        console.log('Daily test completed');
        toast.success('Daily coding test completed! Check your results below.');
        
        // Update statistics
        setTotalSessions(prev => prev + 1);
        loadStatistics(); // Refresh stats
      } else if (event.data.type === 'CODE_WINDOW_CLOSED') {
        console.log('Code execution window closed');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <StudentSidebar
          onNavigate={(section) => {
            if (section === 'code-execution') return;
            router.push(`/student/career-dashboard#${section}`);
          }}
          activeTab="code-execution"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading code execution dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex h-screen bg-gray-50">
        <StudentSidebar
          onNavigate={(section) => {
            if (section === 'code-execution') return;
            router.push(`/student/career-dashboard#${section}`);
          }}
          activeTab="code-execution"
        />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{}</p>
              <Button onClick={fetchStudentProfile} className="bg-blue-600 hover:bg-blue-700">
                <div className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSidebar
        onNavigate={(section) => {
          if (section === 'code-execution') {
            // Already on code execution dashboard
            return;
          }
          // Navigate to career dashboard with the selected section
          router.push(`/student/career-dashboard#${section}`);
        }}
        activeTab="code-execution"
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Code Execution Platform</h1>
            <p className="text-gray-600">Practice programming with AI-generated questions and real-time code execution</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalSessions}</h3>
                <p className="text-gray-600 text-sm">Total Sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalExecutions}</h3>
                <p className="text-gray-600 text-sm">Code Executions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{student?.favoriteLanguage || 'Not set'}</h3>
                <p className="text-gray-600 text-sm">Favorite Language</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">∞</h3>
                <p className="text-gray-600 text-sm">No Limits</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Coding Test</h2>
                <p className="text-gray-600 mb-6">Take your daily coding challenge - 5 AI-generated questions</p>
                
                {/* Test Status */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Badge variant="outline" className="px-3 py-1">
                    {testTaken ? "Test Completed" : "Test Available"}
                  </Badge>
                  <Badge variant={canTakeTest ? "default" : "destructive"} className="px-3 py-1">
                    {canTakeTest ? "Ready to take" : "Come back tomorrow"}
                  </Badge>
                </div>
              </div>

              {/* Configuration */}
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <Label htmlFor="language" className="text-sm font-medium">Programming Language</Label>
                  <Select 
                    value={selectedLanguage.name} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.name}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Choose your preferred difficulty and question count</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                    <Select 
                      value={selectedDifficulty} 
                      onValueChange={(value) => setSelectedDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy (1-2 points per question)</SelectItem>
                        <SelectItem value="MEDIUM">Medium (3-4 points per question)</SelectItem>
                        <SelectItem value="HARD">Hard (5-6 points per question)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="questionCount" className="text-sm font-medium">Number of Questions</Label>
                    <Select 
                      value={selectedQuestionCount.toString()} 
                      onValueChange={(value) => setSelectedQuestionCount(parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Questions (Quick Test)</SelectItem>
                        <SelectItem value="5">5 Questions (Standard)</SelectItem>
                        <SelectItem value="10">10 Questions (Comprehensive)</SelectItem>
                        <SelectItem value="15">15 Questions (Extended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 justify-center">
                  {!testTaken ? (
                    <Button 
                      onClick={startTest}
                      disabled={isStartingTest || !canTakeTest}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isStartingTest ? (
                        <>
                          <div className="w-5 h-5 mr-2 animate-spin" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Start Daily Test
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <h3 className="font-semibold text-gray-800 mb-2">Test Completed</h3>
                      <p className="text-gray-700 text-sm mb-2">
                        You have completed today's coding test in {selectedLanguage.name}.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Come back tomorrow for a new test!
                      </p>
                    </div>
                  )}
                  
                  {/* Manual reset button for testing */}
                  {testTaken && (
                    <Button 
                      onClick={resetDailyTest}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset for Testing
                    </Button>
                  )}
                  
                  <Button 
                    onClick={openFreeCodeEditor}
                    variant="outline"
                    size="lg"
                    disabled={testTaken}
                  >
                    <Code className="w-5 h-5 mr-2" />
                    Free Practice Mode
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scoreboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Test Results
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Today's Result */}
                  {testTaken && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">Today's Test</span>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                      <div className="text-center text-sm text-green-700">
                        <p>Test completed in {selectedLanguage.name}</p>
                        <p className="text-xs mt-1">Great job! Come back tomorrow for fresh AI-generated questions.</p>
                        <div className="mt-2 text-xs text-green-600">
                          Next test available: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Previous Results */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Previous Tests</h4>
                    {sessionHistory.length > 0 ? (
                      sessionHistory.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Code className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{new Date(session.sessionDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-600">{session.language}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{session.totalScore}/{session.maxScore}</p>
                            <p className="text-xs text-gray-600">{Math.floor(session.timeSpent / 60)}m</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No test history yet</p>
                        <p className="text-xs">Take your first test to see results here</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Performance Overview
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Average Score */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-700">{averageScore}%</h3>
                    <p className="text-blue-600 text-sm">Average Score</p>
                    <p className="text-xs text-blue-500 mt-1">
                      {averageScore > 0 ? `Based on ${totalSessions} test${totalSessions !== 1 ? 's' : ''}` : 'Take tests to see your average'}
                    </p>
                  </div>
                  
                  {/* Language Performance */}
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-3">Language Performance</h4>
                    {languagePerformance.length > 0 ? (
                      <div className="space-y-2">
                        {languagePerformance.map((lang, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600">{lang.language.charAt(0)}</span>
                              </div>
                              <span className="text-sm font-medium">{lang.language}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{lang.averageScore}%</p>
                              <p className="text-xs text-gray-500">{lang.tests} test{lang.tests !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No performance data yet</p>
                        <p className="text-xs">Complete tests to track your progress</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Streak */}
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-700">{dayStreak}</h3>
                    <p className="text-orange-600 text-sm">Day Streak</p>
                    <p className="text-xs text-orange-500 mt-1">
                      {dayStreak > 0 ? `Keep it up! ${dayStreak} day${dayStreak !== 1 ? 's' : ''} in a row` : 'Start your streak today!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
