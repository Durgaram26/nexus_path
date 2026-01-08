import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get student ID and suggestion ID
    const studentId = payload.userId;
    const { id } = await params;
    const suggestionId = parseInt(id);

    if (isNaN(suggestionId)) {
      return NextResponse.json({ error: 'Invalid suggestion ID' }, { status: 400 });
    }

    // Check if the suggestion belongs to the student
    const suggestion = await prisma.aISuggestion.findFirst({
      where: {
        id: suggestionId,
        studentId
      }
    });

    if (!suggestion) {
      return NextResponse.json({ 
        error: 'Suggestion not found or not owned by student' 
      }, { status: 404 });
    }

    // Delete the suggestion
    await prisma.aISuggestion.delete({
      where: {
        id: suggestionId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'AI suggestion removed successfully'
    });

  } catch (error) {
    console.error('Error removing AI suggestion:', error);
    return NextResponse.json({ 
      error: 'Failed to remove AI suggestion' 
    }, { status: 500 });
  }
}
