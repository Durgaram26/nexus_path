'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Square,
  Download,
  Flag,
  TestTube
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';

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
  { id: 74, name: 'TypeScript' },
];

const getMonacoLanguage = (languageName: string): string => {
  const languageMap: { [key: string]: string } = {
    'Python 3': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'C': 'c',
    'JavaScript': 'javascript',
    'PHP': 'php',
    'Ruby': 'ruby',
    'TypeScript': 'typescript'
  };
  return languageMap[languageName] || 'plaintext';
};

// Enhanced test case validation function
const validateTestCaseOutput = (actualOutput: string, expectedOutput: string): boolean => {
  const actual = actualOutput.trim();
  const expected = expectedOutput.trim();
  
  // If both are empty, they match
  if (!actual && !expected) return true;
  
  // If one is empty and other isn't, they don't match
  if (!actual || !expected) return false;
  
  // Split into lines and clean them
  const actualLines = actual.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const expectedLines = expected.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // For single line output, exact match required
  if (expectedLines.length === 1) {
    return actualLines.length === 1 && actualLines[0] === expectedLines[0];
  }
  
  // For multi-line output, check if all expected lines are present in correct order
  if (actualLines.length !== expectedLines.length) {
    return false;
  }
  
  // Check line by line exact match
  return actualLines.every((line, index) => line === expectedLines[index]);
};

