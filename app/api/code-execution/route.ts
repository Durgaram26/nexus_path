import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_API_KEY = 'd9d1152807mshcf611fa7a591e0dp19c29djsna1fd831ce5e1';
const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

export async function POST(request: NextRequest) {
  try {
    console.log('Code execution API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { code, languageId, input } = body;

    if (!code || !languageId) {
      console.log('Missing required fields:', { code: !!code, languageId: !!languageId });
      return NextResponse.json(
        { message: 'Code and language ID are required' },
        { status: 400 }
      );
    }

    // Submit code for execution
    console.log('Submitting to Judge0 API...');
    
    // Use Buffer for base64 encoding in Node.js
    const requestBody = {
      language_id: languageId,
      source_code: Buffer.from(code, 'utf8').toString('base64'),
      stdin: Buffer.from(input || '', 'utf8').toString('base64'),
      base64_encoded: true,
      cpu_time_limit: '2.0', // 2 seconds CPU time limit
      wall_time_limit: '5.0', // 5 seconds wall time limit
      memory_limit: '128000' // 128MB memory limit
    };
    console.log('Judge0 request body (without encoded content):', {
      language_id: requestBody.language_id,
      base64_encoded: requestBody.base64_encoded,
      source_code_length: requestBody.source_code.length,
      stdin_length: requestBody.stdin.length
    });

    const submissionResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Judge0 status:', submissionResponse.status);
    
    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error('Judge0 submission error:', errorText);
      console.error('Judge0 headers:', submissionResponse.headers);
      return NextResponse.json(
        { message: `Failed to submit code: ${submissionResponse.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const submissionData = await submissionResponse.json();
    console.log('Judge0 submission response:', submissionData);
    
    if (!submissionData.token) {
      console.error('No token in response:', submissionData);
      return NextResponse.json(
        { message: 'No token received from Judge0' },
        { status: 500 }
      );
    }

    console.log('Successfully got token:', submissionData.token);
    return NextResponse.json({ token: submissionData.token });

  } catch (error: unknown) {
    console.error('Code execution API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Getting execution result...');
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log('Token:', token);

    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Get execution result
    const resultResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    if (!resultResponse.ok) {
      const errorText = await resultResponse.text();
      console.error('Judge0 result error:', errorText);
      return NextResponse.json(
        { message: `Failed to get result: ${resultResponse.status}` },
        { status: 500 }
      );
    }

    const result = await resultResponse.json();

    console.log('Judge0 result response:', result);
    
    // Decode base64 output if present
    if (result.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString('utf-8');
    }
    if (result.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString('utf-8');
    }
    if (result.compile_output) {
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf-8');
    }
    
    console.log('Decoded result:', {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Code execution result API error:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
