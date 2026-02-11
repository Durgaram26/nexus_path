import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ error: 'Invalid token or role' }, { status: 401 });
    }

    // Get student ID from token
    const studentId = payload.userId;

    // Fetch saved AI suggestions for the student
    const suggestions = await prisma.aISuggestion.findMany({
      where: {
        studentId
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    // Parse skills JSON strings back to arrays
    const parsedSuggestions = suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      duration: suggestion.duration,
      difficulty: suggestion.difficulty,
      skills: JSON.parse(suggestion.skills),
      savedAt: suggestion.savedAt
    }));

    return NextResponse.json({
      success: true,
      suggestions: parsedSuggestions
    });

  } catch (error) {
    console.error('Error fetching saved suggestions:', error);
    return NextResponse.json({
      error: 'Failed to fetch saved suggestions'
    }, { status: 500 });
  }
}
