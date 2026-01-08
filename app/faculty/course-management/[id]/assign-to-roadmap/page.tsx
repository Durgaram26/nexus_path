'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Target,
  BookOpen,
  Users,
  Calendar,
  Clock,
  MapPin,
  Link,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  careerPath: string;
  department: string;
  year: number;
  studentLevel: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  isAIGenerated: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
  category: string;
}

export default function AssignToRoadmap({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/courses/assign-to-roadmap?courseId=${resolvedParams.id}`);
      
      if (response.data.success) {
        setCourse(response.data.course);
        setRoadmaps(response.data.roadmaps);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToRoadmap = async (roadmap: Roadmap) => {
    setAssigning(true);
    try {
      const response = await api.post('/faculty/courses/assign-to-roadmap', {
        courseId: parseInt(resolvedParams.id),
        roadmapId: roadmap.id,
        notes: notes.trim() || null
      });

      if (response.data.success) {
        toast.success('Course assigned to roadmap successfully');
        router.push(`/faculty/course-management/${resolvedParams.id}`);
      } else {
        throw new Error('Failed to assign course');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course to roadmap');
    } finally {
      setAssigning(false);
    }
  };

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roadmap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roadmap.careerPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roadmap.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course and roadmaps...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600">The requested course could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Course to Roadmap</h1>
          <p className="text-gray-600 mt-1">Connect this course with student roadmaps</p>
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
              <p className="text-gray-600 mt-1">{course.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <Badge variant="outline">
                  {course.category}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Instructor: {course.instructor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Available Roadmaps
            </CardTitle>
            <div className="text-sm text-gray-600">
              {filteredRoadmaps.length} roadmaps found
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search roadmaps by title, description, career path, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Roadmaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoadmaps.map((roadmap) => (
                <Card 
                  key={roadmap.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedRoadmap?.id === roadmap.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedRoadmap(roadmap)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {roadmap.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {roadmap.description}
                        </p>
                      </div>
                      {selectedRoadmap?.id === roadmap.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{roadmap.careerPath}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{roadmap.department}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Year {roadmap.year}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{roadmap.studentLevel}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>Created by: {roadmap.createdBy.firstName} {roadmap.createdBy.lastName}</span>
                        {roadmap.isAIGenerated && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredRoadmaps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No roadmaps found matching your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form */}
      {selectedRoadmap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Assign Course to Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Roadmap</h3>
              <p className="text-blue-800">{selectedRoadmap.title}</p>
              <p className="text-sm text-blue-700">{selectedRoadmap.careerPath} • {selectedRoadmap.department}</p>
            </div>

            <div>
              <Label htmlFor="notes">Assignment Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg h-20"
                placeholder="Add any notes about this course assignment to the roadmap..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRoadmap(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAssignToRoadmap(selectedRoadmap)}
                disabled={assigning}
                className="flex-1"
              >
                {assigning ? 'Assigning...' : 'Assign to Roadmap'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
