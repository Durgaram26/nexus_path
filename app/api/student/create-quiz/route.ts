import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GeminiAIService } from '@/lib/gemini-ai';
import jwt from 'jsonwebtoken';

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('access_token')?.value;
  
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch {
    return null;
  }
}

// POST - Create a daily quiz using Gemini AI
export async function POST(request: NextRequest) {
  try {
    console.log('Create quiz API called');
    
    const payload = getAuthPayload(request);
    console.log('Auth payload:', payload);
    
    if (!payload) {
      console.log('No payload found - checking headers and cookies');
      console.log('Authorization header:', request.headers.get('authorization'));
      console.log('Cookies:', request.headers.get('cookie'));
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!['student'].includes((payload as any).role)) {
      console.log('Authentication failed - invalid role:', (payload as any).role);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log('Student ID:', (payload as any).userId, 'Today:', todayString);
    
    // Get the user first to get their email
    console.log('Looking up user with ID:', (payload as any).userId);
    const user = await prisma.user.findUnique({
      where: { id: parseInt((payload as any).userId) }
    });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for ID:', (payload as any).userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get student's learning plan and career paths
    console.log('Looking up student with email:', user.email);
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        department: {
          select: {
            name: true
          }
        },
        careerPaths: {
          include: {
            careerPath: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      console.log('Student not found for email:', user.email);
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    
    // Check if daily quiz already exists for today
    const existingQuiz = await prisma.adaptiveQuiz.findFirst({
      where: {
        studentId: student.id,
        quizDate: {
          gte: new Date(todayString + 'T00:00:00.000Z'),
          lt: new Date(todayString + 'T23:59:59.999Z')
        }
      }
    });

    if (existingQuiz) {
      console.log('Quiz already exists for today');
      return NextResponse.json({
        success: false,
        message: 'Quiz already exists for today',
        quiz: existingQuiz
      });
    }

    // Generate quiz using Gemini AI
    console.log('Creating new quiz using Gemini AI for student:', student.name);
    
    try {
      // Initialize Gemini AI service
      const geminiService = new GeminiAIService();
      
      // Get student's career path (use first one if multiple)
      const careerPath = student.careerPaths.length > 0 
        ? student.careerPaths[0].careerPath.name 
        : 'Software Development';
      
      // Generate questions using Gemini AI
      const generatedQuestions = await geminiService.generateQuestionsWithGemini({
        studentYear: student.year,
        department: student.department.name,
        careerPath: careerPath,
        currentWeek: 1, // Default to week 1 for daily quizzes
        count: 20
      });

      console.log(`Generated ${generatedQuestions.length} questions using Gemini AI`);

      // Create quiz in database
      const newQuiz = await prisma.adaptiveQuiz.create({
        data: {
          studentId: student.id,
          quizDate: new Date(todayString + 'T00:00:00.000Z'),
          questions: JSON.stringify(generatedQuestions),
          isCompleted: false,
          totalAttempts: 0,
          bestScore: 0,
          lastAttemptAt: null
        }
      });

      console.log('New quiz created with ID:', newQuiz.id);
      
      return NextResponse.json({
        success: true,
        quiz: newQuiz,
        message: 'Quiz created successfully using Gemini AI'
      });

    } catch (geminiError) {
      console.error('Gemini AI error, using fallback questions:', geminiError);
      
      // Fallback to static questions if Gemini fails
      const fallbackQuestions = [
        {
          id: "q1",
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correct: "O(log n)",
          explanation: "Binary search eliminates half the search space in each iteration.",
          category: "Algorithms",
          difficulty: "MEDIUM"
        },
        {
          id: "q2", 
          question: "Which data structure follows LIFO principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: "Stack",
          explanation: "Stack follows Last In First Out (LIFO) principle.",
          category: "Data Structures",
          difficulty: "EASY"
        },
        {
          id: "q3",
          question: "What is the purpose of a constructor in OOP?",
          options: ["To destroy objects", "To initialize objects", "To hide data", "To inherit properties"],
          correct: "To initialize objects",
          explanation: "Constructor is used to initialize objects when they are created.",
          category: "Object-Oriented Programming",
          difficulty: "EASY"
        },
        {
          id: "q4",
          question: "Which sorting algorithm has O(n log n) average time complexity?",
          options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
          correct: "Quick Sort",
          explanation: "Quick Sort has O(n log n) average time complexity.",
          category: "Algorithms",
          difficulty: "MEDIUM"
        },
        {
          id: "q5",
          question: "What does API stand for?",
          options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Applied Programming Interface"],
          correct: "Application Programming Interface",
          explanation: "API stands for Application Programming Interface.",
          category: "Software Development",
          difficulty: "EASY"
        }
      ];

      const newQuiz = await prisma.adaptiveQuiz.create({
        data: {
          studentId: student.id,
          quizDate: new Date(todayString + 'T00:00:00.000Z'),
          questions: JSON.stringify(fallbackQuestions),
          isCompleted: false,
          totalAttempts: 0,
          bestScore: 0,
          lastAttemptAt: null
        }
      });

      console.log('Fallback quiz created with ID:', newQuiz.id);
      
      return NextResponse.json({
        success: true,
        quiz: newQuiz,
        message: 'Quiz created with fallback questions (Gemini AI unavailable)'
      });
    }

  } catch (error: unknown) {
    console.error('Create quiz error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
