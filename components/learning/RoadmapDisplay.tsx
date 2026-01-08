'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  skills?: string[];
  resources?: {
    type: 'video' | 'article' | 'book' | 'course' | 'project';
    title: string;
    url?: string;
    description: string;
  }[];
  prerequisites?: string[];
  // For manual roadmaps
  activities?: {
    id: string;
    title: string;
    description: string;
    timeline: string;
    tool: string;
    link: string;
    outcome: string;
    category: string;
  }[];
}

interface RoadmapDisplayProps {
  roadmap: {
    id: number;
    title: string;
    description: string;
    totalDuration: string;
    year: number;
    careerPath: string;
    department: string;
    studentLevel: string;
    milestones: RoadmapMilestone[];
    learningPath: string;
    careerOutcomes: string[];
    createdAt: string;
    createdBy: {
      firstName?: string;
      lastName?: string;
    };
  };
  onClose: () => void;
  onDelete?: (roadmapId: number) => void;
}

export default function RoadmapDisplay({ roadmap, onClose, onDelete }: RoadmapDisplayProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/learning/roadmap?id=${roadmap.id}`);
      toast.success('Roadmap deleted successfully');
      onDelete(roadmap.id);
      onClose();
    } catch (error: unknown) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap', {
        description: (error as any)?.response?.data?.message || 'Unknown error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'book': return '📚';
      case 'course': return '🎓';
      case 'project': return '🛠️';
      default: return '📖';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl mb-2">{roadmap.title}</h1>
                <p className="text-base mb-4">
                  {roadmap.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Year {roadmap.year}</Badge>
                  <Badge variant="outline">{roadmap.careerPath}</Badge>
                  <Badge variant="outline">{roadmap.department}</Badge>
                  <Badge variant="outline" className={getDifficultyColor(roadmap.studentLevel)}>
                    {roadmap.studentLevel}
                  </Badge>
                  <Badge variant="outline">⏱️ {roadmap.totalDuration}</Badge>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Learning Path Overview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Learning Path</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {roadmap.learningPath}
              </p>
            </div>

            {/* Career Outcomes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Career Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(roadmap.careerOutcomes || []).map((outcome, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-green-800">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Milestones</h3>
              <div className="space-y-4">
                {(roadmap.milestones || []).map((milestone, index) => (
                  <Card key={milestone.id} className="border-l-4 border-l-blue-500">
                    <div className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedMilestone(
                        expandedMilestone === milestone.id ? null : milestone.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-lg flex items-center gap-2">
                            <span className="text-blue-600">#{index + 1}</span>
                            {milestone.title}
                          </div>
                          <div className="mt-1">
                            {milestone.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {milestone.difficulty && (
                            <Badge className={getDifficultyColor(milestone.difficulty)}>
                              {milestone.difficulty}
                            </Badge>
                          )}
                          <Badge variant="outline">⏱️ {milestone.duration}</Badge>
                          <span className="text-gray-400">
                            {expandedMilestone === milestone.id ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedMilestone === milestone.id && (
                      <CardContent className="pt-0">
                        {/* Skills - only for AI roadmaps */}
                        {milestone.skills && milestone.skills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Skills to Learn:</h4>
                            <div className="flex flex-wrap gap-2">
                              {milestone.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activities - for manual roadmaps */}
                        {milestone.activities && milestone.activities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Activities:</h4>
                            <div className="space-y-3">
                              {milestone.activities.map((activity: any, activityIndex: number) => (
                                <div key={activityIndex} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{activity.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {activity.category?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Badge>
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    {activity.timeline && <span>Timeline: {activity.timeline}</span>}
                                    {activity.tool && <span>Tool: {activity.tool}</span>}
                                    {activity.link && (
                                      <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        View Link
                                      </a>
                                    )}
                                  </div>
                                  {activity.outcome && (
                                    <p className="text-sm text-green-700 mt-2">
                                      <strong>Outcome:</strong> {activity.outcome}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prerequisites - only for AI roadmaps */}
                        {milestone.prerequisites && milestone.prerequisites.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Prerequisites:</h4>
                            <div className="flex flex-wrap gap-2">
                              {milestone.prerequisites.map((prereq, prereqIndex) => (
                                <Badge key={prereqIndex} variant="outline" className="bg-yellow-50 text-yellow-800">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resources */}
                        <div>
                          <h4 className="font-medium mb-3">Learning Resources:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {milestone.resources?.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">{getResourceIcon(resource.type)}</span>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{resource.title}</div>
                                    <div className="text-xs text-gray-600 mt-1">{resource.description}</div>
                                    {resource.url && (
                                      <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 text-xs hover:underline mt-1 inline-block"
                                      >
                                        View Resource →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-4 border-t text-sm text-gray-500">
              <p>Created by {roadmap.createdBy?.firstName} {roadmap.createdBy?.lastName} on {new Date(roadmap.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
