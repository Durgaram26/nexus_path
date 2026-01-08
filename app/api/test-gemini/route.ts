import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/lib/gemini-ai';

export async function GET(request: NextRequest) {
  try {
    console.log('Gemini AI test called');
    
    
    
    // Test with simple parameters
    const testRequest = {
      careerPath: 'Software Development',
      currentWeek: 1,
      studentYear: 2,
      department: 'Computer Science'
    };
    
    console.log('Testing Gemini AI with parameters:', testRequest);
    
    try {
      const geminiService = new GeminiAIService();
      const questions = await geminiService.generateQuestionsWithGemini(testRequest);
      
      return NextResponse.json({
        message: 'Gemini AI test successful',
        questionsGenerated: questions ? questions.length : 0,
        sampleQuestion: questions && questions.length > 0 ? {
          id: questions[0].id,
          question: questions[0].question,
          options: questions[0].options,
          difficulty: questions[0].difficulty
        } : null
      });
    } catch (geminiError) {
      console.error('Gemini AI error:', geminiError);
      return NextResponse.json({
        message: 'Gemini AI test failed',
        error: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        details: geminiError
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Gemini test API error:', error);
    return NextResponse.json({ 
      message: 'Gemini test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

