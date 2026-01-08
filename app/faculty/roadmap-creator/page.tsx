'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
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
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import RoadmapDisplay from '@/components/learning/RoadmapDisplay';

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
}

interface Department {
  id: number;
  name: string;
}

interface SemesterActivity {
  id: string;
  title: string;
  description: string;
  timeline: string;
  timelineFrom?: string; // Start date for timeline
  timelineTo?: string;   // End date for timeline
  timelineType?: 'single' | 'range'; // Timeline type: single date or date range
  tool?: string;
  link?: string;
  outcome: string;
  skills?: string; // Skills/topics covered in this activity
  category: 'technical-skills' | 'core-engineering' | 'online-courses' | 'workshops' | 'competitions' | 'internships' | 'mini-projects' | 'alumni-interaction' | 'assessment' | 'profile-building';
}

interface Semester {
  id: string;
  number: number;
  title: string;
  description: string;
  activities: SemesterActivity[];
  isExpanded: boolean;
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

export default function RoadmapCreator() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  
  const [roadmap, setRoadmap] = useState<Roadmap>({
    title: '',
    description: '',
    careerPath: '',
    department: '',
    year: 1,
    totalDuration: '',
    semesters: []
  });
  
  const [isEditMode, setIsEditMode] = useState(false);

  const [availableCareerPaths, setAvailableCareerPaths] = useState<CareerPath[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showSemesterSelector, setShowSemesterSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Generation states
  const [showRoadmapDisplay, setShowRoadmapDisplay] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    year: '',
    careerPath: '',
    department: '',
    studentLevel: 'beginner'
  });

  useEffect(() => {
    fetchData();
    
    // Check URL parameters for tab selection
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'ai' || tab === 'manual') {
      setActiveTab(tab);
    }
    
    // Check if we're in edit mode
    if (editId) {
      setIsEditMode(true);
      loadRoadmapForEdit(editId);
    }
  }, [editId]);

  const fetchData = async () => {
    try {
      const [careerResponse, departmentResponse] = await Promise.all([
        api.get('/career-path'),
        api.get('/department')
      ]);
      
      setAvailableCareerPaths(careerResponse.data || []);
      setAvailableDepartments(departmentResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch required data');
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmapForEdit = async (roadmapId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/learning/roadmap/${roadmapId}`);
      
      if (response.data.roadmap) {
        const roadmapData = response.data.roadmap;
        
        // Handle milestones (semesters) - could be string or already parsed
        const semesters = roadmapData.milestones 
          ? (typeof roadmapData.milestones === 'string' 
              ? JSON.parse(roadmapData.milestones) 
              : roadmapData.milestones)
          : [];
        
        setRoadmap({
          title: roadmapData.title,
          description: roadmapData.description,
          careerPath: roadmapData.careerPath,
          department: roadmapData.department,
          year: roadmapData.year,
          totalDuration: roadmapData.totalDuration,
          semesters: semesters
        });
        
        toast.success('Roadmap loaded for editing');
      }
    } catch (error) {
      console.error('Error loading roadmap for edit:', error);
      toast.error('Failed to load roadmap for editing');
    } finally {
      setLoading(false);
    }
  };

  const addSemester = (semesterNumber: number) => {
    const year = Math.ceil(semesterNumber / 2);
    const semesterType = semesterNumber % 2 === 0 ? 'Even Sem' : 'Odd Sem';
    const semesterTitle = `Semester ${semesterNumber} (Year ${year} - ${semesterType})`;
    
    const newSemester: Semester = {
      id: `semester-${Date.now()}`,
      number: semesterNumber,
      title: semesterTitle,
      description: '',
      activities: [],
      isExpanded: true
    };
    
    setRoadmap(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester]
    }));
  };

  const generatePreview = () => {
    if (!roadmap.title || !roadmap.careerPath || !roadmap.department) {
      toast.error('Please fill in all required fields before previewing');
      return;
    }
    setShowPreview(true);
  };

  const exportRoadmap = () => {
    if (!roadmap.title || !roadmap.careerPath || !roadmap.department) {
      toast.error('Please fill in all required fields before exporting');
      return;
    }

    const exportData = {
      title: roadmap.title,
      description: roadmap.description,
      careerPath: roadmap.careerPath,
      department: roadmap.department,
      year: roadmap.year,
      totalDuration: roadmap.totalDuration,
      semesters: roadmap.semesters.map(semester => ({
        title: semester.title,
        description: semester.description,
        activities: semester.activities.map(activity => ({
          title: activity.title,
          description: activity.description,
          category: activity.category,
          timeline: activity.timeline,
          timelineFrom: activity.timelineFrom,
          timelineTo: activity.timelineTo,
          timelineType: activity.timelineType,
          tool: activity.tool,
          link: activity.link,
          outcome: activity.outcome,
          skills: activity.skills
        }))
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roadmap.title.replace(/\s+/g, '_')}_roadmap.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Roadmap exported successfully!');
  };

  const updateSemester = (semesterId: string, updates: Partial<Semester>) => {
    setRoadmap(prev => ({
      ...prev,
      semesters: prev.semesters.map(sem => 
        sem.id === semesterId ? { ...sem, ...updates } : sem
      )
    }));
  };

  const deleteSemester = (semesterId: string) => {
    setRoadmap(prev => ({
      ...prev,
      semesters: prev.semesters.filter(sem => sem.id !== semesterId)
        .map((sem, index) => ({ ...sem, number: index + 1 }))
    }));
  };

  const addActivity = (semesterId: string, category: SemesterActivity['category']) => {
    const newActivity: SemesterActivity = {
      id: `activity-${Date.now()}`,
      title: '',
      description: '',
      timeline: (category === 'technical-skills' || category === 'core-engineering') ? '' : '', // No timeline for technical skills and core engineering
      timelineFrom: '',
      timelineTo: '',
      timelineType: 'single',
      tool: '',
      link: '',
      outcome: '',
      skills: '',
      category
    };

    updateSemester(semesterId, {
      activities: [...roadmap.semesters.find(s => s.id === semesterId)?.activities || [], newActivity]
    });
    
    // Automatically start editing the new activity
    setEditingActivity(newActivity.id);
  };

  const updateActivity = (semesterId: string, activityId: string, updates: Partial<SemesterActivity>) => {
    setRoadmap(prev => ({
      ...prev,
      semesters: prev.semesters.map(sem => 
        sem.id === semesterId 
          ? {
              ...sem,
              activities: sem.activities.map(activity =>
                activity.id === activityId ? { ...activity, ...updates } : activity
              )
            }
          : sem
      )
    }));
  };

  const deleteActivity = (semesterId: string, activityId: string) => {
    setRoadmap(prev => ({
      ...prev,
      semesters: prev.semesters.map(sem => 
        sem.id === semesterId 
          ? {
              ...sem,
              activities: sem.activities.filter(activity => activity.id !== activityId)
            }
          : sem
      )
    }));
  };

  const toggleSemesterExpansion = (semesterId: string) => {
    updateSemester(semesterId, { isExpanded: !roadmap.semesters.find(s => s.id === semesterId)?.isExpanded });
  };

  const handleAIInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAiFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiFormData.year || !aiFormData.careerPath || !aiFormData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/learning/roadmap', aiFormData);
      
      if (response.data.success) {
        toast.success('Roadmap generated successfully!');
        setSelectedRoadmap(response.data.roadmap);
        setShowRoadmapDisplay(true);
      } else {
        toast.error('Failed to generate roadmap');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap', {
        description: error.response?.data?.error || 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // Debug authentication
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('localStorage access_token:', localStorage.getItem('access_token') ? 'Found' : 'Not found');
    console.log('Document cookies:', document.cookie);
    console.log('Is authenticated check:', typeof window !== 'undefined' ? 'Window available' : 'No window');
    
    // Additional debugging for edit mode
    if (isEditMode && editId) {
      console.log('=== EDIT MODE DEBUG ===');
      console.log('Edit ID:', editId);
      console.log('Roadmap data being sent:', {
        title: roadmap.title,
        careerPath: roadmap.careerPath,
        department: roadmap.department,
        year: roadmap.year,
        totalDuration: roadmap.totalDuration,
        semestersCount: roadmap.semesters.length
      });
    }
    
    if (!roadmap.title || !roadmap.careerPath || !roadmap.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (roadmap.semesters.length === 0) {
      toast.error('Please add at least one semester');
      return;
    }

    setSaving(true);
    try {
      let response;
      
      if (isEditMode && editId) {
        // Update existing roadmap
        console.log('Updating roadmap with ID:', editId);
        response = await api.put(`/learning/roadmap/${editId}`, roadmap);
        
        if (response.data.success) {
          toast.success('Roadmap updated successfully!');
          // Redirect to learning management to see the updated roadmap
          window.location.href = '/faculty/learning-management';
        } else {
          toast.error('Failed to update roadmap');
        }
      } else {
        // Create new roadmap
        console.log('Creating new roadmap');
        response = await api.post('/learning/roadmap/manual', roadmap);
        
        if (response.data.success) {
          toast.success('Roadmap created successfully!');
          console.log('Roadmap created with ID:', response.data.roadmap?.id);
          
          // Reset form
          setRoadmap({
            title: '',
            description: '',
            careerPath: '',
            department: '',
            year: 1,
            totalDuration: '',
            semesters: []
          });
          
          // Redirect to learning management to see the created roadmap
          window.location.href = '/faculty/learning-management';
        } else {
          console.log('Response success is false:', response.data);
          toast.error('Failed to create roadmap');
        }
      }
    } catch (error: any) {
      console.error('Error creating/updating roadmap:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Full error object:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('Access Denied', {
          description: error.response?.data?.message || 'You do not have permission to edit this roadmap. You can only edit roadmaps you created.'
        });
      } else if (error.response?.status === 401) {
        toast.error('Authentication Failed', {
          description: 'Please log in again to continue.'
        });
      } else {
        toast.error('Failed to save roadmap', {
          description: error.response?.data?.error || error.response?.data?.details || error.message || 'Unknown error'
        });
      }
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading roadmap creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Roadmap' : 'Learning Roadmap Creator'}
          </h1>
          <p className="text-gray-600 mt-2">Create comprehensive learning roadmaps for career paths</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={generatePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={exportRoadmap}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="ai">AI Generation</TabsTrigger>
        </TabsList>

        {/* Manual Creation Tab */}
        <TabsContent value="manual" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Roadmap Title *</Label>
                  <Input
                    id="title"
                    value={roadmap.title}
                    onChange={(e) => setRoadmap(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., ML Engineer Learning Path"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Academic Year *</Label>
                  <select
                    id="year"
                    value={roadmap.year}
                    onChange={(e) => setRoadmap(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="border rounded h-10 px-3 w-full bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={roadmap.description}
                  onChange={(e) => setRoadmap(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the learning roadmap..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="careerPath">Career Path *</Label>
                  <select
                    id="careerPath"
                    value={roadmap.careerPath}
                    onChange={(e) => setRoadmap(prev => ({ ...prev, careerPath: e.target.value }))}
                    className="border rounded h-10 px-3 w-full bg-white"
                  >
                    <option value="">Select Career Path</option>
                    {availableCareerPaths.map((careerPath) => (
                      <option key={careerPath.id} value={careerPath.name}>
                        {careerPath.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    value={roadmap.department}
                    onChange={(e) => setRoadmap(prev => ({ ...prev, department: e.target.value }))}
                    className="border rounded h-10 px-3 w-full bg-white"
                  >
                    <option value="">All Departments</option>
                    {availableDepartments.map((department) => (
                      <option key={department.id} value={department.name}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalDuration">Total Duration</Label>
                  <Input
                    id="totalDuration"
                    value={roadmap.totalDuration}
                    onChange={(e) => setRoadmap(prev => ({ ...prev, totalDuration: e.target.value }))}
                    placeholder="e.g., 4 years, 8 semesters"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semesters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Semester-wise Learning Plan</CardTitle>
                <Button onClick={() => setShowSemesterSelector(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Semester
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roadmap.semesters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No semesters added yet. Click "Add Semester" to select from 8 semesters (4 years).</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roadmap.semesters.map((semester) => (
                    <Card key={semester.id} className="border-l-4 border-l-blue-500">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSemesterExpansion(semester.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {semester.isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <h3 className="font-semibold text-lg">{semester.title}</h3>
                              <p className="text-sm text-gray-600">{semester.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{semester.activities.length} activities</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSemester(semester.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSemester(semester.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {semester.isExpanded && (
                          <div className="space-y-4">
                            {/* Semester Details Editor */}
                            {editingSemester === semester.id && (
                              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                  <Label>Semester Title</Label>
                                  <Input
                                    value={semester.title}
                                    onChange={(e) => updateSemester(semester.id, { title: e.target.value })}
                                    placeholder="e.g., Foundation Semester"
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={semester.description}
                                    onChange={(e) => updateSemester(semester.id, { description: e.target.value })}
                                    placeholder="Describe this semester's focus..."
                                    rows={2}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingSemester(null)}
                                  >
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingSemester(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Activity Categories */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {Object.entries(categoryLabels).map(([key, label]) => {
                                const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
                                const activities = semester.activities.filter(a => a.category === key);
                                
                                return (
                                  <div key={key} className="border rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <IconComponent className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium">{label}</span>
                                    </div>
                                    <div className="space-y-2">
                                      {activities.map((activity) => (
                                        <div key={activity.id} className="bg-white p-2 rounded border text-xs">
                                          <div className="font-medium truncate">{activity.title || 'Untitled'}</div>
                                          <div className="text-gray-500 truncate">{activity.timeline || 'No timeline'}</div>
                                        </div>
                                      ))}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() => addActivity(semester.id, key as SemesterActivity['category'])}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add {label}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Activities List */}
                            {semester.activities.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium">All Activities</h4>
                                {semester.activities.map((activity) => (
                                  <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                                    {editingActivity === activity.id ? (
                                      <ActivityEditor
                                        activity={activity}
                                        onSave={(updates) => {
                                          updateActivity(semester.id, activity.id, updates);
                                          setEditingActivity(null);
                                        }}
                                        onCancel={() => setEditingActivity(null)}
                                      />
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <div 
                                          className="flex-1 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                          onClick={() => setEditingActivity(activity.id)}
                                        >
                                          <div className="flex items-center gap-2">
                                            {(() => {
                                              const IconComponent = categoryIcons[activity.category];
                                              return <IconComponent className="w-4 h-4 text-blue-600" />;
                                            })()}
                                            <span className="font-medium">{activity.title || 'Untitled Activity'}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {categoryLabels[activity.category]}
                                            </Badge>
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            {activity.description || 'No description'}
                                          </div>
                                          {activity.skills && (
                                            <div className="text-sm text-blue-600 mt-1">
                                              <strong>Skills/Topics:</strong> {activity.skills}
                                            </div>
                                          )}
                                          <div className="text-xs text-gray-500 mt-1">
                                            {activity.category !== 'technical-skills' && activity.category !== 'core-engineering' && (
                                              <span>
                                                {activity.timelineType === 'range' && activity.timelineFrom && activity.timelineTo
                                                  ? `Timeline: ${activity.timelineFrom} - ${activity.timelineTo} | `
                                                  : activity.timeline
                                                  ? `Timeline: ${activity.timeline} | `
                                                  : 'Timeline: Not specified | '
                                                }
                                              </span>
                                            )}
                                            Tool: {activity.tool || 'Not specified'}
                                          </div>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingActivity(activity.id)}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteActivity(semester.id, activity.id)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={handleSave} 
              disabled={saving} 
              size="lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Roadmap...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Roadmap' : 'Create Roadmap'}
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="ai">
          <div className="space-y-6">
            {/* AI Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI-Powered Roadmap Generation
                </CardTitle>
                <p className="text-gray-600">
                  Use our AI to automatically generate comprehensive learning roadmaps based on career paths and requirements.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAIGenerate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ai-year">Academic Year *</Label>
                      <select
                        id="ai-year"
                        name="year"
                        value={aiFormData.year}
                        onChange={handleAIInputChange}
                        className="border rounded h-10 px-3 w-full bg-white mt-1"
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="ai-studentLevel">Student Level</Label>
                      <select
                        id="ai-studentLevel"
                        name="studentLevel"
                        value={aiFormData.studentLevel}
                        onChange={handleAIInputChange}
                        className="border rounded h-10 px-3 w-full bg-white mt-1"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ai-careerPath">Career Path *</Label>
                    <select
                      id="ai-careerPath"
                      name="careerPath"
                      value={aiFormData.careerPath}
                      onChange={handleAIInputChange}
                      className="border rounded h-10 px-3 w-full bg-white mt-1"
                      required
                      disabled={loading}
                    >
                      <option value="">Select Career Path</option>
                      {availableCareerPaths.map((careerPath) => (
                        <option key={careerPath.id} value={careerPath.name}>
                          {careerPath.name}
                        </option>
                      ))}
                    </select>
                    {loading && (
                      <p className="text-sm text-gray-500 mt-1">Loading career paths...</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ai-department">Department *</Label>
                    <select
                      id="ai-department"
                      name="department"
                      value={aiFormData.department}
                      onChange={handleAIInputChange}
                      className="border rounded h-10 px-3 w-full bg-white mt-1"
                      required
                      disabled={loading}
                    >
                      <option value="">All Departments</option>
                      {availableDepartments.map((department) => (
                        <option key={department.id} value={department.name}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {loading && (
                      <p className="text-sm text-gray-500 mt-1">Loading departments...</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">What will be generated:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Comprehensive learning milestones</li>
                      <li>• Progressive skill development path</li>
                      <li>• Industry-relevant projects and resources</li>
                      <li>• Career outcomes and opportunities</li>
                      <li>• Time-based learning schedule</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🚀</span>
                          Generate Roadmap
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('manual')}
                      className="flex-1"
                    >
                      Switch to Manual
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Roadmap Display Modal */}
      {showRoadmapDisplay && selectedRoadmap && (
        <RoadmapDisplay
          roadmap={selectedRoadmap}
          onClose={() => {
            setShowRoadmapDisplay(false);
            setSelectedRoadmap(null);
          }}
          onDelete={(roadmapId) => {
            setShowRoadmapDisplay(false);
            setSelectedRoadmap(null);
            // Optionally refresh the page or show success message
            toast.success('Roadmap deleted successfully');
          }}
        />
      )}

      {/* Semester Selector Modal */}
      {showSemesterSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Semester to Add</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose which semester to add to your roadmap. Each year has 2 semesters.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Array.from({ length: 8 }, (_, i) => {
                const semesterNumber = i + 1;
                const year = Math.ceil(semesterNumber / 2);
                const semesterType = semesterNumber % 2 === 0 ? 'Even Sem' : 'Odd Sem';
                const isAdded = roadmap.semesters.some(s => s.number === semesterNumber);
                
                return (
                  <button
                    key={semesterNumber}
                    onClick={() => {
                      if (!isAdded) {
                        addSemester(semesterNumber);
                        setShowSemesterSelector(false);
                      }
                    }}
                    disabled={isAdded}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      isAdded 
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Semester {semesterNumber}</div>
                      <div className="text-xs text-gray-600">Year {year} - {semesterType}</div>
                      {isAdded && <div className="text-xs text-green-600 mt-1">✓ Added</div>}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSemesterSelector(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Roadmap Preview</h3>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{roadmap.title}</h2>
                <p className="text-gray-600 mt-2">{roadmap.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span><strong>Career Path:</strong> {roadmap.careerPath}</span>
                  <span><strong>Department:</strong> {roadmap.department}</span>
                  <span><strong>Year:</strong> {roadmap.year}</span>
                  {roadmap.totalDuration && <span><strong>Duration:</strong> {roadmap.totalDuration}</span>}
                </div>
              </div>

              {roadmap.semesters.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Semester-wise Learning Plan</h3>
                  {roadmap.semesters.map((semester) => (
                    <div key={semester.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2">{semester.title}</h4>
                      {semester.description && (
                        <p className="text-gray-600 mb-3">{semester.description}</p>
                      )}
                      
                      {semester.activities.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium">Activities:</h5>
                          <div className="grid gap-3">
                            {semester.activities.map((activity) => (
                              <div key={activity.id} className="bg-gray-50 p-3 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  {(() => {
                                    const IconComponent = categoryIcons[activity.category];
                                    return <IconComponent className="w-4 h-4 text-blue-600" />;
                                  })()}
                                  <span className="font-medium">{activity.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {categoryLabels[activity.category]}
                                  </Badge>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                )}
                                {activity.skills && (
                                  <div className="text-sm text-blue-600 mb-2">
                                    <strong>Skills/Topics:</strong> {activity.skills}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {activity.category !== 'technical-skills' && activity.category !== 'core-engineering' && (
                                    <span>
                                      {activity.timelineType === 'range' && activity.timelineFrom && activity.timelineTo
                                        ? `Timeline: ${activity.timelineFrom} - ${activity.timelineTo} | `
                                        : activity.timeline
                                        ? `Timeline: ${activity.timeline} | `
                                        : 'Timeline: Not specified | '
                                      }
                                    </span>
                                  )}
                                  {activity.tool && <span>Tool: {activity.tool} | </span>}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No semesters added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Activity Editor Component
interface ActivityEditorProps {
  activity: SemesterActivity;
  onSave: (updates: Partial<SemesterActivity>) => void;
  onCancel: () => void;
}

function ActivityEditor({ activity, onSave, onCancel }: ActivityEditorProps) {
  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description,
    timeline: activity.timeline,
    timelineFrom: activity.timelineFrom || '',
    timelineTo: activity.timelineTo || '',
    timelineType: activity.timelineType || 'single',
    tool: activity.tool || '',
    link: activity.link || '',
    outcome: activity.outcome,
    skills: activity.skills || ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  const isTechnicalSkills = activity.category === 'technical-skills';

  return (
    <div className="space-y-3">
      <div>
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={isTechnicalSkills ? "e.g., Python Programming" : "Activity title"}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={isTechnicalSkills ? "Describe the technical skill requirement..." : "Describe the activity..."}
          rows={2}
        />
      </div>
      
      {!isTechnicalSkills && activity.category !== 'core-engineering' && (
        <div className="space-y-4">
          <div>
            <Label>Timeline Type</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timelineType"
                  value="single"
                  checked={formData.timelineType === 'single'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timelineType: e.target.value as 'single' | 'range' }))}
                />
                <span className="text-sm">Single Date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timelineType"
                  value="range"
                  checked={formData.timelineType === 'range'}
                  onChange={(e) => setFormData(prev => ({ ...prev, timelineType: e.target.value as 'single' | 'range' }))}
                />
                <span className="text-sm">Date Range (From - To)</span>
              </label>
            </div>
          </div>

          {formData.timelineType === 'single' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Timeline *</Label>
                <div className="flex gap-2">
                  <select
                    value={formData.timeline.split(' ')[0] || ''}
                    onChange={(e) => {
                      const month = e.target.value;
                      const year = formData.timeline.split(' ')[1] || new Date().getFullYear().toString();
                      setFormData(prev => ({ ...prev, timeline: `${month} ${year}` }));
                    }}
                    className="border rounded h-10 px-3 w-full bg-white"
                  >
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <select
                    value={formData.timeline.split(' ')[1] || ''}
                    onChange={(e) => {
                      const year = e.target.value;
                      const month = formData.timeline.split(' ')[0] || '';
                      setFormData(prev => ({ ...prev, timeline: `${month} ${year}` }));
                    }}
                    className="border rounded h-10 px-3 w-full bg-white"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year.toString()}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div>
                <Label>Tool/Platform</Label>
                <Input
                  value={formData.tool}
                  onChange={(e) => setFormData(prev => ({ ...prev, tool: e.target.value }))}
                  placeholder="e.g., Coursera, GitHub"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>From *</Label>
                  <div className="flex gap-2">
                    <select
                      value={formData.timelineFrom.split(' ')[0] || ''}
                      onChange={(e) => {
                        const month = e.target.value;
                        const year = formData.timelineFrom.split(' ')[1] || new Date().getFullYear().toString();
                        setFormData(prev => ({ ...prev, timelineFrom: `${month} ${year}` }));
                      }}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                    <select
                      value={formData.timelineFrom.split(' ')[1] || ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        const month = formData.timelineFrom.split(' ')[0] || '';
                        setFormData(prev => ({ ...prev, timelineFrom: `${month} ${year}` }));
                      }}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return <option key={year} value={year.toString()}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>To *</Label>
                  <div className="flex gap-2">
                    <select
                      value={formData.timelineTo.split(' ')[0] || ''}
                      onChange={(e) => {
                        const month = e.target.value;
                        const year = formData.timelineTo.split(' ')[1] || new Date().getFullYear().toString();
                        setFormData(prev => ({ ...prev, timelineTo: `${month} ${year}` }));
                      }}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                    <select
                      value={formData.timelineTo.split(' ')[1] || ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        const month = formData.timelineTo.split(' ')[0] || '';
                        setFormData(prev => ({ ...prev, timelineTo: `${month} ${year}` }));
                      }}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return <option key={year} value={year.toString()}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Label>Tool/Platform</Label>
                <Input
                  value={formData.tool}
                  onChange={(e) => setFormData(prev => ({ ...prev, tool: e.target.value }))}
                  placeholder="e.g., Coursera, GitHub"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {(isTechnicalSkills || activity.category === 'core-engineering') && (
        <div>
          <Label>Tool/Platform</Label>
          <Input
            value={formData.tool}
            onChange={(e) => setFormData(prev => ({ ...prev, tool: e.target.value }))}
            placeholder={isTechnicalSkills ? "e.g., Python, JavaScript, React" : "e.g., Problem Solving, Critical Thinking"}
          />
        </div>
      )}

      {/* Skills/Topics field for specific categories */}
      {(activity.category === 'online-courses' || 
        activity.category === 'workshops' || 
        activity.category === 'competitions' || 
        activity.category === 'internships' || 
        activity.category === 'mini-projects' || 
        activity.category === 'alumni-interaction' || 
        activity.category === 'assessment' || 
        activity.category === 'profile-building') && (
        <div>
          <Label>Skills/Topics Covered</Label>
          <Textarea
            value={formData.skills}
            onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
            placeholder={
              activity.category === 'online-courses' ? "e.g., Machine Learning, Data Analysis, Python Programming" :
              activity.category === 'workshops' ? "e.g., React Development, UI/UX Design, Agile Methodology" :
              activity.category === 'competitions' ? "e.g., Algorithm Design, Problem Solving, Team Collaboration" :
              activity.category === 'internships' ? "e.g., Software Development, Project Management, Industry Tools" :
              activity.category === 'mini-projects' ? "e.g., Full-stack Development, Database Design, API Integration" :
              activity.category === 'alumni-interaction' ? "e.g., Career Guidance, Industry Insights, Networking Skills" :
              activity.category === 'assessment' ? "e.g., Technical Skills, Soft Skills, Domain Knowledge" :
              "e.g., Portfolio Development, Resume Building, Professional Branding"
            }
            rows={2}
          />
        </div>
      )}

      <div>
        <Label>Link (Optional)</Label>
        <Input
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Expected Outcome</Label>
        <Textarea
          value={formData.outcome}
          onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
          placeholder={isTechnicalSkills ? "What technical skills will students gain?" : "What will students achieve?"}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
