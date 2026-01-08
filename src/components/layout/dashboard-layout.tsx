"use client";

import { ReactNode, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { verifyTokenClient } from '@/src/lib/auth-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setAuthorized(false);
      const timeout = setTimeout(() => router.replace('/unauthorized'), 1000);
      return () => clearTimeout(timeout);
    }
    const payload = verifyTokenClient(token);
    if (payload && payload.role === 'admin') {
      setIsAdmin(true);
    } else if (payload && payload.role === 'faculty') {
      setIsFaculty(true);
    }
    setAuthorized(true);
  }, [router]);

  if (authorized === null) {
    return null;
  }

  if (!authorized) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Checking access…</AlertTitle>
          <AlertDescription>
            You are being redirected because your session is missing or expired.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {isAdmin && (
        <aside className="w-64 bg-gray-100 p-6 space-y-4 border-r">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/admin/user-management" className="block p-2 rounded-md hover:bg-gray-200">
              User Management
            </Link>
            <Link href="/admin/college" className="block p-2 rounded-md hover:bg-gray-200">
              College Management
            </Link>
            <Link href="/admin/departments" className="block p-2 rounded-md hover:bg-gray-200">
              Department Management
            </Link>
            <Link href="/admin/faculty" className="block p-2 rounded-md hover:bg-gray-200">
              Faculty Management
            </Link>
            <Link href="/admin/students" className="block p-2 rounded-md hover:bg-gray-200">
              Student Management
            </Link>
            <Link href="/admin/career-paths" className="block p-2 rounded-md hover:bg-gray-200">
              Career Path Management
            </Link>
            <Link href="/admin/provision-accounts" className="block p-2 rounded-md hover:bg-gray-200">
              Account Provisioning
            </Link>
          </nav>
        </aside>
      )}
      
      {isFaculty && (
        <aside className="w-64 bg-blue-50 p-6 space-y-4 border-r">
          <h2 className="text-xl font-bold text-blue-900">Faculty Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/faculty/dashboard" className="block p-2 rounded-md hover:bg-blue-100 text-blue-800">
              📊 Dashboard
            </Link>
            <Link href="/faculty/students" className="block p-2 rounded-md hover:bg-blue-100 text-blue-800">
              👥 Manage Students
            </Link>
            <Link href="/faculty/student-list" className="block p-2 rounded-md hover:bg-blue-100 text-blue-800">
              📋 My Assigned Students
            </Link>
            <Link href="/faculty/learning-management" className="block p-2 rounded-md hover:bg-blue-100 text-blue-800">
              🤖 Learning Management
            </Link>
            <Link href="/faculty/resource-management" className="block p-2 rounded-md hover:bg-blue-100 text-blue-800">
              📚 Resource Management
            </Link>
          </nav>
        </aside>
      )}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
