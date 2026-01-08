'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoadmapGenerator from '@/components/learning/RoadmapGenerator';
import RoadmapDisplay from '@/components/learning/RoadmapDisplay';
import { Plus, Edit, Trash2, Eye, Download, Brain } from 'lucide-react';

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  resources: {  // Fixed: Added property name "resources"
    type: 'video' | 'article' | 'book' | 'course' | 'project';
    title: string;
    url?: string;
    description: string;
  }[];
  prerequisites?: string[];
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
  milestones: RoadmapMilestone[];
  learningPath: string;
  careerOutcomes: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface Student {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  departmentId: number;
  department: {
    id: number;
    name: string;
    college: {
      id: number;
      name: string;
    };
  };
  year: number;
  registerNumber: string;
  careerPaths: {
    id: number;
    studentId: number;  // Fixed: Added missing property
    careerPathId: number;
    assignedAt: string;
    careerPath: {
      id: number;
      name: string;
      description: string | null;
    };
  }[];
}

export default function LearningManagementPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);  // Fixed: Correct useState usage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCareerPath, setFilterCareerPath] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Modal states
  const [showRoadmapGenerator, setShowRoadmapGenerator] = useState(false);  // Fixed
  const [showRoadmapDisplay, setShowRoadmapDisplay] = useState(false);  // Fixed
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  
  
  // Roadmap assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);  // Fixed
  const [selectedRoadmapForAssignment, setSelectedRoadmapForAssignment] = useState<Roadmap | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentFilterYear, setStudentFilterYear] = useState('');
  const [studentFilterCareerPath, setStudentFilterCareerPath] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);  // Fixed
  
  // Assignment management states
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);  // Fixed
  
  // Assignment filter states
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [assignmentFilterDepartment, setAssignmentFilterDepartment] = useState('');
  const [assignmentFilterYear, setAssignmentFilterYear] = useState('');
  const [assignmentFilterCareerPath, setAssignmentFilterCareerPath] = useState('');
  const [assignmentFilterRoadmap, setAssignmentFilterRoadmap] = useState('');

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const response = await api.get('/learning/roadmap');  // Fixed: Added await and response
      setRoadmaps(response.data.roadmaps || []);
    } catch (error: any) {  // Fixed: Correct error typing
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to fetch roadmaps', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/faculty/assigned-students');  // Fixed
      setStudents(response.data.students || []);
    } catch (error: any) {  // Fixed
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department');  // Fixed
      setDepartments(response.data || []);
    } catch (error: any) {  // Fixed
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/learning/roadmap/assign');  // Fixed
      setAssignments(response.data.assignments || []);
    } catch (error: any) {  // Fixed
      console.error('Error fetching assignments:', error);
      // Don't show toast if it's just that no assignments exist yet
      if (error?.response?.status !== 404) {  // Fixed: Changed to 404 (not 500)
        toast.error('Failed to fetch roadmap assignments', { 
          description: error?.response?.data?.message || 'Unknown error' 
        });
      }
      setAssignments([]);
    }
  };

  const removeAssignment = async (assignmentId: number) => {
    try {
      await api.delete(`/learning/roadmap/assign?id=${assignmentId}`);  // Fixed: Removed extra slash
      toast.success('Roadmap assignment removed successfully');
      fetchAssignments();
    } catch (error: any) {  // Fixed
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    }
  };

  const handleDeleteRoadmap = async (roadmapId: number) => {
    try {
      await api.delete(`/learning/roadmap?id=${roadmapId}`);
      setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
      toast.success('Roadmap deleted successfully');
    } catch (error: any) {  // Fixed
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    }
  };

  const handleViewRoadmap = async (roadmapId: number) => {
    try {
      const response = await api.get(`/learning/roadmap/${roadmapId}`);  // Fixed
      setSelectedRoadmap(response.data.roadmap);
      setShowRoadmapDisplay(true);  // Fixed
    } catch (error: any) {  // Fixed
      console.error('Error fetching roadmap details:', error);
      toast.error('Failed to load roadmap details', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    }
  };

  const handleAssignRoadmap = (roadmap: Roadmap) => {
    setSelectedRoadmapForAssignment(roadmap);
    setSelectedStudents([]);
    setShowAssignmentModal(true);  // Fixed
  };

  const handleEditRoadmap = (roadmap: Roadmap) => {
    // Navigate to edit page with roadmap ID
    window.location.href = `/faculty/roadmap-creator?edit=${roadmap.id}`;
  };

  const handleStudentSelection = (studentId: number) => {  // Fixed: Added parameter type
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignToStudents = async () => {
    if (!selectedRoadmapForAssignment || selectedStudents.length === 0) {
      toast.error('Please select a roadmap and at least one student');
      return;
    }

    setIsAssigning(true);  // Fixed
    try {
      const assignments = selectedStudents.map(studentId => ({
        roadmapId: selectedRoadmapForAssignment.id,
        studentId
      }));

      await api.post('/learning/roadmap/assign', { assignments });
      
      toast.success(`Roadmap assigned to ${selectedStudents.length} student(s)`);
      setShowAssignmentModal(false);  // Fixed
      setSelectedRoadmapForAssignment(null);
      setSelectedStudents([]);
    } catch (error: any) {  // Fixed
      console.error('Error assigning roadmap:', error);
      toast.error('Failed to assign roadmap', { 
        description: error?.response?.data?.message || 'Unknown error' 
      });
    } finally {
      setIsAssigning(false);  // Fixed
    }
  };

  useEffect(() => {
    fetchRoadmaps();
    fetchStudents();
    fetchDepartments();
    fetchAssignments();
  }, []);

  // Filter roadmaps based on search and filters
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roadmap.careerPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roadmap.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = !filterYear || roadmap.year === parseInt(filterYear);
    const matchesCareerPath = !filterCareerPath || roadmap.careerPath.toLowerCase().includes(filterCareerPath.toLowerCase());
    const matchesDepartment = !filterDepartment || roadmap.department.toLowerCase().includes(filterDepartment.toLowerCase());

    return matchesSearch && matchesYear && matchesCareerPath && matchesDepartment;
  });

  // Filter students for assignment
  const filteredStudents = students.filter(student => {
    const matchesYear = !studentFilterYear || student.year === parseInt(studentFilterYear);
    const matchesCareerPath = !studentFilterCareerPath || 
      student.careerPaths.some(cp => cp.careerPath.name.toLowerCase().includes(studentFilterCareerPath.toLowerCase()));
    return matchesYear && matchesCareerPath;
  });

  // Get unique values for filter dropdowns
  const uniqueYears = [...new Set(roadmaps.map(r => r.year))].sort();
  const uniqueCareerPaths = [...new Set(roadmaps.map(r => r.careerPath))].sort();
  const uniqueDepartments = departments.map(d => d.name).sort();  // Fixed
  
  // Get unique years and career paths for assignment filters
  const uniqueStudentYears = [...new Set(students.map(s => s.year))].sort();
  const uniqueStudentCareerPaths = [...new Set(students.flatMap(s => s.careerPaths.map(cp => cp.careerPath.name)))].sort();
  
  // Get unique values for assignment filters
  const uniqueAssignmentDepartments = [...new Set(assignments.map(a => a.student?.department?.name))].filter(Boolean).sort();
  const uniqueAssignmentYears = [...new Set(assignments.map(a => a.student?.year))].filter(Boolean).sort();
  const uniqueAssignmentCareerPaths = [...new Set(assignments.map(a => a.roadmap.careerPath))].sort();
  const uniqueAssignmentRoadmaps = [...new Set(assignments.map(a => a.roadmap.title))].sort();
  
  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignmentSearchTerm === '' || 
      assignment.student?.name.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
      assignment.student?.email.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
      assignment.roadmap.title.toLowerCase().includes(assignmentSearchTerm.toLowerCase());
    
    const matchesDepartment = assignmentFilterDepartment === '' || 
      assignment.student?.department?.name === assignmentFilterDepartment;
    
    const matchesYear = assignmentFilterYear === '' || 
      assignment.student?.year?.toString() === assignmentFilterYear;
    
    const matchesCareerPath = assignmentFilterCareerPath === '' || 
      assignment.roadmap.careerPath === assignmentFilterCareerPath;
    
    const matchesRoadmap = assignmentFilterRoadmap === '' || 
      assignment.roadmap.title === assignmentFilterRoadmap;
    
    return matchesSearch && matchesDepartment && matchesYear && matchesCareerPath && matchesRoadmap;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Management</h1>
          <p className="text-gray-600">Create, manage, and assign learning roadmaps using AI generation or manual creation</p>
        </div>

        {/* Action Bar */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roadmap Management</CardTitle>
                <p className="text-sm text-gray-500">Create, view, and manage learning roadmaps</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    window.location.href = '/faculty/roadmap-creator?tab=ai';
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  AI Generation
                </Button>
                <Button 
                  onClick={() => {
                    window.location.href = '/faculty/roadmap-creator?tab=manual';
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Manual Creation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <input
                  id="search"
                  placeholder="Search roadmaps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="year">Filter by Year</Label>
                <select
                  id="year"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="careerPath">Filter by Career Path</Label>
                <select
                  id="careerPath"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterCareerPath}
                  onChange={(e) => setFilterCareerPath(e.target.value)}
                >
                  <option value="">All Career Paths</option>
                  {uniqueCareerPaths.map(careerPath => (
                    <option key={careerPath} value={careerPath}>{careerPath}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="department">Filter by Department</Label>
                <select
                  id="department"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Management Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roadmap Assignments</CardTitle>
                <p className="text-sm text-gray-500">Manage which students have access to which roadmaps</p>
              </div>
              <Button 
                onClick={() => setShowAssignments(!showAssignments)}
                variant="outline"
              >
                {showAssignments ? 'Hide' : 'View'} Assignments ({assignments.length})
              </Button>
            </div>
          </CardHeader>
          {showAssignments && (
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                  <p className="text-gray-600 mb-4">Assign roadmaps to students to see them here.</p>
                  <p className="text-sm text-gray-500">
                    Use the "Assign to Students" button on any roadmap to get started.
                  </p>
                </div>
              ) : (
                <>
                  {/* Assignment Filters */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Filter Assignments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="assignment-search">Search</Label>
                        <input
                          id="assignment-search"
                          placeholder="Search assignments..."
                          value={assignmentSearchTerm}
                          onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="assignment-department">Department</Label>
                        <select
                          id="assignment-department"
                          value={assignmentFilterDepartment}
                          onChange={(e) => setAssignmentFilterDepartment(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">All Departments</option>
                          {uniqueAssignmentDepartments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="assignment-year">Year</Label>
                        <select
                          id="assignment-year"
                          value={assignmentFilterYear}
                          onChange={(e) => setAssignmentFilterYear(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">All Years</option>
                          {uniqueAssignmentYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="assignment-career-path">Career Path</Label>
                        <select
                          id="assignment-career-path"
                          value={assignmentFilterCareerPath}
                          onChange={(e) => setAssignmentFilterCareerPath(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">All Career Paths</option>
                          {uniqueAssignmentCareerPaths.map((careerPath) => (
                            <option key={careerPath} value={careerPath}>{careerPath}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="assignment-roadmap">Roadmap</Label>
                        <select
                          id="assignment-roadmap"
                          value={assignmentFilterRoadmap}
                          onChange={(e) => setAssignmentFilterRoadmap(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">All Roadmaps</option>
                          {uniqueAssignmentRoadmaps.map((roadmap) => (
                            <option key={roadmap} value={roadmap}>{roadmap}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing {filteredAssignments.length} of {assignments.length} assignments
                      </div>
                      <Button
                        onClick={() => {
                          setAssignmentSearchTerm('');
                          setAssignmentFilterDepartment('');
                          setAssignmentFilterYear('');
                          setAssignmentFilterCareerPath('');
                          setAssignmentFilterRoadmap('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>

                  {/* Assignments List */}
                  <div className="space-y-4">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Match Filters</h3>
                        <p className="text-gray-600">Try adjusting your filter criteria.</p>
                      </div>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{assignment.roadmap.title}</h4>
                              <p className="text-sm text-gray-600">
                                Assigned to: {assignment.student?.name} ({assignment.student?.email})
                              </p>
                              <p className="text-xs text-gray-500">
                                Assigned on: {new Date(assignment.assignedAt).toLocaleDateString()}
                              </p>
                              {assignment.notes && (
                                <p className="text-sm text-gray-600 mt-1">Notes: {assignment.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Progress: {assignment.progress}%
                              </span>
                              <Button
                                onClick={() => removeAssignment(assignment.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* Roadmaps Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roadmaps...</p>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Roadmaps Found</h3>
              <p className="text-gray-600 mb-6">
                {roadmaps.length === 0 
                  ? "You haven't created any roadmaps yet. Create your first learning roadmap using AI generation or manual creation!"
                  : "No roadmaps match your current filters. Try adjusting your search criteria."}
              </p>
              {roadmaps.length === 0 && (
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      window.location.href = '/faculty/roadmap-creator?tab=ai';
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    AI Generation
                  </Button>
                  <Button 
                    onClick={() => {
                      window.location.href = '/faculty/roadmap-creator?tab=manual';
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Manual Creation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader 
                  className="pb-3"
                  onClick={() => handleViewRoadmap(roadmap.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold line-clamp-2">{roadmap.title}</h3>
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {roadmap.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent 
                  className="pt-0"
                  onClick={() => handleViewRoadmap(roadmap.id)}
                >
                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        Year {roadmap.year}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {roadmap.careerPath}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {roadmap.department}
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {roadmap.studentLevel}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⏱️</span>
                      <span>{roadmap.totalDuration}</span>
                    </div>

                    {/* Created info */}
                    <div className="text-xs text-gray-500">
                      Created by {roadmap.createdBy?.firstName || 'Unknown'} {roadmap.createdBy?.lastName || 'User'}
                      <br />
                      {new Date(roadmap.createdAt).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRoadmap(roadmap.id);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoadmap(roadmap);
                        }}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignRoadmap(roadmap);
                        }}
                        className="bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        Assign
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this roadmap?')) {
                            handleDeleteRoadmap(roadmap.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


        {/* Roadmap Display Modal */}
        {showRoadmapDisplay && selectedRoadmap && (
          <RoadmapDisplay
            roadmap={selectedRoadmap}
            onClose={() => {
              setShowRoadmapDisplay(false);
              setSelectedRoadmap(null);
            }}
            onDelete={(roadmapId) => {
              setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
              setShowRoadmapDisplay(false);
              setSelectedRoadmap(null);
            }}
          />
        )}

        {/* Roadmap Assignment Modal */}
        {showAssignmentModal && selectedRoadmapForAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Assign Roadmap to Students</h3>
                    <p className="text-gray-600 mt-1">
                      Assign "{selectedRoadmapForAssignment.title}" to your students
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignmentModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Student Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="studentYear">Filter by Year</Label>
                    <select
                      id="studentYear"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={studentFilterYear}
                      onChange={(e) => setStudentFilterYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      {uniqueStudentYears.map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="studentCareerPath">Filter by Career Path</Label>
                    <select
                      id="studentCareerPath"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={studentFilterCareerPath}
                      onChange={(e) => setStudentFilterCareerPath(e.target.value)}
                    >
                      <option value="">All Career Paths</option>
                      {uniqueStudentCareerPaths.map(careerPath => (
                        <option key={careerPath} value={careerPath}>{careerPath}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Student Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      Select Students ({selectedStudents.length} selected)
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(filteredStudents.map(s => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                        Select All ({filteredStudents.length})
                      </label>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No students match the current filters
                      </div>
                    ) : (
                      <div className="space-y-2 p-2">
                        {filteredStudents.map(student => (
                          <div
                            key={student.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedStudents.includes(student.id)
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleStudentSelection(student.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-600">
                                {student.email} • Year {student.year} • {student.registerNumber}
                              </div>
                              {student.careerPaths.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Career Paths: {student.careerPaths.map(cp => cp.careerPath.name).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAssignToStudents}
                    disabled={selectedStudents.length === 0 || isAssigning}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isAssigning ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📚</span>
                        Assign to {selectedStudents.length} Student(s)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}