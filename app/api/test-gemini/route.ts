import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '../../../lib/gemini-ai';

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
      const questions = await .generateQuestionsWithGemini(testRequest);
      
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
      console.error('Gemini AI :', geminiError);
      return NextResponse.json({
        message: 'Gemini AI test failed',
        : geminiError error instanceof Error ? geminiErrorerror.message : 'Unknown ',
        details: geminiError
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Gemini test API :');
    return NextResponse.json({ 
      message: 'Gemini test failed',
      : error instanceof Error ? error.message : 'Unknown '
    }, { status: 500 });
  }
}

