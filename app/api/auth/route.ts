import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found for email:', email);
      return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password does not match for user:', email);
      return new NextResponse(JSON.stringify({ message: 'Invalid password' }), { status: 401 });
    }

    console.log('Generating access token for user:', user.email);
    const access_token = signToken(user);
    console.log('Access token generated successfully');
    
    const res = NextResponse.json({ access_token });
    res.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    
    console.log('Login successful for user:', user.email);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse(JSON.stringify({ message: 'Login failed' }), { status: 500 });
  }
}
