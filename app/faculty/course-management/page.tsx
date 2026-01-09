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
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  BookMarked,
  GraduationCap,
  Target,
  MapPin,
  FileText,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  maxStudents: number;
  enrolledStudents: number;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  courseType: 'online' | 'offline' | 'hybrid';
  location?: string;
  meetingLink?: string;
  isMandatory: boolean;
  assignments: Assignment[];
  createdAt: string;
  createdBy: {
    name?: string;
    email?: string;
  };
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: 'file' | 'text' | 'code' | 'quiz';
  submissions: StudentSubmission[];
}

interface StudentSubmission {
  id: number;
  studentId: number;
  studentName: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  textSubmission?: string;
}

interface CourseFilters {
  search: string;
  category: string;
  level: string;
  status: string;
  courseType: string;
  isMandatory: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    category: '',
    level: '',
    status: '',
    courseType: '',
    isMandatory: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    
    // Handle the API call with a more robust approach
    const makeApiCall = async () => {
      return new Promise((resolve) => {
        console.log('Attempting to fetch courses from /faculty/courses');
        
        api.get('/faculty/courses')
          .then((response) => {
            console.log('API response received:', response);
            resolve({ success: true, data: response });
          })
          .catch((error: any) => {
            console.log('API call failed:', error);
            console.log('Error type:', typeof error);
            console.log('Error response:', error.response);
            console.log('Error status:', error.response?.status);
            console.log('Error code:', error.code);
            resolve({ success: false, error });
          });
      });
    };

