'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    // Check if user wants to stay on login page (by checking URL params or hash)
    const urlParams = new URLSearchParams(window.location.search);
    const forceLogin = urlParams.get('login') === 'true';
    const showLogin = window.location.hash === '#login';

    console.log('Main page routing:', { isAuthenticated, user: user?.role, forceLogin, showLogin });

    if (!isAuthenticated || forceLogin || showLogin) {
      console.log('Redirecting to login');
      router.push('/auth/login');
    } else if (user) {
      // Redirect based on role
      if (user.role === 'student') {
        console.log('Redirecting student to /student/career-dashboard');
        router.push('/student/career-dashboard');
      } else if (user.role === 'faculty') {
        console.log('Redirecting faculty to /faculty/dashboard');
        router.push('/faculty/dashboard');
      } else if (user.role === 'admin') {
        console.log('Redirecting admin to /admin');
        router.push('/admin');
      } else {
        console.log('Unknown role, redirecting to login');
        router.push('/auth/login');
      }
    }
  }, [router, isAuthenticated, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mx-auto mb-4 shadow-lg shadow-primary/20"></div>
          <h2 className="text-xl font-bold text-foreground mb-1">Checking Access</h2>
          <p className="text-sm text-muted-foreground animate-pulse">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mx-auto mb-4 shadow-lg shadow-primary/20"></div>
        <h2 className="text-xl font-bold text-foreground mb-1">Almost There</h2>
        <p className="text-sm text-muted-foreground animate-pulse">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}
