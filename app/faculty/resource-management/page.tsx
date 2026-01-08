'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface LearningResource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  difficulty: string;
  careerPath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roadmap?: {
    id: number;
    title: string;
    department: string;
  };
  studentAccess: {
    id: number;
    studentId: number;
    accessedAt: string;
    isCompleted: boolean;
    rating?: number;
    student: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

interface Student {
  id: number;
  email: string;
  name: string;
  department: {
    id: number;
    name: string;
  };
  year: number;
  careerPaths: {
    careerPath: {
      id: number;
      name: string;
    };
  }[];
}

interface Faculty {
  id: number;
  name: string;
  department: string;
  assignedCareerPaths: string[];
}

interface CareerPath {
  id: number;
  name: string;
  description?: string;
}

export default function ResourceManagementPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [availableCareerPaths, setAvailableCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCareerPath, setFilterCareerPath] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  
  // Student filter states
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterDepartment, setStudentFilterDepartment] = useState('');
  const [studentFilterYear, setStudentFilterYear] = useState('');
  const [studentFilterCareerPath, setStudentFilterCareerPath] = useState('');
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    careerPath: '',
    assignToStudents: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Programming',
    'Career Development',
    'Documentation',
    'Tools & Technologies',
    'Soft Skills',
    'Industry Knowledge',
    'Certification',
    'Project-Based Learning'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/faculty/learning-resources');
      setResources(response.data.learningResources || []);
      setStudents(response.data.students || []);
      setFaculty(response.data.faculty);
      setAvailableCareerPaths(response.data.availableCareerPaths || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.careerPath.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || resource.category === filterCategory;
    const matchesCareerPath = !filterCareerPath || resource.careerPath === filterCareerPath;
    const matchesDifficulty = !filterDifficulty || resource.difficulty === filterDifficulty;

    return matchesSearch && matchesCategory && matchesCareerPath && matchesDifficulty;
  });

  const handleCreateResource = async () => {
    if (!formData.title || !formData.description || !formData.url || !formData.category || !formData.careerPath) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        action: 'create',
        ...formData,
        studentIds: formData.assignToStudents ? selectedStudents : []
      };

      await api.post('/faculty/learning-resources', payload);
      
      toast.success('Learning resource created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create learning resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignResource = async () => {
    if (!selectedResource || selectedStudents.length === 0) {
      toast.error('Please select students to assign the resource to');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/faculty/learning-resources', {
        action: 'assign',
        resourceId: selectedResource.id,
        studentIds: selectedStudents
      });
      
      toast.success(`Resource assigned to ${selectedStudents.length} student(s)`);
      setShowAssignModal(false);
      setSelectedResource(null);
      resetStudentFilters();
      fetchData();
    } catch (error: any) {
      console.error('Error assigning resource:', error);
      toast.error('Failed to assign resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResourceStatus = async (resourceId: number, currentStatus: boolean) => {
    try {
      await api.put('/faculty/learning-resources', {
        resourceId,
        isActive: !currentStatus
      });
      
      toast.success(`Resource ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating resource status:', error);
      toast.error('Failed to update resource status');
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/faculty/learning-resources?resourceId=${resourceId}`);
      toast.success('Resource deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: '',
      difficulty: 'beginner',
      careerPath: '',
      assignToStudents: false
    });
    setSelectedStudents([]);
    setSelectAllStudents(false);
    setStudentSearchTerm('');
    setStudentFilterDepartment('');
    setStudentFilterYear('');
    setStudentFilterCareerPath('');
  };

  const resetStudentFilters = () => {
    setStudentSearchTerm('');
    setStudentFilterDepartment('');
    setStudentFilterYear('');
    setStudentFilterCareerPath('');
    setSelectAllStudents(false);
    setSelectedStudents([]);
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  // Filter students by career path for assignment
  const getFilteredStudentsForAssignment = () => {
    if (!selectedResource) return students;
    
    return students.filter(student => 
      student.careerPaths.some(cp => 
        cp.careerPath.name.toLowerCase() === selectedResource.careerPath.toLowerCase()
      )
    );
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
      
      const matchesDepartment = !studentFilterDepartment || student.department?.name === studentFilterDepartment;
      const matchesYear = !studentFilterYear || student.year.toString() === studentFilterYear;
      const matchesCareerPath = !studentFilterCareerPath || 
        student.careerPaths.some(cp => cp.careerPath.name === studentFilterCareerPath);
      
      return matchesSearch && matchesDepartment && matchesYear && matchesCareerPath;
    });
  };

  const handleSelectAllStudents = (checked: boolean) => {
    setSelectAllStudents(checked);
    if (checked) {
      const filteredStudents = getFilteredStudents();
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading learning resources...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resource Management</h1>
          <p className="text-gray-600">
            Create and assign learning resources to students based on their career paths
          </p>
          {faculty && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">Department: {faculty.department}</span>
              {faculty.assignedCareerPaths.length > 0 ? (
                faculty.assignedCareerPaths.map(path => (
                  <span key={path} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">{path}</span>
                ))
              ) : (
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">All Career Paths</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowCreateModal(true)}>
                  📚 Create Learning Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Learning Resource</DialogTitle>
                  <DialogDescription>
                    Add a new learning resource and optionally assign it to students
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter resource title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what students will learn from this resource"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/resource"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="careerPath">Career Path *</Label>
                    <Select value={formData.careerPath} onValueChange={(value) => setFormData(prev => ({ ...prev, careerPath: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select career path" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCareerPaths.map(careerPath => (
                          <SelectItem key={careerPath.id} value={careerPath.name}>
                            {careerPath.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assignToStudents"
                      checked={formData.assignToStudents}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, assignToStudents: !!checked }))}
                    />
                    <Label htmlFor="assignToStudents">Assign to specific students now</Label>
                  </div>
                  
                  {formData.assignToStudents && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium">Select Students</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="selectAllStudents"
                            checked={selectAllStudents}
                            onCheckedChange={handleSelectAllStudents}
                          />
                          <Label htmlFor="selectAllStudents" className="text-sm">Select All</Label>
                        </div>
                      </div>
                      
                      {/* Student Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div>
                          <Label htmlFor="studentSearch" className="text-xs">Search</Label>
                          <Input
                            id="studentSearch"
                            placeholder="Search students..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentDepartment" className="text-xs">Department</Label>
                          <Select value={studentFilterDepartment} onValueChange={setStudentFilterDepartment}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All departments</SelectItem>
                              {Array.from(new Set(students.map(s => s.department?.name).filter(Boolean))).map(dept => (
                                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="studentYear" className="text-xs">Year</Label>
                          <Select value={studentFilterYear} onValueChange={setStudentFilterYear}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All years</SelectItem>
                              {Array.from(new Set(students.map(s => s.year))).sort().map(year => (
                                <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {getFilteredStudents().length === 0 ? (
                          <p className="text-sm text-gray-500">No students found</p>
                        ) : (
                          <div className="space-y-2">
                            {getFilteredStudents().map(student => (
                              <div key={student.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`student-${student.id}`}
                                  checked={selectedStudents.includes(student.id)}
                                  onCheckedChange={(checked) => handleStudentSelection(student.id, !!checked)}
                                />
                                <Label htmlFor={`student-${student.id}`} className="text-sm">
                                  {student.name} - Year {student.year}
                                  {student.department && (
                                    <span className="text-gray-500 ml-1">({student.department.name})</span>
                                  )}
                                  {student.careerPaths.length > 0 && (
                                    <span className="text-blue-500 ml-1">
                                      [{student.careerPaths.map(cp => cp.careerPath.name).join(', ')}]
                                    </span>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateResource} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Resource'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredResources.length} resource(s) found
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="filterCategory">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filterCareerPath">Career Path</Label>
                <Select value={filterCareerPath} onValueChange={setFilterCareerPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="All career paths" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All career paths</SelectItem>
                    {availableCareerPaths.map(careerPath => (
                      <SelectItem key={careerPath.id} value={careerPath.name}>
                        {careerPath.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filterDifficulty">Difficulty</Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All difficulties</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium mb-2">No learning resources found</h3>
                  <p className="text-sm">Create your first learning resource to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map(resource => (
              <Card key={resource.id} className={`${!resource.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{resource.title}</h3>
                        {!resource.isActive && <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Inactive</span>}
                      </div>
                      <p className="mt-1 text-gray-600">
                        {resource.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{resource.category}</span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">{resource.careerPath}</span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{resource.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleResourceStatus(resource.id, resource.isActive)}
                      >
                        {resource.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Resource URL:</Label>
                      <p className="text-sm text-blue-600 break-all">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {resource.url}
                        </a>
                      </p>
                    </div>
                    
                    {resource.studentAccess.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Assigned Students ({resource.studentAccess.length}):
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {resource.studentAccess.slice(0, 5).map(access => (
                            <span 
                              key={access.id} 
                              className={`px-2 py-1 text-xs rounded ${
                                access.isCompleted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {access.student.name}
                              {access.isCompleted && ' ✓'}
                            </span>
                          ))}
                          {resource.studentAccess.length > 5 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              +{resource.studentAccess.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Assignment Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Learning Resource</DialogTitle>
              <DialogDescription>
                {selectedResource && `Assign "${selectedResource.title}" to students`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">
                    Select Students (filtered by career path: {selectedResource?.careerPath})
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAllForAssignment"
                      checked={selectAllStudents}
                      onCheckedChange={handleSelectAllStudents}
                    />
                    <Label htmlFor="selectAllForAssignment" className="text-sm">Select All</Label>
                  </div>
                </div>
                
                {/* Assignment Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <Label htmlFor="assignStudentSearch" className="text-xs">Search</Label>
                    <Input
                      id="assignStudentSearch"
                      placeholder="Search students..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignStudentDepartment" className="text-xs">Department</Label>
                    <Select value={studentFilterDepartment} onValueChange={setStudentFilterDepartment}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All departments</SelectItem>
                        {Array.from(new Set(students.map(s => s.department?.name).filter(Boolean))).map(dept => (
                          <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignStudentYear" className="text-xs">Year</Label>
                    <Select value={studentFilterYear} onValueChange={setStudentFilterYear}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All years</SelectItem>
                        {Array.from(new Set(students.map(s => s.year))).sort().map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {getFilteredStudentsForAssignment().length === 0 ? (
                    <p className="text-sm text-gray-500">No students found for this career path</p>
                  ) : (
                    <div className="space-y-2">
                      {getFilteredStudentsForAssignment().map(student => {
                        const alreadyAssigned = selectedResource?.studentAccess.some(
                          access => access.studentId === student.id
                        );
                        
                        return (
                          <div key={student.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`assign-student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(checked) => handleStudentSelection(student.id, !!checked)}
                              disabled={alreadyAssigned}
                            />
                            <Label htmlFor={`assign-student-${student.id}`} className="text-sm">
                              {student.name} - Year {student.year}
                              {student.department && (
                                <span className="text-gray-500 ml-1">({student.department.name})</span>
                              )}
                              {alreadyAssigned && <span className="text-green-600 ml-1">(Already assigned)</span>}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAssignModal(false);
                setSelectedResource(null);
                resetStudentFilters();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignResource} 
                disabled={isSubmitting || selectedStudents.length === 0}
              >
                {isSubmitting ? 'Assigning...' : `Assign to ${selectedStudents.length} student(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}