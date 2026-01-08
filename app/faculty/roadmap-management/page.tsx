'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  Users,
  BookOpen,
  Brain,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: any[];
  learningPath: string;
  careerOutcomes: string[];
  createdAt: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface RoadmapFilters {
  search: string;
  careerPath: string;
  department: string;
  year: string;
}

export default function RoadmapManagement() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState<RoadmapFilters>({
    search: '',
    careerPath: '',
    department: '',
    year: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await api.get('/learning/roadmap/manual');
      
      if (response.data.success) {
        setRoadmaps(response.data.roadmaps || []);
      } else {
        toast.error('Failed to fetch roadmaps');
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roadmapId: number) => {
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    setDeleting(roadmapId);
    try {
      await api.delete(`/learning/roadmap?id=${roadmapId}`);
      toast.success('Roadmap deleted successfully');
      setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap');
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setShowPreview(true);
  };

  const handleEdit = (roadmap: Roadmap) => {
    // Navigate to edit page with roadmap ID
    window.location.href = `/faculty/roadmap-creator?edit=${roadmap.id}`;
  };

  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = !filters.search || 
      roadmap.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      roadmap.careerPath.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCareerPath = !filters.careerPath || roadmap.careerPath === filters.careerPath;
    const matchesDepartment = !filters.department || roadmap.department === filters.department;
    const matchesYear = !filters.year || roadmap.year.toString() === filters.year;

    return matchesSearch && matchesCareerPath && matchesDepartment && matchesYear;
  });

  const getUniqueValues = (key: keyof Roadmap) => {
    return [...new Set(roadmaps.map(r => r[key]).filter(Boolean))];
  };

  const getDifficultyColor = (level: string) => {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roadmap Management</h1>
          <p className="text-gray-600 mt-2">Manage your learning roadmaps</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/faculty/roadmap-creator">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Roadmap
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roadmaps..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Career Path</label>
                <select
                  value={filters.careerPath}
                  onChange={(e) => setFilters(prev => ({ ...prev, careerPath: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Career Paths</option>
                  {getUniqueValues('careerPath').map((path) => (
                    <option key={String(path)} value={String(path)}>
                      {String(path)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Departments</option>
                  {getUniqueValues('department').map((dept) => (
                    <option key={String(dept)} value={String(dept)}>
                      {String(dept)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Years</option>
                  {getUniqueValues('year').map((year) => (
                    <option key={String(year)} value={String(year)}>
                      Year {String(year)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Roadmaps List */}
      <div className="space-y-4">
        {filteredRoadmaps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roadmaps Found</h3>
              <p className="text-gray-600 mb-6">
                {roadmaps.length === 0 
                  ? "You haven't created any roadmaps yet. Start by creating your first roadmap."
                  : "No roadmaps match your current filters. Try adjusting your search criteria."
                }
              </p>
              {roadmaps.length === 0 && (
                <Link href="/faculty/roadmap-creator">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Roadmap
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{roadmap.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{roadmap.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(roadmap)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(roadmap)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(roadmap.id)}
                        disabled={deleting === roadmap.id}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        {deleting === roadmap.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Year {roadmap.year}</Badge>
                      <Badge variant="outline">{roadmap.careerPath}</Badge>
                      <Badge variant="outline">{roadmap.department}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(roadmap.studentLevel)}>
                        {roadmap.studentLevel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {roadmap.totalDuration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {roadmap.milestones.length} semesters
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created by {roadmap.createdBy?.firstName} {roadmap.createdBy?.lastName} on{' '}
                      {new Date(roadmap.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(roadmap)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(roadmap)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRoadmap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedRoadmap.title}</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedRoadmap.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Career Path</div>
                    <div className="text-lg font-semibold">{selectedRoadmap.careerPath}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Department</div>
                    <div className="text-lg font-semibold">{selectedRoadmap.department}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Year</div>
                    <div className="text-lg font-semibold">Year {selectedRoadmap.year}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Duration</div>
                    <div className="text-lg font-semibold">{selectedRoadmap.totalDuration}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Learning Path</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedRoadmap.learningPath}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Career Outcomes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRoadmap.careerOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="text-green-800">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Semester Breakdown</h3>
                  <div className="space-y-4">
                    {selectedRoadmap.milestones.map((semester: any, index: number) => (
                      <div key={semester.id} className="border rounded-lg p-4">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