export default function CodeTestPage() {
  const [questions, setQuestions] = useState<ProgrammingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [answers, setAnswers] = useState<any[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTestResults, setCurrentTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Listen for questions from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PRELOAD_QUESTIONS') {
        setQuestions(event.data.questions);
        setSelectedLanguage(event.data.language);
        setCode(event.data.questions[0]?.starterCode || '');
        setLoading(false);
        setTestStarted(true);
        toast.success('Test loaded successfully!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCode(questions[currentQuestionIndex].starterCode);
      setInput('');
      setOutput('');
    }
  }, [questions, currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsExecuting(true);
    setOutput('');

    try {
      const response = await fetch('/api/code-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          languageId: selectedLanguage?.id || 71,
          input: input || ''
        })
      });

      const { token } = await response.json();

      if (!token) {
        throw new Error('No token received');
      }

      // Poll for results with timeout protection
      let attempts = 0;
      const maxAttempts = 10; // 10 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resultResponse = await fetch(`/api/code-execution?token=${token}`);
        const result = await resultResponse.json();
        
        if (result.status.id > 2) {
          let outputText = '';
          let statusMessage = '';
          
          if (result.status.id === 3) {
            // Success
            if (result.stdout) outputText += result.stdout;
            statusMessage = 'Code executed successfully!';
          } else if (result.status.id === 4) {
            // Wrong Answer
            if (result.stdout) outputText += result.stdout;
            statusMessage = 'Code executed but output may not be correct';
          } else if (result.status.id === 5) {
            // Time Limit Exceeded
            outputText = '⏰ Time Limit Exceeded\nYour code took too long to execute. Check for infinite loops.';
            statusMessage = 'Execution timed out - check for infinite loops';
          } else if (result.status.id === 6) {
            // Memory Limit Exceeded
            outputText = '💾 Memory Limit Exceeded\nYour code used too much memory.';
            statusMessage = 'Memory limit exceeded';
          } else if (result.status.id === 7) {
            // Runtime Error
            outputText = 'Runtime Error:\n' + (result.stderr || 'Unknown runtime error');
            statusMessage = 'Runtime error occurred';
          } else if (result.status.id === 8) {
            // Compilation Error
            outputText = 'Compilation Error:\n' + (result.compile_output || 'Compilation failed');
            statusMessage = 'Compilation failed';
          } else {
            outputText = 'Execution failed with status: ' + result.status.description;
            statusMessage = 'Execution failed';
          }
          
          if (result.stderr && result.status.id !== 7) {
            outputText += '\n\nError Output:\n' + result.stderr;
          }
          if (result.compile_output && result.status.id !== 8) {
            outputText += '\n\nCompile Output:\n' + result.compile_output;
          }
          
          setOutput(outputText || 'No output');
          
          if (result.status.id === 3) {
            toast.success(statusMessage);
          } else {
            toast.error(statusMessage);
          }
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        setOutput('⏰ Execution Timeout\nCode execution timed out. This might be due to:\n- Infinite loops\n- Long-running operations\n- Network issues');
        toast.error('Code execution timed out');
      }
      
    } catch (error: any) {
      console.error('Code execution error:', error);
      toast.error(error.message || 'Failed to execute code');
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const runTestCases = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunningTests(true);
    setCurrentTestResults(null);

    try {
      const testCases = currentQuestion.testCases;
      const results: any[] = [];
      let passedTests = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        const response = await fetch('/api/code-execution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            languageId: selectedLanguage?.id || 71,
            input: testCase.input
          })
        });

        const { token } = await response.json();

        if (!token) {
          throw new Error('No token received');
        }

        // Poll for results with timeout protection
        let attempts = 0;
        const maxAttempts = 10; // Reduced to 10 seconds max
        let result = null;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const resultResponse = await fetch(`/api/code-execution?token=${token}`);
          result = await resultResponse.json();
          
          if (result.status.id > 2) {
            break;
          }
          
          attempts++;
        }

        // Handle different execution statuses
        if (result && result.status.id === 3) {
          // Success - only pass if there's no stderr (runtime errors)
          const actualOutput = result.stdout?.trim() || '';
          const expectedOutput = testCase.expectedOutput.trim();
          const hasErrors = result.stderr && result.stderr.trim().length > 0;
          
          // Don't pass if there are runtime errors, even if stdout matches
          const passed = !hasErrors && validateTestCaseOutput(actualOutput, expectedOutput);
          
          if (passed) passedTests++;

          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: expectedOutput,
            actual: hasErrors ? `Runtime Error: ${result.stderr}` : actualOutput,
            passed: passed,
            description: testCase.description,
            status: passed ? 'success' : 'runtime_error',
            error: hasErrors ? result.stderr : undefined
          });
        } else if (result && result.status.id === 4) {
          // Wrong Answer
          const actualOutput = result.stdout?.trim() || '';
          const expectedOutput = testCase.expectedOutput.trim();
          
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            passed: false,
            description: testCase.description,
            status: 'wrong_answer'
          });
        } else if (result && result.status.id === 5) {
          // Time Limit Exceeded (infinite loop)
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'Time Limit Exceeded',
            passed: false,
            description: testCase.description,
            error: 'Your code took too long to execute. Check for infinite loops.',
            status: 'time_limit_exceeded'
          });
        } else if (result && result.status.id === 6) {
          // Memory Limit Exceeded
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'Memory Limit Exceeded',
            passed: false,
            description: testCase.description,
            error: 'Your code used too much memory.',
            status: 'memory_limit_exceeded'
          });
        } else if (result && result.status.id === 7) {
          // Runtime Error
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'Runtime Error',
            passed: false,
            description: testCase.description,
            error: result.stderr || 'Runtime error occurred',
            status: 'runtime_error'
          });
        } else if (result && result.status.id === 8) {
          // Compilation Error
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'Compilation Error',
            passed: false,
            description: testCase.description,
            error: result.compile_output || 'Compilation failed',
            status: 'compilation_error'
          });
        } else if (!result) {
          // No result received (timeout or connection issue)
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: 'No Result Received',
            passed: false,
            description: testCase.description,
            error: 'Code execution failed to return a result. This might be due to network issues or server problems.',
            status: 'no_result'
          });
        } else {
          // Other execution errors
          results.push({
            testCase: i + 1,
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Execution Failed: ${result.status.description}`,
            passed: false,
            description: testCase.description,
            error: `Execution failed with status: ${result.status.description}`,
            status: 'execution_failed'
          });
        }
      }

      // Calculate score (5 marks total, partial credit for passed tests)
      const totalTests = testCases.length;
      const score = Math.round((passedTests / totalTests) * 5);
      
      setCurrentTestResults({
        results,
        passedTests,
        totalTests,
        score,
        maxScore: 5
      });

      setTestResults(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion.id,
        score,
        maxScore: 5,
        passedTests,
        totalTests,
        results
      }]);

      toast.success(`Test completed! ${passedTests}/${totalTests} tests passed. Score: ${score}/5`);
      
    } catch (error: any) {
      console.error('Test execution error:', error);
      toast.error(error.message || 'Failed to run tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const saveTestResults = async () => {
    try {
      const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
      const timeSpent = (30 * 60) - timeRemaining; // Calculate time spent
      
      const questionResults = testResults.map((result, index) => ({
        questionId: questions[index]?.id || `q${index}`,
        questionTitle: questions[index]?.title || `Question ${index + 1}`,
        studentCode: code, // Use current code from the editor
        score: result.score,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        testResults: result.results,
        timeSpent: result.timeSpent || 0,
        hintsUsed: result.hintsUsed || 0,
        attempts: result.attempts || 0
      }));

      console.log('Saving test results:', {
        studentId: 1,
        language: selectedLanguage?.name,
        languageId: selectedLanguage?.id,
        totalScore,
        timeSpent,
        questionResults: questionResults.length
      });

      const response = await fetch('/api/student/code-test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 1, // TODO: Get from auth context
          language: selectedLanguage?.name,
          languageId: selectedLanguage?.id,
          questions,
          questionResults,
          totalScore,
          timeSpent
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Test results saved successfully:', result);
        toast.success('Test results saved successfully!');
      } else {
        console.error('Failed to save test results:', result);
        toast.error('Failed to save test results');
      }
    } catch (error) {
      console.error('Error saving test results:', error);
      toast.error('Failed to save test results');
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHints(false);
      setCurrentTestResults(null);
      setOutput('');
    } else {
      // Only complete test if all questions are answered
      const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
      const maxTotalScore = questions.length * 5;
      
      // Save results to database
      await saveTestResults();
      
      setTestCompleted(true);
      toast.success(`Test completed! Total score: ${totalScore}/${maxTotalScore}`);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHints(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (!testStarted || questions.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Not Loaded</h2>
          <p className="text-gray-600">Please start the test from the dashboard.</p>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
    const maxTotalScore = questions.length * 5;
    const totalPassedTests = testResults.reduce((sum, result) => sum + result.passedTests, 0);
    const totalTests = testResults.reduce((sum, result) => sum + result.totalTests, 0);
    const timeSpent = (30 * 60) - timeRemaining;
    
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Test Completed!
            </h1>
            <Badge variant="outline">{selectedLanguage?.name}</Badge>
            <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
          </div>
          <Button onClick={() => window.close()} className="bg-blue-600 hover:bg-blue-700">
            Close Test
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-16 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                  <div className="text-xs text-gray-500">out of {maxTotalScore}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{totalPassedTests}</div>
                  <div className="text-sm text-gray-600">Tests Passed</div>
                  <div className="text-xs text-gray-500">out of {totalTests}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                  <div className="text-xs text-gray-500">completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                  <div className="text-xs text-gray-500">out of 30:00</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Question Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Question Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Question {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.score >= 4 ? "default" : result.score >= 2 ? "secondary" : "destructive"}>
                              {result.score}/5
                            </Badge>
                            <Badge variant="outline">
                              {result.passedTests}/{result.totalTests} tests
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div><strong>Language:</strong> {selectedLanguage?.name}</div>
                          <div><strong>Status:</strong> {result.passedTests === result.totalTests ? 'All tests passed' : 'Some tests failed'}</div>
                        </div>
                        <div className="mt-2">
                          <Progress value={(result.score / 5) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-800 mb-2">Overall Performance</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((totalScore / maxTotalScore) * 100)}%
                      </div>
                      <div className="text-xs text-blue-600">
                        {totalScore >= maxTotalScore * 0.8 ? 'Excellent!' : 
                         totalScore >= maxTotalScore * 0.6 ? 'Good job!' : 
                         totalScore >= maxTotalScore * 0.4 ? 'Keep practicing!' : 
                         'More practice needed'}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm font-semibold text-green-800 mb-2">Test Case Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((totalPassedTests / totalTests) * 100)}%
                      </div>
                      <div className="text-xs text-green-600">
                        {totalPassedTests} out of {totalTests} test cases passed
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm font-semibold text-purple-800 mb-2">Time Efficiency</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((timeSpent / (30 * 60)) * 100)}%
                      </div>
                      <div className="text-xs text-purple-600">
                        Used {formatTime(timeSpent)} of 30:00 available
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <Button 
                onClick={() => window.close()} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close Test
              </Button>
              <Button 
                onClick={() => {
                  // Open dashboard to view more history
                  window.opener?.focus();
                  window.close();
                }} 
                variant="outline"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            Daily Coding Test
          </h1>
          <Badge variant="outline">{selectedLanguage?.name}</Badge>
          <Badge variant="outline">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
          <div className="w-32">
            <Progress value={(currentQuestionIndex / questions.length) * 100} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
          {/* Left Column - Question & Code Editor */}
          <div className="space-y-6">
            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{currentQuestion.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={currentQuestion.difficulty === 'EASY' ? 'default' : currentQuestion.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.points} points</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{currentQuestion.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Expected Output:</h4>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      {currentQuestion.expectedOutput}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Test Cases:</h4>
                    <div className="space-y-2">
                      {currentQuestion.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                          <div><strong>Input:</strong> {testCase.input}</div>
                          <div><strong>Expected:</strong> 
                            <div className="font-mono bg-white p-2 rounded border mt-1">
                              {testCase.expectedOutput}
                            </div>
                          </div>
                          <div className="text-gray-600">{testCase.description}</div>
                          {testCase.expectedOutput.includes('\n') && (
                            <div className="text-orange-600 text-xs mt-1">
                              ⚠️ Note: This test expects multiple lines of output. Make sure your code outputs all required lines.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {showHints && (
                    <div>
                      <h4 className="font-semibold mb-2">Hints:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {currentQuestion.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowHints(!showHints)}
                    className="w-full"
                  >
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-[#3e3e42] rounded-md overflow-hidden" style={{ height: '300px' }}>
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(selectedLanguage?.name || 'Python 3')}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      renderWhitespace: 'selection',
                      cursorStyle: 'line',
                      cursorBlinking: 'blink',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      contextmenu: true,
                      mouseWheelZoom: true,
                      smoothScrolling: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      quickSuggestions: true,
                      parameterHints: { enabled: true },
                      hover: { enabled: true },
                      folding: true,
                      bracketPairColorization: { enabled: true },
                      guides: {
                        bracketPairs: true,
                        indentation: true
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-[#3e3e42] rounded-md overflow-hidden" style={{ height: '100px' }}>
                  <Editor
                    height="100%"
                    language="plaintext"
                    value={input}
                    onChange={(value) => setInput(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      lineNumbers: 'off',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      renderWhitespace: 'selection',
                      cursorStyle: 'line',
                      cursorBlinking: 'blink',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      contextmenu: true,
                      mouseWheelZoom: true,
                      smoothScrolling: true,
                      placeholder: 'Enter input for your program (if needed)...'
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Output & Controls */}
          <div className="space-y-6">
            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Output</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="font-mono text-sm whitespace-pre-wrap bg-[#1e1e1e] p-3 rounded border border-[#3e3e42] text-[#d4d4d4] min-h-[180px]">
                    {output || 'Output will appear here after running your code...'}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Test Case Results */}
            {currentTestResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Test Results
                    <Badge variant={currentTestResults.passedTests === currentTestResults.totalTests ? "default" : "secondary"}>
                      {currentTestResults.passedTests}/{currentTestResults.totalTests} passed
                    </Badge>
                    <Badge variant="outline">
                      Score: {currentTestResults.score}/{currentTestResults.maxScore}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentTestResults.results.map((result: any, index: number) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'success':
                            return 'bg-green-50 border-green-200';
                          case 'wrong_answer':
                            return 'bg-yellow-50 border-yellow-200';
                          case 'time_limit_exceeded':
                            return 'bg-orange-50 border-orange-200';
                          case 'memory_limit_exceeded':
                            return 'bg-purple-50 border-purple-200';
                          case 'runtime_error':
                          case 'compilation_error':
                          case 'execution_failed':
                          case 'no_result':
                            return 'bg-red-50 border-red-200';
                          default:
                            return 'bg-gray-50 border-gray-200';
                        }
                      };

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'success':
                            return { icon: '✓', color: 'bg-green-500' };
                          case 'wrong_answer':
                            return { icon: '⚠', color: 'bg-yellow-500' };
                          case 'time_limit_exceeded':
                            return { icon: '⏰', color: 'bg-orange-500' };
                          case 'memory_limit_exceeded':
                            return { icon: '💾', color: 'bg-purple-500' };
                          case 'runtime_error':
                          case 'compilation_error':
                          case 'execution_failed':
                            return { icon: '✗', color: 'bg-red-500' };
                          case 'no_result':
                            return { icon: '❌', color: 'bg-red-500' };
                          default:
                            return { icon: '?', color: 'bg-gray-500' };
                        }
                      };

                      // Check if this is a partial match failure
                      const isPartialMatch = result.status === 'wrong_answer' && 
                        result.actual && result.expected && 
                        result.actual.includes(result.expected.split('\n')[0]);

                      const statusInfo = getStatusIcon(result.status);

                      return (
                        <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${statusInfo.color}`}>
                              {statusInfo.icon}
                            </div>
                            <span className="font-semibold">Test Case {result.testCase}</span>
                            <span className="text-sm text-gray-600">({result.description})</span>
                            <Badge variant="outline" className="ml-auto">
                              {result.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>Input:</strong> {result.input}</div>
                            <div><strong>Expected:</strong> {result.expected}</div>
                            <div><strong>Actual:</strong> {result.actual}</div>
                            {isPartialMatch && (
                              <div className="text-orange-600 font-semibold">
                                ⚠️ Incomplete Output: You're missing part of the expected output. 
                                Make sure to output both the number AND the description.
                              </div>
                            )}
                            {result.error && (
                              <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={executeCode} 
                    disabled={isExecuting} 
                    variant="outline"
                    className="flex-1"
                  >
                    {isExecuting ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={runTestCases} 
                    disabled={isRunningTests} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isRunningTests ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Run Tests
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={previousQuestion} 
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    variant="outline"
                    className="flex-1"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next'}
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have {formatTime(timeRemaining)} remaining. Complete all questions before time runs out.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
