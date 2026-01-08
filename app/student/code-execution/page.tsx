'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { toast } from 'sonner';
import { 
  Play, 
  Square, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  FileText,
  Zap,
  Monitor,
  Type,
  Palette
} from 'lucide-react';

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
  memory?: number;
}

interface Language {
  id: number;
  name: string;
  template: string;
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

interface TestResult {
  testCase: TestCase;
  index: number;
  actualOutput: string;
  expectedOutput: string;
  passed: boolean;
  error?: string;
  time?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { id: 71, name: 'Python 3', template: '# Python 3 Code\nprint("Hello, World!")' },
  { id: 62, name: 'Java', template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { id: 54, name: 'C++', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { id: 50, name: 'C', template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { id: 63, name: 'JavaScript', template: '// JavaScript Code\nconsole.log("Hello, World!");' },
  { id: 68, name: 'PHP', template: '<?php\necho "Hello, World!\\n";\n?>' },
  { id: 72, name: 'Ruby', template: '# Ruby Code\nputs "Hello, World!"' },
  { id: 74, name: 'TypeScript', template: '// TypeScript Code\nconsole.log("Hello, World!");' },
];

export default function EnhancedCodeExecutionPage() {
  // Loading states
  const [loading, setLoading] = useState(true);
  
  // Code execution states
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // VS Code-like features
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('light');
  const [wordWrap, setWordWrap] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [tabSize, setTabSize] = useState(2);
  
  // Question generation states
  const [questions, setQuestions] = useState<ProgrammingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ProgrammingQuestion | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (selectedLanguage) {
      setCode(selectedLanguage.template);
    }
  }, [selectedLanguage]);

  // Load execution history from database
  useEffect(() => {
    const loadExecutionHistory = async () => {
      try {
        console.log('📚 Loading execution history...');
        
        // Get current student ID from auth
        const authResponse = await api.get('/auth/me');
        const studentId = authResponse.data.id;
        
        console.log('👤 Student ID for history loading:', studentId);
        
        const response = await fetch(`/api/student/code-execution-history?studentId=${studentId}&limit=20`);
        console.log('📡 History API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 History API response data:', data);
          
          if (data.success && data.history) {
            console.log(`📝 Found ${data.history.length} history entries`);
            // Convert database format to display format
            const formattedHistory = data.history.map((entry: any) => ({
              timestamp: new Date(entry.executedAt).toLocaleTimeString(),
              language: entry.language,
              code: entry.code,
              input: entry.input,
              output: entry.output,
              status: entry.status,
              time: entry.executionTime,
              memory: entry.memoryUsed
            }));
            setExecutionHistory(formattedHistory);
            console.log('✅ Execution history loaded successfully');
          } else {
            console.log('❌ No history found or API returned error');
          }
        } else {
          console.error('❌ Failed to load execution history, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Error loading execution history:', error);
      }
    };

    loadExecutionHistory();
  }, []);

  const executeCode = async () => {
    console.log('🚀 executeCode function called');
    
    if (!code.trim()) {
      toast.error('Please enter some code to execute');
      return;
    }

    console.log('✅ Code validation passed, starting execution...');
    setIsExecuting(true);
    setOutput('');
    setExecutionResult(null);

    try {
      console.log('📡 Making API call to /code-execution...');
      const submissionResponse = await api.post('/code-execution', {
        code: code,
        languageId: selectedLanguage.id,
        input: input || ''
      });

      console.log('📡 API response received:', submissionResponse.data);
      const { token } = submissionResponse.data;

      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('🎫 Token received:', token);

      // Poll for results
      let attempts = 0;
      const maxAttempts = 30;
      
      console.log('⏳ Starting polling for results...');
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`🔄 Polling attempt ${attempts + 1}/${maxAttempts}`);
        const resultResponse = await api.get(`/code-execution?token=${token}`);
        const result = resultResponse.data;
        
        console.log('📊 Polling result:', result);
        
        if (result.status.id > 2) {
          console.log('✅ Code execution completed, status:', result.status.description);
          setExecutionResult(result);
          
          let outputText = '';
          if (result.stdout) {
            outputText += result.stdout;
          }
          if (result.stderr) {
            outputText += '\nError:\n' + result.stderr;
          }
          if (result.compile_output) {
            outputText += '\nCompile Output:\n' + result.compile_output;
          }
          
          setOutput(outputText || 'No output');
          
          const historyEntry = {
            timestamp: new Date().toLocaleTimeString(),
            language: selectedLanguage.name,
            code: code,
            input: input,
            output: outputText,
            status: result.status.description
          };
          
          console.log('📝 Creating history entry:', historyEntry);
          setExecutionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
          
          // Save to database
          console.log('💾 Calling saveExecutionHistory...');
          saveExecutionHistory(historyEntry);
          
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Code execution timed out');
      }
      
      toast.success('Code executed successfully!');
    } catch (error: unknown) {
      console.error('Code execution error:', error);
      const errorMessage = (error as any)?.response?.data?.error || (error as Error).message || 'Failed to execute code';
      toast.error(errorMessage);
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const saveExecutionHistory = async (historyEntry: any) => {
    try {
      console.log('💾 Attempting to save execution history...');
      
      // Get current student ID from auth
      const authResponse = await api.get('/auth/me');
      const studentId = authResponse.data.id;
      
      console.log('👤 Student ID from auth:', studentId);
      console.log('📝 History entry to save:', historyEntry);
      
      const response = await fetch('/api/student/code-execution-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          language: historyEntry.language,
          languageId: selectedLanguage.id,
          code: historyEntry.code,
          input: historyEntry.input,
          output: historyEntry.output,
          status: historyEntry.status,
          executionTime: null, // TODO: Add execution time tracking
          memoryUsed: null, // TODO: Add memory tracking
          errorMessage: historyEntry.status.includes('Error') ? historyEntry.output : null
        })
      });
      
      const result = await response.json();
      console.log('✅ Save execution history response:', result);
      
      if (!response.ok) {
        console.error('❌ Failed to save execution history:', result);
      }
    } catch (error) {
      console.error('❌ Error saving execution history:', error);
    }
  };

