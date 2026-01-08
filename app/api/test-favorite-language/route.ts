import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to check if the basic structure works
export async function PUT(request: NextRequest) {
  console.log('Test PUT endpoint called');
  
  try {
    const body = await request.json();
    console.log('Request body received:', body);
    
    return NextResponse.json({
      message: 'Test endpoint working',
      receivedData: body
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { message: 'Test endpoint failed', details: String(error) },
      { status: 500 }
    );
  }
}












