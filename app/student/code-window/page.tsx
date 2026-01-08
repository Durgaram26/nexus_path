'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { toast } from 'sonner';
import { 
  Play, 
  Square, 
  Download, 
  Code, 
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Editor from '@monaco-editor/react';

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

// Monaco Editor language mapping
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

export default function CodeWindowPage() {
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
  
  // Question states
  const [questions, setQuestions] = useState<ProgrammingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ProgrammingQuestion | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    // Initialize the code execution environment
    const initializeEnvironment = async () => {
      try {
        // Set initial code template
        if (selectedLanguage) {
          setCode(selectedLanguage.template);
        }
        
        // Simulate environment initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize code execution environment:', error);
        setLoading(false);
      }
    };

    initializeEnvironment();
  }, [selectedLanguage]);

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to execute');
      return;
    }

    setIsExecuting(true);
    setOutput('');
    setExecutionResult(null);

    try {
      const submissionResponse = await api.post('/code-execution', {
        code: code,
        languageId: selectedLanguage.id,
        input: input || ''
      });

      const { token } = submissionResponse.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Poll for results
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const resultResponse = await api.get(`/code-execution?token=${token}`);
        const result = resultResponse.data;
        
        if (result.status.id > 2) {
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
            id: Date.now(),
            language: selectedLanguage.name,
            code: code,
            input: input,
            output: outputText,
            status: result.status.description,
            time: result.time,
            memory: result.memory,
            timestamp: new Date().toLocaleString()
          };
          
          setExecutionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
          
          toast.success('Code executed successfully!');
          break;
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Code execution timed out');
      }
      
    } catch (error: unknown) {
      console.error('Code execution error:', error);
      const errorMessage = (error as any)?.response?.data?.error || (error as Error).message || 'Failed to execute code';
      toast.error(errorMessage);
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(selectedLanguage.name)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code saved successfully!');
  };

  const getFileExtension = (languageName: string): string => {
    const extensions: { [key: string]: string } = {
      'Python 3': 'py',
      'Java': 'java',
      'C++': 'cpp',
      'C': 'c',
      'JavaScript': 'js',
      'PHP': 'php',
      'Ruby': 'rb',
      'TypeScript': 'ts'
    };
    return extensions[languageName] || 'txt';
  };

  const handleLanguageChange = (value: string) => {
    const language = SUPPORTED_LANGUAGES.find(l => l.name === value);
    if (language) {
      setSelectedLanguage(language);
    }
  };

  const closeWindow = () => {
    window.close();
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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Execution
          </h1>
          <Badge variant="outline">{selectedLanguage.name}</Badge>
        </div>
        <Button onClick={closeWindow} variant="outline" size="sm">
          Close
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column - Code Editor */}
          <div className="space-y-6">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Language & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select value={selectedLanguage.name} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
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
                
                <div className="flex gap-2">
                  <Button onClick={saveCode} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Save Code
                  </Button>
                  <Button onClick={executeCode} disabled={isExecuting} className="bg-green-600 hover:bg-green-700">
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
                    language={getMonacoLanguage(selectedLanguage.name)}
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

          {/* Right Column - Output & Results */}
          <div className="space-y-6">
            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Output
                  {executionResult && (
                    <Badge variant={executionResult.status.id === 3 ? "default" : "destructive"}>
                      {executionResult.status.description}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="font-mono text-sm whitespace-pre-wrap bg-[#1e1e1e] p-3 rounded border border-[#3e3e42] text-[#d4d4d4] min-h-[180px]">
                    {output || 'Output will appear here after running your code...'}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Execution History */}
            {executionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                        {executionHistory.map((entry) => (
                          <div key={entry.id} className="p-3 bg-[#1e1e1e] rounded-lg border border-[#3e3e42]">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="bg-[#0e639c] text-white border-[#0e639c]">{entry.language}</Badge>
                              <span className="text-xs text-[#6a6a6a]">{entry.timestamp}</span>
                            </div>
                            <div className="text-xs text-[#cccccc]">
                              <div><strong>Status:</strong> {entry.status}</div>
                              {entry.time && <div><strong>Time:</strong> {entry.time}ms</div>}
                              {entry.memory && <div><strong>Memory:</strong> {entry.memory}KB</div>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
