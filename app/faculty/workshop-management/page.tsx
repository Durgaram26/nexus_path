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
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronRight,
  Wrench,
  Target,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Workshop {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  maxParticipants: number;
  enrolledParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location: string;
  prerequisites: string[];
  objectives: string[];
  materials: string[];
  isMandatory: boolean;
  createdAt: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface WorkshopFilters {
  search: string;
  category: string;
  level: string;
  status: string;
}

export default function WorkshopManagement() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState<WorkshopFilters>({
    search: '',
    category: '',
    level: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/workshops');
      if (response.data.success) {
        // Transform the API response to match the Workshop interface
        const transformedWorkshops: Workshop[] = response.data.workshops.map((workshop: any) => ({
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          instructor: workshop.instructor,
          duration: workshop.duration,
          level: workshop.level,
          category: workshop.category,
          maxParticipants: workshop.maxParticipants,
          enrolledParticipants: workshop.enrolledParticipants,
          status: workshop.status,
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          location: workshop.location,
          prerequisites: workshop.prerequisites ? JSON.parse(workshop.prerequisites) : [],
          objectives: workshop.objectives ? JSON.parse(workshop.objectives) : [],
          materials: workshop.materials ? JSON.parse(workshop.materials) : [],
          isMandatory: workshop.isMandatory,
          createdAt: workshop.createdAt,
          createdBy: {
            firstName: workshop.creator?.firstName,
            lastName: workshop.creator?.lastName,
            email: workshop.creator?.email
          }
        }));
        setWorkshops(transformedWorkshops);
      } else {
        throw new Error('Failed to fetch workshops');
      }
    } catch (error: any) {
      console.error('Error fetching workshops:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to fetch workshops. Please try again later.');
      // Set empty array to show the "no workshops" state
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workshopId: number) => {
    if (!confirm('Are you sure you want to delete this workshop? This action cannot be undone.')) {
      return;
    }

    setDeleting(workshopId);
    try {
      const response = await api.delete(`/faculty/workshops/${workshopId}`);
      if (response.data.success) {
      toast.success('Workshop deleted successfully');
      setWorkshops(prev => prev.filter(w => w.id !== workshopId));
      } else {
        throw new Error('Failed to delete workshop');
      }
    } catch (error: any) {
      console.error('Error deleting workshop:', error);
      toast.error('Failed to delete workshop');
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowPreview(true);
  };

  const handleEdit = (workshop: Workshop) => {
    // Navigate to edit page with workshop ID
    window.location.href = `/faculty/workshop-management/edit/${workshop.id}`;
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = !filters.search || 
      workshop.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      workshop.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      workshop.instructor.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || workshop.category === filters.category;
    const matchesLevel = !filters.level || workshop.level === filters.level;
    const matchesStatus = !filters.status || workshop.status === filters.status;

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const getUniqueValues = (key: keyof Workshop) => {
    return [...new Set(workshops.map(w => w[key]).filter(Boolean))];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workshop Management</h1>
          <p className="text-gray-600 mt-2">Manage your workshops and training sessions</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              // Navigate to create workshop page
              window.location.href = '/faculty/workshop-management/create';
            }}
          >
            <Plus className="w-4 h-4" />
            Create New Workshop
          </Button>
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
                    placeholder="Search workshops..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Categories</option>
                  {getUniqueValues('category').map((category) => (
                    <option key={String(category)} value={String(category)}>
                      {String(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Levels</option>
                  {getUniqueValues('level').map((level) => (
                    <option key={String(level)} value={String(level)}>
                      {String(level)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Workshops List */}
      <div className="space-y-4">
        {filteredWorkshops.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workshops Found</h3>
              <p className="text-gray-600 mb-6">
                {workshops.length === 0 
                  ? "You haven't created any workshops yet. Start by creating your first workshop."
                  : "No workshops match your current filters. Try adjusting your search criteria."
                }
              </p>
              {workshops.length === 0 && (
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Workshop
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{workshop.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{workshop.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(workshop)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workshop)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(workshop.id)}
                        disabled={deleting === workshop.id}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        {deleting === workshop.id ? (
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
                      <Badge variant="outline">{workshop.category}</Badge>
                      <Badge variant="outline" className={getLevelColor(workshop.level)}>
                        {workshop.level}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(workshop.status)}>
                        {workshop.status}
                      </Badge>
                      {workshop.isMandatory && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          MANDATORY
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {workshop.instructor}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {workshop.duration}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {workshop.enrolledParticipants}/{workshop.maxParticipants} participants
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {workshop.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(workshop.startDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created by {workshop.createdBy?.firstName} {workshop.createdBy?.lastName} on{' '}
                      {new Date(workshop.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(workshop)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workshop)}
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
      {showPreview && selectedWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedWorkshop.title}</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedWorkshop.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Instructor</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.instructor}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Duration</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.duration}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Level</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.level}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Status</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Enrollment</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.enrolledParticipants}/{selectedWorkshop.maxParticipants} participants</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Location</div>
                    <div className="text-lg font-semibold">{selectedWorkshop.location}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Start Date</div>
                    <div className="text-lg font-semibold">{new Date(selectedWorkshop.startDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">End Date</div>
                    <div className="text-lg font-semibold">{new Date(selectedWorkshop.endDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {selectedWorkshop.prerequisites && selectedWorkshop.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedWorkshop.prerequisites.map((prereq, index) => (
                        <li key={index} className="text-gray-700">{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedWorkshop.objectives && selectedWorkshop.objectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedWorkshop.objectives.map((objective, index) => (
                        <li key={index} className="text-gray-700">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedWorkshop.materials && selectedWorkshop.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Required Materials</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedWorkshop.materials.map((material, index) => (
                        <li key={index} className="text-gray-700">{material}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
