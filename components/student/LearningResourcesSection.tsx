'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LearningResourcesSectionProps {
  studentId: string;
  departmentId: string;
  onNavigate?: (section: string) => void;
}

export default function LearningResourcesSection({ 
  studentId,
  departmentId,
  onNavigate
}: LearningResourcesSectionProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [resourcesByCategory, setResourcesByCategory] = useState<Record<string, any[]>>({});
  const [assignedResources, setAssignedResources] = useState<any[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [studentCareerPaths, setStudentCareerPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLearningResources();
  }, []);

  const loadLearningResources = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      console.log('Loading learning resources with token:', token ? 'Token present' : 'No token');
      
      const response = await api.get('/student/learning-resources', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.status === 200);

      if (response.status !== 200) {
        console.error('API Error Response:', response.data);
        throw new Error(`Failed to load learning resources: ${response.status}`);
      }

      const data = response.data;
      console.log('API Response data:', data);
      setResources(data.resources || []);
      setResourcesByCategory(data.resourcesByCategory || {});
      setAssignedResources(data.assignedResources || []);
      setAvailableResources(data.availableResources || []);
      setStudentCareerPaths(data.studentCareerPaths || []);
    } catch (error) {
      console.error('Error loading learning resources:', error);
      setError(`Failed to load learning resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = async (resource: any) => {
    try {
      // Track resource access
      await api.post('/student/learning-resources', {
        resourceId: resource.id,
        action: 'access'
      });

      // Open resource in new tab
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking resource access:', error);
      // Still open the resource even if tracking fails
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleResourceComplete = async (resource: any) => {
    try {
      await api.post('/student/learning-resources', {
        resourceId: resource.id,
        action: 'complete'
      });

      // Refresh the resources to show updated status
      loadLearningResources();
    } catch (error) {
      console.error('Error marking resource as complete:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'programming':
        return '💻';
      case 'career development':
        return '🚀';
      case 'documentation':
        return '📚';
      case 'industry news':
        return '📰';
      default:
        return '📖';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
          <p className="text-gray-600">Loading personalized learning ...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
          <p className="text-gray-600">Error </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadLearningResources}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
        <p className="text-gray-600">Personalized learning materials based on your career path and roadmaps</p>
      </div>
      
      {Object.keys(resourcesByCategory).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(resourcesByCategory).map(([category, categoryResources]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  {category}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                        <div className="flex items-center gap-2">
                          <div className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </div>
                          {resource.isFromRoadmap && (
                            <Button variant="outline" className="text-xs">
                              From Roadmap
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleResourceClick(resource)}
                        className="ml-2"
                      >
                        Visit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-medium mb-2">No Resources Available</h3>
              <p className="text-gray-600 mb-4">Learning will appear here once roadmaps are assigned to your career paths.</p>
              <Button onClick={() => onNavigate?.('roadmaps')} variant="outline">
                View Available Roadmaps
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            Quick Actions
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigate?.('daily-quiz')}
            >
              <span className="text-2xl">🎯</span>
              <span>Start Daily Quiz</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigate?.('learning-plan')}
            >
              <span className="text-2xl">📋</span>
              <span>View Learning Plan</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigate?.('analytics')}
            >
              <span className="text-2xl">📊</span>
              <span>Check </span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigate?.('roadmaps')}
            >
              <span className="text-2xl">🗺️</span>
              <span>Browse Roadmaps</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
