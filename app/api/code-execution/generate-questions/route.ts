import { NextRequest, NextResponse } from 'next/server';

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

interface QuestionGenerationRequest {
  language: string;
  languageId: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  count?: number;
  category?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Programming questions generation API called');
    
    const body = await request.json();
    const { language, languageId, difficulty = 'MEDIUM', count = 5, category = 'General Programming' } = body as QuestionGenerationRequest;

    if (!language || !languageId) {
      return NextResponse.json(
        { error: 'Language and language ID are required' },
        { status: 400 }
      );
    }

    console.log('Generating programming questions with parameters:', {
      language,
      languageId,
      difficulty,
      count,
      category
    });

    // Generate programming questions using Gemini AI
    const questions = await generateProgrammingQuestions({
      language,
      languageId,
      difficulty,
      count,
      category
    });

    console.log(`Successfully generated ${questions.length} programming questions`);

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
      language,
      difficulty
    });

  } catch (error: any) {
    console.error('Programming questions generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate questions: ${error.message}` },
      { status: 500 }
    );
  }
}

async function generateProgrammingQuestions(request: QuestionGenerationRequest): Promise<ProgrammingQuestion[]> {
  const prompt = buildProgrammingQuestionPrompt(request);
  
  const apiKey = process.env.llm_api_key;
  const apiUrl = process.env.llm_api_url || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  if (!apiKey) {
    console.error('llm_api_key environment variable is not set');
    throw new Error('AI service configuration error');
  }
  
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    return parseProgrammingQuestionResponse(generatedText, request);
  } catch (error) {
    console.error('Error generating programming questions:', error);
    // Return fallback questions if API fails
    return createFallbackProgrammingQuestions(request);
  }
}

function buildProgrammingQuestionPrompt(request: QuestionGenerationRequest): string {
  return `You are an expert programming instructor creating coding challenges for students learning ${request.language}.

REQUIREMENTS:
- Generate exactly ${request.count} programming questions
- Difficulty level: ${request.difficulty}
- Programming language: ${request.language}
- Category: ${request.category}
- Each question should be a complete coding challenge

QUESTION STRUCTURE:
Each question should include:
1. Clear problem title
2. Detailed problem description
3. Starter code template
4. Expected output format
5. At least 2 test cases with inputs and expected outputs
6. 2-3 helpful hints
7. Point value based on difficulty

DIFFICULTY GUIDELINES:
- EASY: Basic syntax, simple loops, basic operations (1-2 points)
- MEDIUM: Functions, arrays, conditional logic, string manipulation (3-4 points)
- HARD: Complex algorithms, data structures, optimization (5-6 points)

LANGUAGE-SPECIFIC FOCUS FOR ${request.language}:
${getLanguageSpecificTopics(request.language)}

RESPONSE FORMAT (return as valid JSON array):
[
  {
    "id": "prog_q1",
    "title": "Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum. The function should handle both positive and negative numbers.",
    "difficulty": "${request.difficulty}",
    "language": "${request.language}",
    "languageId": ${request.languageId},
    "starterCode": "${getStarterCodeTemplate(request.language)}",
    "expectedOutput": "For input (5, 3), output should be 8",
    "testCases": [
      {
        "input": "5 3",
        "expectedOutput": "8",
        "description": "Basic addition of positive numbers"
      },
      {
        "input": "-2 7",
        "expectedOutput": "5",
        "description": "Addition with negative number"
      }
    ],
    "hints": [
      "Remember to handle both positive and negative integers",
      "Make sure your function returns the result, not just prints it"
    ],
    "category": "${request.category}",
    "points": ${getDifficultyPoints(request.difficulty || 'MEDIUM')}
  }
]

Generate ${request.count} programming questions now. Return ONLY the JSON array, nothing else.`;
}

