'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, Calendar, User } from 'lucide-react';

interface CareerPath {
  id: number;
  name: string;
  description: string;
  assignedAt: string;
  assignedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  careerPaths: CareerPath[];
}

export default function StudentCareerPathsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth Helper
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

  const fetchStudentProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/me');
      
      if (response.status === 200) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
      
      if (authPayload) {
        fetchStudentProfile();
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuth) {
      fetchStudentProfile();
    }
  }, [isAuth]);

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading career paths...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Career Paths</h1>
        <p className="text-gray-600">Career paths assigned to you by faculty members</p>
      </div>

      {/* Career Paths Content */}
      {student?.careerPaths && student.careerPaths.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Assigned Career Paths
              </CardTitle>
              <CardDescription>
                Career paths assigned to you by faculty members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.careerPaths.map((careerPath) => (
                  <div key={careerPath.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{careerPath.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Assigned {new Date(careerPath.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    {careerPath.description && (
                      <p className="text-gray-600 mb-3">{careerPath.description}</p>
                    )}
                    
                    {careerPath.assignedByUser && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>Assigned by: {careerPath.assignedByUser.name || careerPath.assignedByUser.email}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Explore Career Options</h3>
                    <p className="text-sm text-gray-600">Discover more career paths</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Track Progress</h3>
                    <p className="text-sm text-gray-600">Monitor your career development</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Set Goals</h3>
                    <p className="text-sm text-gray-600">Define your career objectives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Target className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Career Paths Assigned</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                You haven't been assigned any career paths yet. Contact your faculty members to get started with your career development journey.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/student/messages')}>
                  Contact Faculty
                </Button>
                <Button onClick={() => router.push('/student/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
