'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoadmapCardProps {
  roadmap: {
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
  };
  progress?: number;
}

// Utility function to safely parse JSON and extract text content
const safeJsonParse = (data: unknown, fallback: unknown = []) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === 'object' && data !== null) {
    return Object.values(data);
  }
  return fallback;
};

// Extract text content from milestone objects
const extractMilestoneText = (milestone: unknown): string => {
  if (typeof milestone === 'string') {
    return milestone;
  }
  if (typeof milestone === 'object' && milestone !== null) {
    const obj = milestone as any;
    return obj.title || obj.description || obj.name || String(milestone);
  }
  return String(milestone || '');
};

// Extract text content from any object
const extractTextContent = (item: unknown): string => {
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as any;
    return obj.title || obj.description || obj.name || obj.text || String(item);
  }
  return String(item || '');
};

export default function RoadmapCard({ roadmap, progress = 0 }: RoadmapCardProps) {
  // Safely parse JSON data
  const milestones = safeJsonParse(roadmap.milestones, []);
  const careerOutcomes = safeJsonParse(roadmap.careerOutcomes, []);
  const learningPath = safeJsonParse(roadmap.learningPath, []);

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{roadmap.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{roadmap.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline" className="text-xs">
              {roadmap.careerPath}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {roadmap.studentLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Week 1 </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Week Indicators */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
              <div className="flex space-x-1">
                {/* Week 1 - Active */}
                <div className={`flex-1 h-2 rounded ${progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                {/* Week 2 - Locked until Week 1 is 100% */}
                <div className={`flex-1 h-2 rounded ${progress >= 25 ? 'bg-green-500' : 'bg-gray-300'}`} />
                {/* Week 3 - Locked until Week 2 is 100% */}
                <div className={`flex-1 h-2 rounded ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
                {/* Week 4 - Locked until Week 3 is 100% */}
                <div className={`flex-1 h-2 rounded ${progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
            
            {progress < 25 && (
              <p className="text-xs text-gray-500 mt-2">🚀 Just getting started! Complete Week 1 to unlock Week 2</p>
            )}
          </div>

          {/* Duration and Level */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{roadmap.totalDuration}</span>
            </div>
            <div>
              <span className="text-gray-600">Level:</span>
              <span className="ml-2 font-medium">{roadmap.studentLevel}</span>
            </div>
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Key Milestones</h4>
              <div className="space-y-1">
                {milestones.slice(0, 3).map((milestone: unknown, index: number) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    <span className="text-gray-700">{extractMilestoneText(milestone)}</span>
                  </div>
                ))}
                {milestones.length > 3 && (
                  <p className="text-xs text-gray-500">+{milestones.length - 3} more milestones</p>
                )}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {learningPath.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Learning Path</h4>
              <div className="flex flex-wrap gap-1">
                {learningPath.slice(0, 4).map((topic: unknown, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {extractTextContent(topic)}
                  </Badge>
                ))}
                {learningPath.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{learningPath.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Career Outcomes */}
          {careerOutcomes.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Career Outcomes</h4>
              <div className="space-y-1">
                {careerOutcomes.slice(0, 2).map((outcome: unknown, index: number) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span className="text-gray-700">{extractTextContent(outcome)}</span>
                  </div>
                ))}
                {careerOutcomes.length > 2 && (
                  <p className="text-xs text-gray-500">+{careerOutcomes.length - 2} more outcomes</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                // Navigate to roadmap details in the same tab
                const detailsUrl = `/student/roadmap-details/${roadmap.id}`;
                window.location.href = detailsUrl;
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
