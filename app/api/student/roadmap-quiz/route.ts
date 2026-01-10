import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoadmapQuizRequest {
  studentId: number;
  quizType: 'general' | 'coding';
  count: number;
}

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

export async function POST(request: NextRequest) {
  try {
    console.log('Roadmap-based quiz generation API called');
    
    const body = await request.json();
    const { studentId, quizType, count = 10 } = body as RoadmapQuizRequest;

    if (!studentId || !quizType) {
      return NextResponse.json(
        { error: 'Student ID and quiz type are required' },
        { status: 400 }
      );
    }

    console.log('Generating roadmap-based quiz:', { studentId, quizType, count });

    // Get student's roadmap and skills
    const student = await prisma.student.findUnique({
      where: { id: String(studentId) },
      include: {
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Extract roadmap information
    const roadmapInfo = extractRoadmapInfo(student);
    console.log('Roadmap info extracted:', roadmapInfo);

    // Generate quiz questions based on roadmap
    const questions = await generateRoadmapBasedQuestions(roadmapInfo, quizType, count);

    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
      quizType,
      roadmapInfo: {
        department: roadmapInfo.department,
        careerPaths: roadmapInfo.careerPaths,
        skills: roadmapInfo.skills.slice(0, 10) // Show first 10 skills
      }
    });

  } catch (error: any) {
    console.error('Roadmap quiz generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate quiz: ${error.message}` },
      { status: 500 }
    );
  }
}

function extractRoadmapInfo(student: any) {
  const skills = new Set<string>();
  const technologies = new Set<string>();
  const concepts = new Set<string>();
  const careerPaths = student.careerPaths.map((cp: any) => cp.careerPath.name);
  
  // Add basic skills based on department and career paths
  if (student.department.name.toLowerCase().includes('computer')) {
    skills.add('Programming');
    skills.add('Data Structures');
    skills.add('Algorithms');
    skills.add('Software Engineering');
    technologies.add('JavaScript');
    technologies.add('Python');
    technologies.add('Java');
    technologies.add('React');
    technologies.add('Node.js');
  }
  
  if (student.department.name.toLowerCase().includes('information')) {
    skills.add('Database Management');
    skills.add('System Analysis');
    skills.add('Network Security');
    technologies.add('SQL');
    technologies.add('MongoDB');
    technologies.add('AWS');
  }
  
  // Add skills based on career paths
  careerPaths.forEach((path: string) => {
    if (path.toLowerCase().includes('developer')) {
      skills.add('Web Development');
      skills.add('Frontend Development');
      skills.add('Backend Development');
    }
    if (path.toLowerCase().includes('engineer')) {
      skills.add('Software Engineering');
      skills.add('System Design');
      skills.add('DevOps');
    }
    if (path.toLowerCase().includes('data')) {
      skills.add('Data Science');
      skills.add('Machine Learning');
      skills.add('Data Analysis');
    }
  });

  return {
    department: student.department.name,
    careerPaths,
    skills: Array.from(skills),
    technologies: Array.from(technologies),
    concepts: Array.from(concepts),
    academicYear: student.year
  };
}

function extractSkillsFromText(text: string): string[] {
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'MongoDB',
    'HTML', 'CSS', 'Bootstrap', 'Git', 'Docker', 'AWS', 'Machine Learning',
    'Data Structures', 'Algorithms', 'Database', 'API', 'REST', 'GraphQL',
    'Frontend', 'Backend', 'Full Stack', 'Web Development', 'Mobile Development',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'AI', 'Data Science'
  ];
  
  const foundSkills: string[] = [];
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

async function generateRoadmapBasedQuestions(roadmapInfo: any, quizType: string, count: number): Promise<QuizQuestion[]> {
  const prompt = buildRoadmapQuizPrompt(roadmapInfo, quizType, count);
  
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
          temperature: 0.7,
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

    return parseQuizResponse(generatedText, count);
  } catch (error) {
    console.error('Error generating roadmap-based quiz:', error);
    return createFallbackQuizQuestions(roadmapInfo, quizType, count);
  }
}

function buildRoadmapQuizPrompt(roadmapInfo: any, quizType: string, count: number): string {
  const isGeneral = quizType === 'general';
  const isCoding = quizType === 'coding';
  
  return `You are an expert educational content creator generating ${quizType} quiz questions for a student based on their academic roadmap.

STUDENT PROFILE:
- Department: ${roadmapInfo.department}
- Academic Year: ${roadmapInfo.academicYear}
- Career Paths: ${roadmapInfo.careerPaths.join(', ')}
- Skills in Roadmap: ${roadmapInfo.skills.join(', ')}

QUIZ REQUIREMENTS:
- Generate exactly ${count} ${quizType} questions
- Questions should be based on the student's roadmap and career path
- Mix of difficulty levels (EASY, MEDIUM, HARD)
- Each question should have 4 multiple choice options
- Include detailed explanations for each answer

${isGeneral ? `
GENERAL TECHNICAL SKILLS FOCUS:
- Cover fundamental concepts from their department (${roadmapInfo.department})
- Include topics relevant to their career paths: ${roadmapInfo.careerPaths.join(', ')}
- Focus on theoretical knowledge, concepts, and best practices
- Include topics like: Software Engineering principles, System Design, Database concepts, Networking, Security basics, etc.
` : ''}

${isCoding ? `
CODING MCQ FOCUS:
- Focus on programming concepts and syntax
- Include questions about: ${roadmapInfo.skills.slice(0, 10).join(', ')}
- Cover topics like: Data Structures, Algorithms, Programming paradigms, Code optimization, Debugging, etc.
- Include code snippets and ask about output, errors, or best practices
` : ''}

RESPONSE FORMAT (return as valid JSON array):
[
  {
    "id": "q1",
    "question": "What is the primary purpose of version control systems like Git?",
    "options": [
      "To compile code",
      "To track changes in code over time",
      "To execute programs",
      "To debug applications"
    ],
    "correctAnswer": 1,
    "explanation": "Version control systems like Git are designed to track changes in code over time, allowing developers to manage different versions of their code, collaborate with others, and maintain a history of changes.",
    "category": "Software Engineering",
    "difficulty": "EASY",
    "points": 1
  }
]

Generate ${count} ${quizType} questions now. Return ONLY the JSON array, nothing else.`;
}

function parseQuizResponse(text: string, count: number): QuizQuestion[] {
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

    return questions.slice(0, count);
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    return [];
  }
}

function createFallbackQuizQuestions(roadmapInfo: any, quizType: string, count: number): QuizQuestion[] {
  const isGeneral = quizType === 'general';
  
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: 'fallback_1',
      question: `What is the primary goal of ${roadmapInfo.department} education?`,
      options: [
        'To learn only theoretical concepts',
        'To develop practical problem-solving skills',
        'To memorize programming syntax',
        'To avoid real-world applications'
      ],
      correctAnswer: 1,
      explanation: `${roadmapInfo.department} education focuses on developing practical problem-solving skills that can be applied in real-world scenarios.`,
      category: 'General Knowledge',
      difficulty: 'EASY' as const,
      points: 1
    },
    {
      id: 'fallback_2',
      question: `Which of the following is most important in ${roadmapInfo.skills[0] || 'programming'}?`,
      options: [
        'Writing complex code',
        'Writing readable and maintainable code',
        'Using the latest frameworks',
        'Avoiding documentation'
      ],
      correctAnswer: 1,
      explanation: 'Readable and maintainable code is crucial for long-term project success and team collaboration.',
      category: 'Best Practices',
      difficulty: 'MEDIUM' as const,
      points: 2
    }
  ];

  return fallbackQuestions.slice(0, count);
}