function getLanguageSpecificTopics(language: string): string {
  const topics: { [key: string]: string } = {
    'Python 3': 'Lists, dictionaries, functions, loops, string methods, file handling, basic algorithms',
    'Java': 'Classes, objects, arrays, methods, inheritance, exception handling, collections',
    'C++': 'Pointers, arrays, functions, classes, STL containers, memory management',
    'C': 'Arrays, pointers, functions, structures, memory allocation, file operations',
    'JavaScript': 'Functions, arrays, objects, DOM manipulation, async programming, ES6 features',
    'PHP': 'Arrays, functions, classes, string manipulation, web development basics',
    'Ruby': 'Arrays, hashes, blocks, methods, classes, string manipulation',
    'Rust': 'Ownership, borrowing, structs, enums, pattern matching, error handling',
    'TypeScript': 'Types, interfaces, classes, generics, modules, async/await'
  };
  return topics[language] || 'Basic programming concepts, functions, loops, conditionals';
}

function getStarterCodeTemplate(language: string): string {
  const templates: { [key: string]: string } = {
    'Python 3': 'def solve():\\n    # Your code here\\n    pass\\n\\n# Test your function\\nresult = solve()\\nprint(result)',
    'Java': 'public class Solution {\\n    public static void main(String[] args) {\\n        // Your code here\\n    }\\n}',
    'C++': '#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Your code here\\n    return 0;\\n}',
    'C': '#include <stdio.h>\\n\\nint main() {\\n    // Your code here\\n    return 0;\\n}',
    'JavaScript': 'function solve() {\\n    // Your code here\\n}\\n\\n// Test your function\\nconsole.log(solve());',
    'PHP': '<?php\\nfunction solve() {\\n    // Your code here\\n}\\n\\n// Test your function\\necho solve();\\n?>',
    'Ruby': 'def solve\\n    # Your code here\\nend\\n\\n# Test your function\\nputs solve',
    'Rust': 'fn main() {\\n    // Your code here\\n}',
    'TypeScript': 'function solve(): unknown {\\n    // Your code here\\n}\\n\\n// Test your function\\nconsole.log(solve());'
  };
  return templates[language] || '// Your code here';
}

function getDifficultyPoints(difficulty: string): number {
  switch (difficulty) {
    case 'EASY': return Math.floor(Math.random() * 2) + 1; // 1-2 points
    case 'MEDIUM': return Math.floor(Math.random() * 2) + 3; // 3-4 points
    case 'HARD': return Math.floor(Math.random() * 2) + 5; // 5-6 points
    default: return 2;
  }
}

function parseProgrammingQuestionResponse(text: string, request: QuestionGenerationRequest): ProgrammingQuestion[] {
  try {
    // Clean the response text to extract valid JSON
    let cleanedText = text.trim();
    
    // Remove any markdown code block indicators
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    
    // Find the first [ and last ] to extract JSON array
    const startIndex = cleanedText.indexOf('[');
    const endIndex = cleanedText.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      throw new Error('No valid JSON array found in response');
    }
    
    const jsonArrayStr = cleanedText.substring(startIndex, endIndex + 1);
    const questions = JSON.parse(jsonArrayStr);
    
    // Validate the structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions structure');
    }

    return questions.slice(0, request.count || 5);
  } catch (error) {
    console.error('Error parsing programming questions response:', error);
    return createFallbackProgrammingQuestions(request);
  }
}

