'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  BookOpen,
  Code,
  Trophy,
  Briefcase,
  Users,
  Target,
  FileText,
  Brain,
  Wrench,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize
} from 'lucide-react';

interface SemesterActivity {
  id: string;
  title: string;
  description: string;
  timeline: string;
  tool?: string;
  link?: string;
  outcome: string;
  category: 'technical-skills' | 'core-engineering' | 'online-courses' | 'workshops' | 'competitions' | 'internships' | 'mini-projects' | 'alumni-interaction' | 'assessment' | 'profile-building';
}

interface Semester {
  id: string;
  number: number;
  title: string;
  description: string;
  activities: SemesterActivity[];
}

interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: Semester[];
  learningPath: string;
  careerOutcomes: string[];
  createdAt: string;
  createdBy: any;
}

interface InteractiveRoadmapVisualizationProps {
  roadmap: Roadmap;
  isInteractive?: boolean;
  onActivityClick?: (activity: SemesterActivity, semester: Semester) => void;
  onSemesterClick?: (semester: Semester) => void;
}

const categoryIcons = {
  'technical-skills': Brain,
  'core-engineering': Wrench,
  'online-courses': BookOpen,
  'workshops': GraduationCap,
  'competitions': Trophy,
  'internships': Briefcase,
  'mini-projects': Code,
  'alumni-interaction': Users,
  'assessment': Target,
  'profile-building': FileText
};

const categoryColors = {
  'technical-skills': 'bg-blue-100 text-blue-800 border-blue-200',
  'core-engineering': 'bg-green-100 text-green-800 border-green-200',
  'online-courses': 'bg-purple-100 text-purple-800 border-purple-200',
  'workshops': 'bg-orange-100 text-orange-800 border-orange-200',
  'competitions': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'internships': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'mini-projects': 'bg-pink-100 text-pink-800 border-pink-200',
  'alumni-interaction': 'bg-teal-100 text-teal-800 border-teal-200',
  'assessment': 'bg-red-100 text-red-800 border-red-200',
  'profile-building': 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function InteractiveRoadmapVisualization({ 
  roadmap, 
  isInteractive = true,
  onActivityClick,
  onSemesterClick 
}: InteractiveRoadmapVisualizationProps) {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'flow'>('timeline');
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSteps = roadmap.milestones.length;
  const currentSemester = roadmap.milestones[currentStep];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000); // 3 seconds per step
    } else if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, totalSteps]);

  const handleSemesterClick = (semester: Semester) => {
    if (isInteractive) {
      setSelectedSemester(selectedSemester === semester.id ? null : semester.id);
      onSemesterClick?.(semester);
    }
  };

  const handleActivityClick = (activity: SemesterActivity, semester: Semester) => {
    if (isInteractive) {
      setSelectedActivity(selectedActivity === activity.id ? null : activity.id);
      onActivityClick?.(activity, semester);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const renderTimelineView = () => (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
      
      <div className="space-y-8">
        {roadmap.milestones.map((semester, index) => (
          <div key={semester.id} className="relative">
            {/* Timeline Node */}
            <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
            
            {/* Semester Card */}
            <div className="ml-16">
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedSemester === semester.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${currentStep === index ? 'bg-blue-50' : ''}`}
                onClick={() => handleSemesterClick(semester)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-600">#{semester.number}</span>
                        <span>{semester.title}</span>
                        {currentStep === index && (
                          <Badge className="bg-blue-600 text-white animate-pulse">Current</Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-600 mt-2">{semester.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {semester.activities.length} activities
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {selectedSemester === semester.id && (
                  <CardContent>
                    <div className="space-y-4">
                      {/* Activity Categories */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {Object.entries(categoryIcons).map(([key, IconComponent]) => {
                          const activities = semester.activities.filter(a => a.category === key);
                          if (activities.length === 0) return null;
                          
                          return (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <IconComponent className="w-4 h-4" />
                                {activities.length} items
                              </div>
                              <div className="space-y-1">
                                {activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className={`p-2 rounded border cursor-pointer transition-colors hover:bg-gray-50 ${
                                      selectedActivity === activity.id ? 'bg-blue-50 border-blue-300' : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleActivityClick(activity, semester);
                                    }}
                                  >
                                    <div className="text-sm font-medium truncate">{activity.title}</div>
                                    <div className="text-xs text-gray-500">{activity.timeline}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roadmap.milestones.map((semester, index) => (
        <Card 
          key={semester.id}
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            selectedSemester === semester.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
          } ${currentStep === index ? 'bg-blue-50' : ''}`}
          onClick={() => handleSemesterClick(semester)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">#{semester.number}</span>
              <span>{semester.title}</span>
              {currentStep === index && (
                <Badge className="bg-blue-600 text-white animate-pulse">Current</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">{semester.description}</p>
          </CardHeader>
          
          {selectedSemester === semester.id && (
            <CardContent>
              <div className="space-y-3">
                {semester.activities.map((activity) => {
                  const IconComponent = categoryIcons[activity.category];
                  const colorClass = categoryColors[activity.category];
                  
                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded border cursor-pointer transition-colors hover:bg-gray-50 ${colorClass} ${
                        selectedActivity === activity.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity, semester);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs opacity-75 mt-1">{activity.timeline}</div>
                          {activity.tool && (
                            <div className="text-xs opacity-75">Tool: {activity.tool}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );

  const renderFlowView = () => (
    <div className="relative overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {roadmap.milestones.map((semester, index) => (
          <div key={semester.id} className="flex-shrink-0 w-80">
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedSemester === semester.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${currentStep === index ? 'bg-blue-50' : ''}`}
              onClick={() => handleSemesterClick(semester)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-600">#{semester.number}</span>
                  <span>{semester.title}</span>
                  {currentStep === index && (
                    <Badge className="bg-blue-600 text-white animate-pulse">Current</Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600">{semester.description}</p>
              </CardHeader>
              
              {selectedSemester === semester.id && (
                <CardContent>
                  <div className="space-y-2">
                    {semester.activities.slice(0, 5).map((activity) => {
                      const IconComponent = categoryIcons[activity.category];
                      
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityClick(activity, semester);
                          }}
                        >
                          <IconComponent className="w-4 h-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{activity.title}</div>
                            <div className="text-xs text-gray-500">{activity.timeline}</div>
                          </div>
                        </div>
                      );
                    })}
                    {semester.activities.length > 5 && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        +{semester.activities.length - 5} more activities
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Arrow to next semester */}
            {index < roadmap.milestones.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{roadmap.title}</h2>
          <p className="text-gray-600">{roadmap.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Year {roadmap.year}</Badge>
          <Badge variant="outline">{roadmap.careerPath}</Badge>
          <Badge variant="outline">{roadmap.department}</Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex border rounded">
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'flow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('flow')}
              >
                Flow
              </Button>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div 
        ref={containerRef}
        className="overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'flow' && renderFlowView()}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