    try {
      const result: any = await makeApiCall();
      
      if (result.success && result.data.data.success) {
        // Transform the API response to match the Course interface
        const transformedCourses: Course[] = result.data.data.courses.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          category: course.category,
          maxStudents: course.maxStudents,
          enrolledStudents: course.enrolledStudents,
          status: course.status,
          startDate: course.startDate,
          endDate: course.endDate,
          courseType: course.courseType,
          location: course.location,
          meetingLink: course.meetingLink,
          isMandatory: course.isMandatory,
          assignments: course.assignments ? course.assignments.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints,
            isMandatory: assignment.isMandatory,
            submissionType: assignment.submissionType,
            submissions: assignment.submissions ? assignment.submissions.map((submission: any) => ({
              id: submission.id,
              studentId: submission.studentId,
              studentName: submission.studentName,
              submittedAt: submission.submittedAt,
              status: submission.status,
              grade: submission.grade,
              feedback: submission.feedback,
              fileUrl: submission.fileUrl,
              textSubmission: submission.textSubmission
            })) : []
          })) : [],
          createdAt: course.createdAt,
          createdBy: {
            name: course.creator?.name,
            email: course.creator?.email
          }
        }));
        setCourses(transformedCourses);
      } else if (!result.success) {
        // Handle API errors
        const error = result.error;
        if (error.response?.status === 404) {
          console.warn('API endpoint not implemented yet. Using empty state.');
          toast.info('Course management API is not yet implemented. This is a preview of the interface.');
          setCourses([]);
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          console.warn('Network error - API might not be available');
          toast.info('Course management API is not yet implemented. This is a preview of the interface.');
          setCourses([]);
        } else if (error.response?.status >= 500) {
          console.warn('Server error:', error.response?.status);
          toast.error('Server error. Please try again later.');
          setCourses([]);
        } else {
          console.warn('Error details:', error.response?.data);
          toast.error('Failed to fetch courses. Please try again later.');
          setCourses([]);
        }
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error: any) {
      console.warn('Unexpected error in fetchCourses:', error);
      toast.error('An unexpected error occurred. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setDeleting(courseId);
    try {
      const response = await api.delete(`/faculty/courses/${courseId}`);
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setCourses(prev => prev.filter(c => c.id !== courseId));
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        toast.info('Course management API is not yet implemented. This is a preview of the interface.');
      } else {
        toast.error('Failed to delete course');
      }
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = (course: Course) => {
    setSelectedCourse(course);
    setShowPreview(true);
  };

  const handleEdit = (course: Course) => {
    // Navigate to edit page with course ID
    window.location.href = `/faculty/course-management/edit/${course.id}`;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesLevel = !filters.level || course.level === filters.level;
    const matchesStatus = !filters.status || course.status === filters.status;
    const matchesCourseType = !filters.courseType || course.courseType === filters.courseType;
    const matchesMandatory = !filters.isMandatory || 
      (filters.isMandatory === 'mandatory' && course.isMandatory) ||
      (filters.isMandatory === 'optional' && !course.isMandatory);

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus && 
           matchesCourseType && matchesMandatory;
  });

  const getUniqueValues = (key: keyof Course) => {
    return [...new Set(courses.map(c => c[key]).filter(Boolean))];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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

  const getCourseTypeColor = (courseType: string) => {
    switch (courseType) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage your courses and curriculum</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/faculty/course-management/create'}
          >
            <Plus className="w-4 h-4" />
            Create New Course
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Course Type</label>
                <select
                  value={filters.courseType}
                  onChange={(e) => setFilters(prev => ({ ...prev, courseType: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Types</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mandatory</label>
                <select
                  value={filters.isMandatory}
                  onChange={(e) => setFilters(prev => ({ ...prev, isMandatory: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Courses</option>
                  <option value="mandatory">Mandatory</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookMarked className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-6">
                {courses.length === 0 
                  ? "You haven't created any courses yet. Start by creating your first course."
                  : "No courses match your current filters. Try adjusting your search criteria."
                }
              </p>
              {courses.length === 0 && (
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(course)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        disabled={deleting === course.id}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        {deleting === course.id ? (
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
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                      <Badge variant="outline" className={getCourseTypeColor(course.courseType)}>
                        {course.courseType}
                      </Badge>
                      {course.isMandatory && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          MANDATORY
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {course.instructor}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolledStudents}/{course.maxStudents} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(course.startDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Course Type specific information */}
                    {course.courseType === 'online' && course.meetingLink && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <BookOpen className="w-4 h-4" />
                        <a href={course.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Join Online Class
                        </a>
                      </div>
                    )}
                    
                    {course.courseType === 'offline' && course.location && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <MapPin className="w-4 h-4" />
                        {course.location}
                      </div>
                    )}
                    
                    {course.courseType === 'hybrid' && (
                      <div className="space-y-1">
                        {course.location && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <MapPin className="w-4 h-4" />
                            {course.location}
                          </div>
                        )}
                        {course.meetingLink && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <BookOpen className="w-4 h-4" />
                            <a href={course.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              Online Option
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assignment information */}
                    {course.assignments && course.assignments.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Assignments</span>
                          <span className="text-xs text-gray-500">{course.assignments.length} total</span>
                        </div>
                        <div className="space-y-1">
                          {course.assignments.slice(0, 2).map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 truncate">{assignment.title}</span>
                              <div className="flex items-center gap-2">
                                {assignment.isMandatory && (
                                  <Badge variant="destructive" className="text-xs px-1 py-0">M</Badge>
                                )}
                                <span className="text-gray-500">
                                  {assignment.submissions?.length || 0} submissions
                                </span>
                              </div>
                            </div>
                          ))}
                          {course.assignments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{course.assignments.length - 2} more assignments
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Created by {course.createdBy?.name} on{' '}
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(course)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/faculty/course-management/${course.id}/assignments`}
                        className="flex-1"
                      >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Assignments
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/faculty/course-management/${course.id}/students`}
                        className="flex-1"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Students
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
      {showPreview && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedCourse.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Instructor</div>
                    <div className="text-lg font-semibold">{selectedCourse.instructor}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Duration</div>
                    <div className="text-lg font-semibold">{selectedCourse.duration}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Level</div>
                    <div className="text-lg font-semibold">{selectedCourse.level}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Status</div>
                    <div className="text-lg font-semibold">{selectedCourse.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium">Course Type</div>
                    <div className="text-lg font-semibold">{selectedCourse.courseType}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Mandatory</div>
                    <div className="text-lg font-semibold">{selectedCourse.isMandatory ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <div className="text-sm text-teal-600 font-medium">Assignments</div>
                    <div className="text-lg font-semibold">{selectedCourse.assignments?.length || 0}</div>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-sm text-pink-600 font-medium">Category</div>
                    <div className="text-lg font-semibold">{selectedCourse.category}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Enrollment</div>
                    <div className="text-lg font-semibold">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents} students</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Category</div>
                    <div className="text-lg font-semibold">{selectedCourse.category}</div>
                  </div>
                </div>

                {/* Course Type specific information */}
                {selectedCourse.courseType === 'online' && selectedCourse.meetingLink && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Online Class Information</h3>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <a href={selectedCourse.meetingLink} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline font-medium">
                        Join Online Class
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedCourse.courseType === 'offline' && selectedCourse.location && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Physical Location</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">{selectedCourse.location}</span>
                    </div>
                  </div>
                )}
                
                {selectedCourse.courseType === 'hybrid' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800">Hybrid Class Information</h3>
                    <div className="space-y-2">
                      {selectedCourse.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">{selectedCourse.location}</span>
                        </div>
                      )}
                      {selectedCourse.meetingLink && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <a href={selectedCourse.meetingLink} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline font-medium">
                            Online Option Available
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Start Date</div>
                    <div className="text-lg font-semibold">{new Date(selectedCourse.startDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">End Date</div>
                    <div className="text-lg font-semibold">{new Date(selectedCourse.endDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Assignments Section */}
                {selectedCourse.assignments && selectedCourse.assignments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Course Assignments</h3>
                    <div className="space-y-4">
                      {selectedCourse.assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignment.isMandatory && (
                                <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {assignment.submissionType}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div className="text-sm">
                              <span className="text-gray-500">Due Date:</span>
                              <div className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Max Points:</span>
                              <div className="font-medium">{assignment.maxPoints}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Submissions:</span>
                              <div className="font-medium">{assignment.submissions?.length || 0}</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Type:</span>
                              <div className="font-medium capitalize">{assignment.submissionType}</div>
                            </div>
                          </div>

                          {/* Student Submissions */}
                          {assignment.submissions && assignment.submissions.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Submissions</h5>
                              <div className="space-y-2">
                                {assignment.submissions.slice(0, 3).map((submission) => (
                                  <div key={submission.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{submission.studentName}</span>
                                      <Badge 
                                        variant={submission.status === 'graded' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {submission.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {submission.grade && (
                                        <span className="text-sm font-medium">{submission.grade}/{assignment.maxPoints}</span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {assignment.submissions.length > 3 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{assignment.submissions.length - 3} more submissions
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