function createFallbackProgrammingQuestions(request: QuestionGenerationRequest): ProgrammingQuestion[] {
  // Generate dynamic fallback questions based on request parameters
  const baseQuestions = [
    {
      id: 'fallback_1',
      title: 'Hello World Program',
      description: 'Write a program that prints "Hello, World!" to the console.',
      difficulty: 'EASY' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Hello, World!',
      testCases: [
        {
          input: '',
          expectedOutput: 'Hello, World!',
          description: 'Basic output test'
        }
      ],
      hints: [
        'Use the appropriate print/output function for your language',
        'Make sure the output matches exactly'
      ],
      category: 'Basic Programming',
      points: 1
    },
    {
      id: 'fallback_2',
      title: 'Sum Two Numbers',
      description: 'Write a program that reads two integers and prints their sum.',
      difficulty: 'EASY' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Sum of the two numbers',
      testCases: [
        {
          input: '5 3',
          expectedOutput: '8',
          description: 'Addition of positive numbers'
        },
        {
          input: '-2 7',
          expectedOutput: '5',
          description: 'Addition with negative number'
        }
      ],
      hints: [
        'Read input using appropriate input functions',
        'Convert strings to integers if needed'
      ],
      category: 'Basic Programming',
      points: 2
    },
    {
      id: 'fallback_3',
      title: 'Even or Odd',
      description: 'Write a program that determines if a given number is even or odd.',
      difficulty: 'EASY' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Even or Odd',
      testCases: [
        {
          input: '4',
          expectedOutput: 'Even',
          description: 'Even number test'
        },
        {
          input: '7',
          expectedOutput: 'Odd',
          description: 'Odd number test'
        }
      ],
      hints: [
        'Use the modulo operator (%) to check remainder',
        'If number % 2 == 0, it\'s even'
      ],
      category: 'Conditional Logic',
      points: 2
    },
    {
      id: 'fallback_4',
      title: 'Find Maximum',
      description: 'Write a program that finds the maximum of three numbers.',
      difficulty: 'MEDIUM' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Maximum number',
      testCases: [
        {
          input: '10 5 8',
          expectedOutput: '10',
          description: 'First number is maximum'
        },
        {
          input: '3 15 7',
          expectedOutput: '15',
          description: 'Second number is maximum'
        }
      ],
      hints: [
        'Compare numbers using conditional statements',
        'You can use built-in max functions if available'
      ],
      category: 'Conditional Logic',
      points: 3
    },
    {
      id: 'fallback_5',
      title: 'Factorial Calculation',
      description: 'Write a program that calculates the factorial of a given number.',
      difficulty: 'MEDIUM' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Factorial of the number',
      testCases: [
        {
          input: '5',
          expectedOutput: '120',
          description: 'Factorial of 5'
        },
        {
          input: '0',
          expectedOutput: '1',
          description: 'Factorial of 0'
        }
      ],
      hints: [
        'Factorial of n is n * (n-1) * (n-2) * ... * 1',
        'Factorial of 0 is 1 by definition'
      ],
      category: 'Loops and Functions',
      points: 4
    },
    {
      id: 'fallback_6',
      title: 'Array Sum',
      description: 'Write a program that calculates the sum of all elements in an array.',
      difficulty: 'EASY' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Sum of array elements',
      testCases: [
        {
          input: '1 2 3 4 5',
          expectedOutput: '15',
          description: 'Sum of positive numbers'
        },
        {
          input: '10 -5 3',
          expectedOutput: '8',
          description: 'Sum with negative numbers'
        }
      ],
      hints: [
        'Use a loop to iterate through the array',
        'Keep a running total of the sum'
      ],
      category: 'Arrays and Loops',
      points: 2
    },
    {
      id: 'fallback_7',
      title: 'Binary Search',
      description: 'Implement binary search to find a target value in a sorted array.',
      difficulty: 'HARD' as const,
      language: request.language,
      languageId: request.languageId,
      starterCode: getStarterCodeTemplate(request.language),
      expectedOutput: 'Index of target or -1 if not found',
      testCases: [
        {
          input: '1 3 5 7 9 11 13 15 17 19\n7',
          expectedOutput: '3',
          description: 'Target found in middle'
        },
        {
          input: '2 4 6 8 10 12 14 16 18 20\n15',
          expectedOutput: '-1',
          description: 'Target not found'
        }
      ],
      hints: [
        'Use two pointers: left and right',
        'Compare target with middle element',
        'Adjust search range based on comparison'
      ],
      category: 'Algorithms',
      points: 6
    }
  ];

  // Filter questions by difficulty and return requested count
  const filteredQuestions = baseQuestions.filter(q => q.difficulty === request.difficulty);
  const questionsToReturn = filteredQuestions.length > 0 ? filteredQuestions : baseQuestions;
  
  return questionsToReturn.slice(0, request.count || 5);
}