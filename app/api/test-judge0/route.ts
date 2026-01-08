import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_API_KEY = 'd9d1152807mshcf611fa7a591e0dp19c29djsna1fd831ce5e1';
const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Judge0 API connection...');
    
    // Test with a simple Python hello world
    const testCode = 'print("Hello, World!")';
    const requestBody = {
      language_id: 71, // Python 3
      source_code: Buffer.from(testCode).toString('base64'),
      stdin: Buffer.from('').toString('base64'),
      base64_encoded: true
    };

    console.log('Test request body:', requestBody);

    const response = await fetch(`${JUDGE0_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Judge0 test status:', response.status);
    console.log('Judge0 test headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Judge0 test error:', errorText);
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    const data = await response.json();
    console.log('Judge0 test data:', data);

    return NextResponse.json({
      success: true,
      status: response.status,
      data: data,
      message: 'Judge0 API is working'
    });

  } catch (error: unknown) {
    console.error('Judge0 test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}












