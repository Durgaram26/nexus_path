'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoadmapCard from '@/components/student/RoadmapCard';
import { BookOpen, Target, Calendar, User } from 'lucide-react';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: string;
  learningPath: string;
  careerOutcomes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  createdByUser: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function StudentRoadmapsPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<{ [key: number]: number }>({});
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

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/student/assigned-roadmaps');
      
      if (response.status === 200) {
        setRoadmaps(response.data.roadmaps || []);
        setRoadmapProgress(response.data.progress || {});
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to load roadmaps');
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
        fetchRoadmaps();
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuth) {
      fetchRoadmaps();
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Roadmaps</h1>
        <p className="text-gray-600">Assigned learning roadmaps based on your career paths</p>
      </div>

      {/* Roadmaps Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : roadmaps.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          {/* Show only the first (and should be only) roadmap */}
          <RoadmapCard
            key={roadmaps[0].id}
            roadmap={roadmaps[0]}
            progress={roadmapProgress[roadmaps[0].id] || 0}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Roadmaps Assigned</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                You haven't been assigned any learning roadmaps yet. Contact your faculty members to get started with your learning journey.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/student/messages')}>
                  Contact Faculty
                </Button>
                <Button onClick={() => router.push('/student/career-paths')}>
                  View Career Paths
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
