'use client';

import { useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/src/lib/auth';
import { verifyTokenClient } from '@/src/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const payload = verifyTokenClient(token);
    if (!payload) {
      router.replace('/auth/login');
      return;
    }

    const role = (payload as any).role;
    switch (role) {
      case 'admin':
        router.replace('/admin/user-management');
        break;
      case 'faculty':
        router.replace('/faculty/dashboard');
        break;
      case 'student':
        router.replace('/student/career-dashboard');
        break;
      default:
        router.replace('/unauthorized');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Dashboard...</h1>
        <p className="text-gray-600">Redirecting based on your role...</p>
      </div>
    </div>
  );
}
