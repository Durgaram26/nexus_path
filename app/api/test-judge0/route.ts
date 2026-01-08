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

    POST',
      headers: {
        'Content-Type': 'application/json',
        '-RapidAPI-Key': JUDGE0_API_KEY,
        '-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Judge0 test status:', error.response.status);
    console.log('Judge0 test headers:', Object.fromEntries(.headers.entries()));

    if (!.ok) {
      const errorText = await .text();
      console.error('Judge0 test :', errorText);
      return NextResponse.json({
        success: false,
        status: error.response.status,
        : errorText,
        headers: Object.fromEntries(.headers.entries())
      });
    }

    const data = await .json();
    console.log('Judge0 test data:', data);

    return NextResponse.json({
      success: true,
      status: error.response.status,
      data: data,
      message: 'Judge0 API is working'
    });

  } catch (error: error unknown) {
    console.error('Judge0 test :');
    return NextResponse.json({
      success: false,
      : error.message,
      stack: .stack
    }, { status: 500 });
  }
}












