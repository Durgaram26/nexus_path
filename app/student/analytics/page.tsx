'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/components/student/AnalyticsDashboard';

export default function StudentAnalyticsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const getAuthPayload = () => {
    if (typeof window === 'undefined') return null;

    let token = localStorage.getItem('access_token');

    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
      }
    }

    if (!token) {
      localStorage.removeItem('access_token');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('access_token');
        return null;
      }
      return payload;
    } catch (error) {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your learning progress and performance metrics</p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
