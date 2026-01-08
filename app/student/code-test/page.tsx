'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Play, 
  BarChart3, 
  Clock, 
  Trophy, 
  Target,
  TestTube,
  Terminal,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  Square,
  Download,
  Flag
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';

interface CodeTestStats {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  languages: string[];
  totalSessions: number;
  codeExecutions: number;
  favoriteLanguage: string;
  accuracy: number;
  totalQuizzes: number;
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

interface ExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  status: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: string;
}

interface ExecutionHistory {
  id: number;
  language: string;
  languageId: number;
  code: string;
  input?: string;
  output?: string;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  errorMessage?: string;
  executedAt: string;
  // Test result properties
  totalScore?: number;
  maxScore?: number;
  timeSpent?: number;
  completedAt?: string;
}

const SUPPORTED_LANGUAGES = [
  { id: 1, name: 'JavaScript', version: 'Node.js 18.15.0' },
  { id: 2, name: 'Python', version: '3.8.1' },
  { id: 3, name: 'Java', version: 'JDK 1.8.0_66' },
  { id: 4, name: 'C++', version: 'GCC 9.2.0' },
  { id: 5, name: 'C', version: 'GCC 9.2.0' },
  { id: 6, name: 'C#', version: 'Mono 6.6.0.161' },
  { id: 7, name: 'Go', version: '1.13.5' },
  { id: 8, name: 'Rust', version: '1.40.0' },
  { id: 9, name: 'PHP', version: '7.4.1' },
  { id: 10, name: 'Ruby', version: '2.7.0' }
];

