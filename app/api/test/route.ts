import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 TEST API ROUTE CALLED');
  return NextResponse.json({ 
    success: true, 
    message: 'Test API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('🧪 TEST API POST CALLED');
  const body = await request.json();
  return NextResponse.json({ 
    success: true, 
    message: 'Test POST is working',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}