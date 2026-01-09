'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  User, 
  Brain,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

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
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  assignmentId: number;
  assignedAt: string;
  progress: number;
  notes: string;
  assignedBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function StudentRoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresCareerPath, setRequiresCareerPath] = useState(false);
  const [requiresRoadmapCreation, setRequiresRoadmapCreation] = useState(false);

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
    } catch (error: any) {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  const fetchRoadmap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching roadmap...');
      console.log('API base URL:', api.defaults.baseURL);
      console.log('Request URL:', `${api.defaults.baseURL}/student/ai-roadmap`);
      console.log('Full URL should be:', `${window.location.origin}/api/student/ai-roadmap`);
      
      // Note: 400 errors are expected when student needs career paths assigned
      const response = await api.get('/student/ai-roadmap');
      
      if (response.status === 200) {
        if (response.data.roadmap) {
          setRoadmap(response.data.roadmap);
          setIsNew(response.data.isNew);
          
          if (response.data.isNew) {
            toast.success('Roadmap assigned successfully!');
          }
        } else {
          // No roadmap available - just ignore silently
          console.log('No roadmap available - ignoring');
          setRoadmap(null);
          setIsNew(false);
        }
      } else {
        setError('Failed to load roadmap');
      }
    } catch (error: any) {
      // Handle expected 400 errors (career path requirements) without logging as errors
      if (error.response?.status === 400) {
        if (error.response.data?.requiresCareerPath) {
          console.log('Student needs career paths assigned');
          setRequiresCareerPath(true);
          setError('No career paths assigned. Please contact your faculty to assign career paths first.');
        } else if (error.response.data?.requiresRoadmapCreation) {
          console.log('No roadmap available for student profile');
          setRequiresRoadmapCreation(true);
          setError('No roadmap available for your profile. Please contact your faculty to create one.');
        } else {
          console.error('Unexpected 400 error:', error.response.data);
          setError(error.response.data?.error || 'Failed to load roadmap');
        }
      } else if (error.response?.status === 401) {
        console.error('Authentication error:', error);
        setError('Unauthorized. Please log in again.');
      } else if (error.response?.status === 403) {
        console.error('Authorization error:', error);
        setError('Access denied. You do not have permission to view roadmaps.');
      } else if (error.response?.status === 404) {
        console.error('404 Error - Full response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          dataString: JSON.stringify(error.response?.data),
          headers: error.response?.headers,
          config: error.config
        });
        
        // Check if it's a "no roadmap available" error - just ignore it silently
        if (error.response?.data?.requiresRoadmapCreation) {
          console.log('No AI roadmap available for student profile - ignoring');
          setRequiresRoadmapCreation(false);
          setError(null);
          setIsLoading(false);
          return; // Exit early, don't show any error
        } else {
          // Since we know from server logs that no roadmap was found, just ignore it
          console.log('404 with empty or missing data - ignoring no roadmap case');
          setRequiresRoadmapCreation(false);
          setError(null);
          setIsLoading(false);
          return; // Exit early, don't show any error
        }
      } else {
        console.error('Unexpected error fetching roadmap:', error);
        setError('Failed to load roadmap. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRoadmap();
  };

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
      
      if (authPayload) {
        fetchRoadmap();
      }
    };
    
    checkAuth();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              Learning Roadmap
            </h1>
            <p className="text-gray-600">Your personalized learning journey</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Roadmap</h3>
              <p className="text-gray-500 mb-6 max-w-md">{error}</p>
              <div className="flex gap-3">
                {requiresCareerPath && (
                  <Button onClick={() => router.push('/student/career-paths')}>
                    View Career Paths
                  </Button>
                )}
                {requiresRoadmapCreation && (
                  <Button variant="outline" onClick={() => router.push('/student/messages')}>
                    Contact Faculty
                  </Button>
                )}
                <Button variant="outline" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : roadmap ? (
        <div className="space-y-6">
          {/* Roadmap Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-600" />
                    {roadmap.title}
                    {isNew && (
                      <Badge variant="default" className="ml-2">
                        New Assignment
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Year {roadmap.year}</Badge>
                    <Badge variant="outline">{roadmap.careerPath}</Badge>
                    <Badge variant="outline">{roadmap.department}</Badge>
                    <Badge variant="outline" className="capitalize">{roadmap.studentLevel}</Badge>
                    <Badge variant="secondary" className={roadmap.isAIGenerated ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                      {roadmap.isAIGenerated ? "AI Generated" : "Manual Assignment"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">{roadmap.progress}%</div>
                  <Progress value={roadmap.progress} className="w-24 mt-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{roadmap.totalDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Created by {roadmap.createdByUser.firstName} {roadmap.createdByUser.lastName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Assigned {new Date(roadmap.assignedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Learning Path</h4>
                <p className="text-blue-800">{roadmap.learningPath}</p>
              </div>
            </CardContent>
          </Card>

          {/* Career Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Career Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {JSON.parse(roadmap.careerOutcomes).map((outcome: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-600 mt-0.5 w-4 h-4 flex-shrink-0" />
                    <span className="text-green-800">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Semester Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Learning Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {JSON.parse(roadmap.milestones).map((semester: any, index: number) => (
                  <div key={semester.id || index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{semester.title}</h4>
                      <Badge variant="outline">Semester {semester.number}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{semester.description}</p>
                    {semester.activities && semester.activities.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Activities ({semester.activities.length})</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {semester.activities.map((activity: any, activityIndex: number) => (
                            <div key={activityIndex} className="bg-gray-50 p-2 rounded text-sm">
                              <div className="font-medium">{activity.title}</div>
                              <div className="text-gray-600">{activity.timeline}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push(`/student/roadmap-details/${roadmap.id}`)}
              className="flex items-center gap-2"
            >
              View Full Details
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/student/learning-plan')}
            >
              Learning Plan
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Brain className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Roadmap Available</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                No roadmap is available for your profile. Please contact your faculty to assign one.
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
