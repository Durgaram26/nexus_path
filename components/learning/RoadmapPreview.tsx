'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Download,
  Share,
  Edit,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  Link as LinkIcon,
  Tool,
  CheckCircle,
  ArrowRight
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
  id?: number;
  title: string;
  description: string;
  careerPath: string;
  department: string;
  year: number;
  totalDuration: string;
  semesters: Semester[];
  createdAt?: string;
  createdBy?: any;
}

interface RoadmapPreviewProps {
  roadmap: Roadmap;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isEditable?: boolean;
  showActions?: boolean;
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

const categoryLabels = {
  'technical-skills': 'Technical Skills',
  'core-engineering': 'Core Engineering Skills',
  'online-courses': 'Online Courses',
  'workshops': 'Workshops / Bootcamps',
  'competitions': 'Competitions / Challenges',
  'internships': 'Internships',
  'mini-projects': 'Mini Projects',
  'alumni-interaction': 'Alumni Interaction',
  'assessment': 'Core Skill Assessment',
  'profile-building': 'Profile Building Activities'
};

const categoryColors = {
  'technical-skills': 'bg-blue-50 border-blue-200 text-blue-800',
  'core-engineering': 'bg-green-50 border-green-200 text-green-800',
  'online-courses': 'bg-purple-50 border-purple-200 text-purple-800',
  'workshops': 'bg-orange-50 border-orange-200 text-orange-800',
  'competitions': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'internships': 'bg-indigo-50 border-indigo-200 text-indigo-800',
  'mini-projects': 'bg-pink-50 border-pink-200 text-pink-800',
  'alumni-interaction': 'bg-teal-50 border-teal-200 text-teal-800',
  'assessment': 'bg-red-50 border-red-200 text-red-800',
  'profile-building': 'bg-gray-50 border-gray-200 text-gray-800'
};

export default function RoadmapPreview({ 
  roadmap, 
  onEdit, 
  onSave, 
  onCancel, 
  isEditable = false,
  showActions = true 
}: RoadmapPreviewProps) {
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const toggleSemesterExpansion = (semesterId: string) => {
    setExpandedSemester(expandedSemester === semesterId ? null : semesterId);
  };

  const getActivityCount = (category: string) => {
    return roadmap.semesters.reduce((total, semester) => 
      total + semester.activities.filter(a => a.category === category).length, 0
    );
  };

  const getTotalActivities = () => {
    return roadmap.semesters.reduce((total, semester) => total + semester.activities.length, 0);
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    Object.keys(categoryLabels).forEach(category => {
      stats[category] = getActivityCount(category);
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
          <p className="text-gray-600 mt-2">{roadmap.description}</p>
        </div>
        {showActions && (
          <div className="flex space-x-3">
            {isEditable && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Roadmap Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Academic Year</div>
                <div className="font-semibold">Year {roadmap.year}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Career Path</div>
                <div className="font-semibold">{roadmap.careerPath}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Department</div>
                <div className="font-semibold">{roadmap.department}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-semibold">{roadmap.totalDuration}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            Overview
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            Detailed
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {roadmap.semesters.length} semesters • {getTotalActivities()} activities
        </div>
      </div>

      {/* Category Statistics */}
      {viewMode === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
                const count = categoryStats[key];
                const colorClass = categoryColors[key as keyof typeof categoryColors];
                
                if (count === 0) return null;
                
                return (
                  <div key={key} className={`p-3 rounded-lg border ${colorClass}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs opacity-75">activities</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semesters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Semester Breakdown</h2>
        {roadmap.semesters.map((semester, index) => (
          <Card key={semester.id} className="border-l-4 border-l-blue-500">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSemesterExpansion(semester.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {expandedSemester === semester.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">#{semester.number}</span>
                      {semester.title}
                    </h3>
                    <p className="text-sm text-gray-600">{semester.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {semester.activities.length} activities
                  </Badge>
                  {index < roadmap.semesters.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSemester === semester.id && (
                <div className="space-y-4">
                  {/* Activity Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                      const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
                      const activities = semester.activities.filter(a => a.category === key);
                      const colorClass = categoryColors[key as keyof typeof categoryColors];
                      
                      if (activities.length === 0) return null;
                      
                      return (
                        <div key={key} className={`p-3 rounded-lg border ${colorClass}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <div className="space-y-1">
                            {activities.map((activity) => (
                              <div key={activity.id} className="bg-white p-2 rounded border text-xs">
                                <div className="font-medium truncate">{activity.title}</div>
                                <div className="text-gray-500 truncate flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.timeline}
                                </div>
                                {activity.tool && (
                                  <div className="text-gray-500 truncate flex items-center gap-1">
                                    <Tool className="w-3 h-3" />
                                    {activity.tool}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Activities */}
                  {viewMode === 'detailed' && semester.activities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">All Activities</h4>
                      <div className="space-y-2">
                        {semester.activities.map((activity) => {
                          const IconComponent = categoryIcons[activity.category];
                          const colorClass = categoryColors[activity.category];
                          
                          return (
                            <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start gap-3">
                                <IconComponent className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{activity.title}</span>
                                    <Badge variant="outline" className={`text-xs ${colorClass}`}>
                                      {categoryLabels[activity.category]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {activity.timeline && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {activity.timeline}
                                      </div>
                                    )}
                                    {activity.tool && (
                                      <div className="flex items-center gap-1">
                                        <Tool className="w-3 h-3" />
                                        {activity.tool}
                                      </div>
                                    )}
                                    {activity.link && (
                                      <div className="flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />
                                        <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                          View Link
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  {activity.outcome && (
                                    <div className="mt-2 p-2 bg-green-50 rounded border-l-2 border-green-200">
                                      <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                        <div>
                                          <div className="text-sm font-medium text-green-800">Expected Outcome</div>
                                          <div className="text-sm text-green-700">{activity.outcome}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      {showActions && (onSave || onCancel) && (
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave}>
              Save Roadmap
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
