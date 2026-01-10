import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/favicon.ico',
];

const ROLE_GUARDS: Record<string, Array<'admin' | 'faculty' | 'student'>> = {
  '/admin': ['admin'],
  '/faculty': ['faculty', 'admin'],
  '/student': ['student', 'admin', 'faculty'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  for (const prefix in ROLE_GUARDS) {
    if (pathname.startsWith(prefix)) {
      const allowed = ROLE_GUARDS[prefix];
      if (!allowed.includes((payload as any).role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|assets|.*\\.png$).*)'],
};
