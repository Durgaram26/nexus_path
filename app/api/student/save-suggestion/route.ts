import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Save suggestion API called');
    
    // Temporarily disable authentication for testing
    // TODO: Re-enable authentication once basic functionality works
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    // }

    // const payload = verifyToken(token);
    // if (!payload || payload.role !== 'student') {
    //   return NextResponse.json({ error: 'Invalid token or role' }, { status: 401 });
    // }

    const body = await request.json();
    console.log('Request body:', body);
    const { title, description, duration, difficulty, skills } = body;

    // Validate required fields
    if (!title || !description || !duration || !difficulty || !skills) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, duration, difficulty, skills' 
      }, { status: 400 });
    }

    console.log('All required fields present');

    // Get student ID from token (using default for testing)
    const studentId = 1; // Default student ID for testing
    console.log('Using studentId:', studentId);

    // Save the AI suggestion
    console.log('Attempting to save suggestion to database...');
    const suggestion = await prisma.aISuggestion.create({
      data: {
        title,
        description,
        duration,
        difficulty,
        skills: JSON.stringify(skills), // Store skills as JSON string
        studentId
      }
    });

    console.log('Suggestion saved successfully:', suggestion);

    return NextResponse.json({
      success: true,
      id: suggestion.id,
      message: 'AI suggestion saved successfully'
    });

  } catch (error) {
    console.error('Error saving AI suggestion:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Failed to save AI suggestion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