  const runTestCases = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to test');
      return;
    }

    if (!currentQuestion || !currentQuestion.testCases.length) {
      toast.error('No test cases available for this question');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);

    try {
      const testPromises = currentQuestion.testCases.map(async (testCase, index) => {
        try {
          const submissionResponse = await api.post('/code-execution', {
            code: code,
            languageId: selectedLanguage.id,
            input: testCase.input
          });

          const { token } = submissionResponse.data;
          
          let attempts = 0;
          const maxAttempts = 30;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const resultResponse = await api.get(`/code-execution?token=${token}`);
            const result = resultResponse.data;
            
            if (result.status.id > 2) {
              const actualOutput = result.stdout?.trim() || '';
              const expectedOutput = testCase.expectedOutput.trim();
              const passed = actualOutput === expectedOutput;
              
              return {
                testCase,
                index,
                actualOutput,
                expectedOutput,
                passed,
                error: result.stderr || result.compile_output,
                time: result.time
              };
            }
            
            attempts++;
          }
          
          return {
            testCase,
            index,
            actualOutput: '',
            expectedOutput: testCase.expectedOutput,
            passed: false,
            error: 'Test case timed out',
            time: 'N/A'
          };
        } catch (error) {
          return {
            testCase,
            index,
            actualOutput: '',
            expectedOutput: testCase.expectedOutput,
            passed: false,
            error: (error as Error).message,
            time: 'N/A'
          };
        }
      });

      const results = await Promise.all(testPromises);
      setTestResults(results);
      
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      if (passedCount === totalCount) {
        toast.success(`All ${totalCount} test cases passed! 🎉`);
      } else {
        toast.warning(`${passedCount}/${totalCount} test cases passed`);
      }
      
    } catch (error: unknown) {
      console.error('Test execution error:', error);
      toast.error('Failed to run test cases');
    } finally {
      setIsRunningTests(false);
    }
  };

  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await api.post('/code-execution/generate-questions', {
        language: selectedLanguage.name,
        languageId: selectedLanguage.id,
        difficulty: selectedDifficulty,
        count: 5,
        category: 'Programming Practice'
      }, {
        timeout: 30
      });

      const { questions: generatedQuestions } = response.data;
      setQuestions(generatedQuestions);
      setCurrentQuestion(generatedQuestions[0] || null);
      setShowQuestions(true);
      
      if (generatedQuestions.length > 0) {
        setCode(generatedQuestions[0].starterCode);
        toast.success(`Generated ${generatedQuestions.length} programming questions!`);
      }
    } catch (error: unknown) {
      console.error('Question generation error:', error);
      
      let errorMessage = 'Failed to generate questions';
      if ((error as any)?.code === 'ECONNABORTED' || (error as Error).message.includes('timeout')) {
        errorMessage = 'Question generation timed out';
        toast.error(errorMessage, {
          description: 'The AI is taking longer than expected. Please try again.'
        });
      } else {
        errorMessage = (error as any)?.response?.data?.error || (error as Error).message || 'Failed to generate questions';
        toast.error(errorMessage);
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const selectQuestion = (question: ProgrammingQuestion) => {
    setCurrentQuestion(question);
    setCode(question.starterCode);
    setTestResults([]);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading code execution environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - VS Code Style */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Editor
          </h2>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Language</Label>
            <Select value={selectedLanguage.name} onValueChange={(value) => {
              const lang = SUPPORTED_LANGUAGES.find(l => l.name === value);
              if (lang) setSelectedLanguage(lang);
            }}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
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
          </div>

          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Font Size</Label>
            <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-gray-300 mb-2 block">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="monokai">Monokai</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Button
              onClick={generateQuestions}
              disabled={isGeneratingQuestions}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingQuestions ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={executeCode}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700"
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

            {currentQuestion && currentQuestion.testCases.length > 0 && (
              <Button
                onClick={runTestCases}
                disabled={isRunningTests}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isRunningTests ? (
                  <>
                    <TestTube className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Run Tests
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedLanguage.name}
            </Badge>
            {executionResult && (
              <Badge variant={executionResult.status.id === 3 ? "default" : "destructive"} className="text-xs">
                {executionResult.status.description}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Code Editor */}
          <div className="w-2/3 flex flex-col border-r border-gray-200">
            <Tabs defaultValue="code" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="input">Input</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="flex-1 p-4">
                <div className="h-full">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your code here..."
                    className="h-full resize-none font-mono text-sm border-0 focus:ring-0"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.5',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="input" className="flex-1 p-4">
                <div className="h-full">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for your program (if needed)..."
                    className="h-full resize-none font-mono text-sm"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="font-mono text-sm whitespace-pre-wrap">
                    {output || 'Output will appear here after running your code...'}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Questions & Test Results */}
          <div className="w-1/3 flex flex-col">
            <Tabs defaultValue="questions" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="tests">Test Results</TabsTrigger>
                <TabsTrigger value="history">History & Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="questions" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  {currentQuestion ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{currentQuestion.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                          <Badge variant="secondary">{currentQuestion.points} pts</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">{currentQuestion.description}</p>
                        <div className="text-xs text-gray-600 mb-2">
                          <strong>Expected Output:</strong> {currentQuestion.expectedOutput}
                        </div>
                        {currentQuestion.testCases.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <strong>Test Cases:</strong>
                            <ul className="mt-1 space-y-1">
                              {currentQuestion.testCases.slice(0, 2).map((testCase, index) => (
                                <li key={index} className="ml-2">
                                  • Input: "{testCase.input}" → Output: "{testCase.expectedOutput}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No question selected</p>
                      <p className="text-sm text-gray-500">Generate questions to get started</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="tests" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  {testResults.length > 0 ? (
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <Card key={index} className={result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium text-sm">
                                Test Case {index + 1}
                              </span>
                              {result.time && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {result.time}ms
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs space-y-1">
                              <div><strong>Input:</strong> {result.testCase.input}</div>
                              <div><strong>Expected:</strong> {result.expectedOutput}</div>
                              <div><strong>Actual:</strong> {result.actualOutput}</div>
                              {result.error && (
                                <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No test results yet</p>
                      <p className="text-sm text-gray-500">Run tests to see results</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {/* Progress Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Progress Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{executionHistory.length}</div>
                            <div className="text-sm text-gray-600">Code Executions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{testResults.filter(r => r.passed).length}</div>
                            <div className="text-sm text-gray-600">Tests Passed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Execution History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Execution History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {executionHistory.length > 0 ? (
                          <div className="space-y-3">
                            {executionHistory.slice(0, 10).map((entry, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{entry.language}</Badge>
                                  <span className="text-xs text-gray-500">{entry.timestamp}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <div><strong>Status:</strong> {entry.status}</div>
                                  {entry.time && <div><strong>Time:</strong> {entry.time}ms</div>}
                                  {entry.memory && <div><strong>Memory:</strong> {entry.memory}KB</div>}
                                </div>
                                <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
                                  {entry.code.substring(0, 100)}{entry.code.length > 100 ? '...' : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No execution history yet. Run some code to see history here.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
