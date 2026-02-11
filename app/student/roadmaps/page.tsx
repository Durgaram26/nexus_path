'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoadmapCard from '@/components/student/RoadmapCard';
import { BookOpen, Target, MessageSquare, Compass } from 'lucide-react';

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

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Roadmaps</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personalized learning journey based on career goals
          </p>
        </div>
        {roadmaps.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {roadmapProgress[roadmaps[0]?.id] || 0}% Complete
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="max-w-4xl mx-auto">
          <Card className="animate-pulse border border-border/60">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="h-6 bg-secondary rounded w-3/4" />
                <div className="h-4 bg-secondary rounded w-1/2" />
                <div className="h-4 bg-secondary rounded w-2/3" />
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-secondary rounded" />
                  <div className="h-3 bg-secondary rounded w-5/6" />
                  <div className="h-3 bg-secondary rounded w-4/6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : roadmaps.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <RoadmapCard
            key={roadmaps[0].id}
            roadmap={roadmaps[0]}
            progress={roadmapProgress[roadmaps[0].id] || 0}
          />
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Roadmaps Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              You haven't been assigned any learning roadmaps yet. Contact your faculty to get started with your personalized learning journey.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/student/messages')}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Faculty
              </Button>
              <Button
                onClick={() => router.push('/student/career-paths')}
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                View Career Paths
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