export default function CodeTestPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<CodeTestStats | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Code execution state
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('# Welcome to Code Execution\n# Write your Python code here\nprint("Hello, World!")');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  
  // Execution history state
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Daily test state
  const [dailyTestAvailable, setDailyTestAvailable] = useState(true);
  const [testDifficulty, setTestDifficulty] = useState('medium');
  const [testLanguage, setTestLanguage] = useState('python');
  const [testTakenToday, setTestTakenToday] = useState(false);

  // Auth Helper
  const getAuthPayload = () => {
    if (typeof window === 'undefined') return null;
    
    let token = localStorage.getItem('access_token');
    
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

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both code test stats and quiz stats
      const [codeStatsResponse, quizStatsResponse] = await Promise.all([
        fetch('/api/student/code-test-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/student/quiz-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let codeStats: any = {};
      let quizStats: any = {};

      if (codeStatsResponse.ok) {
        codeStats = await codeStatsResponse.json();
      }

      if (quizStatsResponse.ok) {
        quizStats = await quizStatsResponse.json();
      }

      // Combine stats with quiz data
      setStats({
        totalTests: codeStats.totalTests || 0,
        completedTests: codeStats.completedTests || 0,
        averageScore: quizStats.averageScore || codeStats.averageScore || 0,
        bestScore: quizStats.bestScore || codeStats.bestScore || 0,
        currentStreak: quizStats.currentStreak || codeStats.currentStreak || 0,
        languages: codeStats.languages || [],
        totalSessions: codeStats.totalSessions || 0,
        codeExecutions: codeStats.codeExecutions || 0,
        favoriteLanguage: studentData?.favoriteLanguage || 'Python 3',
        accuracy: quizStats.accuracy || 0,
        totalQuizzes: quizStats.totalQuizzes || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values if API fails
      setStats({
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0,
        languages: [],
        totalSessions: 0,
        codeExecutions: 0,
        favoriteLanguage: studentData?.favoriteLanguage || 'Python 3',
        accuracy: 0,
        totalQuizzes: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecutionHistory = async () => {
    try {
      console.log('📚 Loading test results in code test...');
      setIsLoadingHistory(true);
      
      // Get current student ID from auth
      const authResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!authResponse.ok) {
        console.error('❌ Failed to get auth data');
        return;
      }
      
      const authData = await authResponse.json();
      const studentId = authData.id;
      
      console.log('👤 Student ID for test results loading:', studentId);

      const response = await fetch(`/api/student/code-test-results?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Test results API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Test results API response data:', data);
        
        if (data.success && data.sessions) {
          console.log(`📝 Found ${data.sessions.length} test sessions`);
          // Transform test sessions to match the execution history format
          const transformedHistory = data.sessions.map((session: any) => ({
            id: session.id,
            language: session.language,
            code: 'Test Session Code', // Placeholder since we don't store individual code
            input: '',
            output: `Score: ${session.totalScore}/${session.maxScore}`,
            status: session.isCompleted ? 'completed' : 'incomplete',
            executedAt: session.sessionDate,
            executionTime: session.timeSpent,
            memory: null,
            totalScore: session.totalScore,
            maxScore: session.maxScore,
            timeSpent: session.timeSpent,
            completedAt: session.completedAt
          }));
          setExecutionHistory(transformedHistory);
        } else {
          console.log('❌ No test results found or API returned error');
        }
      } else {
        console.error('❌ Failed to load test results, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading test results:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const checkDailyTestStatus = async () => {
    try {
      const authPayload = getAuthPayload();
      if (!authPayload) return;

      const response = await fetch('/api/student/code-test-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestTakenToday(data.testTakenToday || false);
        setDailyTestAvailable(!data.testTakenToday);
      }
    } catch (error) {
      console.error('Error checking daily test status:', error);
    }
  };

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
        
        // Set favorite language as default if available
        if (data.favoriteLanguage) {
          const favoriteLang = data.favoriteLanguage.toLowerCase();
          setSelectedLanguage(favoriteLang);
          setTestLanguage(favoriteLang);
          
          // Update default code based on language
          if (favoriteLang === 'javascript') {
            setCode('// Welcome to Code Execution\n// Write your JavaScript code here\nconsole.log("Hello, World!");');
          } else if (favoriteLang === 'python') {
            setCode('# Welcome to Code Execution\n# Write your Python code here\nprint("Hello, World!")');
          } else if (favoriteLang === 'java') {
            setCode('// Welcome to Code Execution\n// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const language = SUPPORTED_LANGUAGES.find(lang => 
        lang.name.toLowerCase() === selectedLanguage.toLowerCase()
      );

      if (!language) {
        throw new Error('Unsupported language');
      }

      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language.id,
          stdin: ''
        })
      });

      const result = await response.json();
      setExecutionResult(result);
      
      // Save execution history
      try {
        console.log('💾 Attempting to save execution history in code test...');
        
        // Get current student ID from auth
        const authResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!authResponse.ok) {
          console.error('❌ Failed to get auth data for saving history');
          return;
        }
        
        const authData = await authResponse.json();
        const studentId = authData.id;
        
        console.log('👤 Student ID for saving history:', studentId);
        
        const saveResponse = await fetch('/api/student/code-execution-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: studentId,
            language: language.name,
            languageId: language.id,
            code: code,
            input: '',
            output: result.stdout || '',
            status: result.status.id === 3 ? 'success' : 'error',
            executionTime: result.time ? parseFloat(result.time) * 1000 : null,
            memoryUsed: result.memory ? parseInt(result.memory) : null,
            errorMessage: result.stderr || result.compile_output || null
          })
        });
        
        const saveResult = await saveResponse.json();
        console.log('✅ Save execution history response:', saveResult);
        
        if (!saveResponse.ok) {
          console.error('❌ Failed to save execution history:', saveResult);
        }
        
        // Reload history after saving
        loadExecutionHistory();
      } catch (error) {
        console.error('❌ Error saving execution history:', error);
      }
      
      if (result.status.id === 3) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Code execution failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      toast.error('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  const startDailyTest = () => {
    if (testTakenToday) {
      toast.error('You have already taken the daily test today. Come back tomorrow!');
      return;
    }

    toast.success('Starting AI-generated daily coding test...');
    // Open the actual coding test page with timer and questions
    const testWindow = window.open(
      `/student/code-test-old?test=true&difficulty=${testDifficulty}&language=${testLanguage}`, 
      'testWindow',
      'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (testWindow) {
      testWindow.focus();
      // Listen for test completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'TEST_COMPLETED') {
          toast.success('Coding test completed! Refreshing stats...');
          loadStats(); // Refresh stats after test completion
          loadExecutionHistory(); // Refresh execution history
          checkDailyTestStatus(); // Update daily test status
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } else {
      toast.error('Popup blocked. Please allow popups for this site.');
    }
  };

  const startFreePractice = () => {
    toast.success('Opening free practice mode...');
    window.open('/student/code-window?practice=true', '_blank');
  };

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
      
      if (authPayload) {
        loadStats();
        fetchStudentData();
        loadExecutionHistory();
        checkDailyTestStatus();
      }
    };
    
    checkAuth();
  }, []);

  // Listen for quiz completion messages from popup windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'QUIZ_COMPLETED') {
        console.log('Quiz completed, refreshing stats...');
        loadStats(); // Refresh stats when quiz is completed
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Refresh stats when page becomes visible (user returns from quiz)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuth) {
        console.log('Page became visible, refreshing stats...');
        loadStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuth]);

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
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Code Testing</h1>
          <Button
            onClick={loadStats}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <div className="w-4 h-4 mr-2">🔄</div>
                Refresh Stats
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-600">Practice coding skills with interactive challenges and real-time execution</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.bestScore}%</div>
              <p className="text-xs text-muted-foreground">highest achieved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">overall performance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">correct answers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="daily-test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily-test">Daily Coding Test</TabsTrigger>
          <TabsTrigger value="code-execution">Code Execution</TabsTrigger>
          <TabsTrigger value="history">Test Results</TabsTrigger>
        </TabsList>

        {/* Daily Coding Test Tab */}
        <TabsContent value="daily-test" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daily Coding Test</h2>
                  <p className="text-gray-600">Take your daily coding challenge - 5 AI-generated questions</p>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                {testTakenToday ? (
                  <>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">Test Completed Today</Badge>
                    <Badge variant="outline" className="border-red-300 text-red-600">Come back tomorrow</Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">Test Available</Badge>
                    <Badge className="bg-black text-white">Ready to take</Badge>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-language">Programming Language</Label>
                  <Select value={testLanguage} onValueChange={setTestLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.name.toLowerCase()}>
                          {lang.name} {lang.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    {testDifficulty === 'easy' ? 'Easy' : testDifficulty === 'medium' ? 'Medium' : 'Hard'} difficulty questions will be generated
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={startDailyTest}
                    size="lg"
                    disabled={testTakenToday}
                    className={testTakenToday ? "bg-gray-400 text-gray-600 px-6 py-3" : "bg-green-600 hover:bg-green-700 text-white px-6 py-3"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {testTakenToday ? 'Test Completed Today' : 'Start Daily Test'}
                  </Button>
                  
                  <Button 
                    onClick={startFreePractice}
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Free Practice Mode
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Execution Tab */}
        <TabsContent value="code-execution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Code Editor
                </CardTitle>
                <CardDescription>
                  Write and execute code in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language-select">Programming Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.name.toLowerCase()}>
                          {lang.name} {lang.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={executeCode}
                    disabled={isExecuting}
                    className="flex-1"
                  >
                    {isExecuting ? (
                      <>
                        <Square className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={() => setCode('')}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Execution Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Execution Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executionResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={executionResult.status.id === 3 ? "default" : "destructive"}
                        className={
                          executionResult.status.id === 3 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {executionResult.status.description}
                      </Badge>
                      {executionResult.time && (
                        <span className="text-sm text-gray-600">
                          Time: {executionResult.time}s
                        </span>
                      )}
                    </div>

                    {executionResult.stdout && (
                      <div>
                        <Label className="text-sm font-medium">Output:</Label>
                        <div className="mt-1 p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                          {executionResult.stdout}
                        </div>
                      </div>
                    )}

                    {executionResult.stderr && (
                      <div>
                        <Label className="text-sm font-medium text-red-600">Error:</Label>
                        <div className="mt-1 p-3 bg-red-50 text-red-800 rounded font-mono text-sm overflow-x-auto">
                          {executionResult.stderr}
                        </div>
                      </div>
                    )}

                    {executionResult.compile_output && (
                      <div>
                        <Label className="text-sm font-medium text-yellow-600">Compile Output:</Label>
                        <div className="mt-1 p-3 bg-yellow-50 text-yellow-800 rounded font-mono text-sm overflow-x-auto">
                          {executionResult.compile_output}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No code executed yet</p>
                    <p className="text-sm">Write some code and click "Run Code" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Test Results
                  </CardTitle>
                  <CardDescription>
                    View your past test scores and performance
                  </CardDescription>
                </div>
                <Button
                  onClick={loadExecutionHistory}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 mr-2">🔄</div>
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading history...</span>
                </div>
              ) : executionHistory.length > 0 ? (
                <div className="space-y-4">
                  {executionHistory.map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={entry.status === 'completed' ? 'default' : 'destructive'}
                              className={
                                entry.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {entry.status}
                            </Badge>
                            <Badge variant="outline">{entry.language}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.executedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {entry.timeSpent && (
                              <span>Time: {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Test Score:</Label>
                            <div className="mt-1 p-3 bg-blue-50 text-blue-800 rounded font-mono text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-lg">{entry.totalScore || 0}/{entry.maxScore || 0}</span>
                                <span className="text-sm">
                                  {entry.totalScore && entry.maxScore ? Math.round((entry.totalScore / entry.maxScore) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Test Details:</Label>
                            <div className="mt-1 p-3 bg-gray-50 text-gray-800 rounded text-sm">
                              <div className="space-y-1">
                                <div><strong>Language:</strong> {entry.language}</div>
                                <div><strong>Date:</strong> {new Date(entry.executedAt).toLocaleDateString()}</div>
                                <div><strong>Time:</strong> {new Date(entry.executedAt).toLocaleTimeString()}</div>
                                {entry.timeSpent && (
                                  <div><strong>Duration:</strong> {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No test results yet</p>
                  <p className="text-sm">Take a coding test to see your results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Track your coding performance and progress</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/student/code-execution-dashboard')}
            >
              View Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <TestTube className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Code Challenges</h3>
            <p className="text-sm text-gray-600 mb-4">Solve algorithmic problems and coding challenges</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/student/code-window?challenges=true', '_blank')}
            >
              Start Challenges
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Code Window</h3>
            <p className="text-sm text-gray-600 mb-4">Open full-screen coding environment</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/student/code-window', '_blank')}
            >
              Open Window
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
