import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Daily quiz generation API called');
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get student information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        roadmapAssignments: {
          include: {
            roadmap: {
              include: {
                courseAssignments: {
                  include: {
                    course: {
                      include: {
                        assignments: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        department: true,
        careerPaths: {
          include: {
            careerPath: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    console.log('Generating daily quiz for student:', student.name);

    // Generate 10 general technical skill questions
    const generalQuestions = await generateRoadmapBasedQuestions(student, 'general', 10);
    
    // Generate 10 coding MCQ questions
    const codingQuestions = await generateRoadmapBasedQuestions(student, 'coding', 10);

    // Combine questions
    const allQuestions = [...generalQuestions, ...codingQuestions];

    // Create adaptive quiz record
    const adaptiveQuiz = await prisma.adaptiveQuiz.create({
      data: {
        studentId: student.id,
        quizDate: new Date(),
        questions: JSON.stringify(allQuestions)
      }
    });

    console.log('Daily quiz generated successfully:', adaptiveQuiz.id);

    return NextResponse.json({
      success: true,
      quizId: adaptiveQuiz.id,
      questions: allQuestions,
      totalQuestions: allQuestions.length,
      generalQuestions: generalQuestions.length,
      codingQuestions: codingQuestions.length,
      studentInfo: {
        name: student.name,
        department: student.department.name,
        careerPaths: student.careerPaths.map(cp => cp.careerPath.name)
      }
    });

  } catch (error: any) {
    console.error('Daily quiz generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate daily quiz: ${error.message}` },
      { status: 500 }
    );
  }
}

async function generateRoadmapBasedQuestions(student: any, quizType: string, count: number) {
  const roadmapInfo = extractRoadmapInfo(student);
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

function extractRoadmapInfo(student: any) {
  const skills = new Set<string>();
  const technologies = new Set<string>();
  const concepts = new Set<string>();
  const careerPaths = student.careerPaths.map((cp: any) => cp.careerPath.name);
  
  // Extract skills from roadmap courses and assignments
  student.roadmapAssignments.forEach((assignment: any) => {
    assignment.roadmap.courseAssignments.forEach((courseAssignment: any) => {
      const course = courseAssignment.course;
      
      // Extract skills from course name and assignments
      if (course.name) {
        const courseSkills = extractSkillsFromText(course.name);
        courseSkills.forEach(skill => skills.add(skill));
      }
      
      // Extract from assignments
      course.assignments.forEach((assignment: any) => {
        if (assignment.title) {
          const assignmentSkills = extractSkillsFromText(assignment.title);
          assignmentSkills.forEach(skill => skills.add(skill));
        }
      });
    });
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
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'AI', 'Data Science',
    'Software Engineering', 'System Design', 'Networking', 'Security'
  ];
  
  const foundSkills: string[] = [];
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
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
- Make questions practical and relevant to their field
` : ''}

${isCoding ? `
CODING MCQ FOCUS:
- Focus on programming concepts and syntax
- Include questions about: ${roadmapInfo.skills.slice(0, 10).join(', ')}
- Cover topics like: Data Structures, Algorithms, Programming paradigms, Code optimization, Debugging, etc.
- Include code snippets and ask about output, errors, or best practices
- Make questions practical and applicable to real-world scenarios
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

function parseQuizResponse(text: string, count: number) {
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

function createFallbackQuizQuestions(roadmapInfo: any, quizType: string, count: number) {
  const isGeneral = quizType === 'general';
  
  const fallbackQuestions = [
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
      difficulty: 'EASY',
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
      difficulty: 'MEDIUM',
      points: 2
    }
  ];

  return fallbackQuestions.slice(0, count);
}
