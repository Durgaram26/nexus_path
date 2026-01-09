'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
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
  Star,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  FileText,
  Code,
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  studentId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'dropped' | 'completed';
  grade?: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastActivity: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  courseType: 'online' | 'offline' | 'hybrid';
  maxStudents: number;
  enrolledStudents: number;
  startDate: string;
  endDate: string;
}

export default function CourseStudents({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseResponse, studentsResponse] = await Promise.all([
        api.get(`/faculty/courses/${resolvedParams.id}`),
        api.get(`/faculty/courses/${resolvedParams.id}/students`)
      ]);

      if (courseResponse.data.success) {
        const courseData = courseResponse.data.course;
        setCourse({
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          instructor: courseData.instructor,
          courseType: courseData.courseType,
          maxStudents: courseData.maxStudents,
          enrolledStudents: courseData.enrolledStudents,
          startDate: courseData.startDate,
          endDate: courseData.endDate
        });
      }

      if (studentsResponse.data.success) {
        const transformedStudents: Student[] = studentsResponse.data.students.map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          studentId: student.studentId,
          enrollmentDate: student.enrollmentDate,
          status: student.status,
          grade: student.grade,
          assignmentsCompleted: student.assignmentsCompleted,
          totalAssignments: student.totalAssignments,
          lastActivity: student.lastActivity
        }));
        setStudents(transformedStudents);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      // Check if it's a 404 error (course not found)
      if (error.response?.status === 404) {
        console.warn('Course not found');
        toast.error('Course not found. Please check the course ID or create a course first.');
        setCourse(null);
        setStudents([]);
      } else {
        toast.error('Failed to fetch course data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the course?')) {
      return;
    }

    try {
      const response = await api.delete(`/faculty/courses/${resolvedParams.id}/students/${studentId}`);
      
      if (response.data.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'dropped' as const }
              : student
          )
        );
        toast.success('Student removed from course');
      } else {
        throw new Error('Failed to remove student');
      }
    } catch (error: any) {
      console.error('Error removing student:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        toast.info('Course management API is not yet implemented. This is a preview of the interface.');
      } else {
        toast.error('Failed to remove student');
      }
    }
  };

  const handleAddStudent = () => {
    // Navigate to add student page
    router.push(`/faculty/course-management/${resolvedParams.id}/students/add`);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'text-gray-500';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-yellow-600';
    if (grade >= 70) return 'text-orange-600';
    return 'text-red-600';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading course students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-gray-900">Course Students</h1>
            <p className="text-gray-600 mt-2">
              {course?.title} - {course?.enrolledStudents}/{course?.maxStudents} students enrolled
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="flex items-center gap-2"
            onClick={handleAddStudent}
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export List
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{course?.enrolledStudents}</div>
                <div className="text-sm text-gray-600">Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {students.filter(s => s.status === 'enrolled').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(students.filter(s => s.status === 'enrolled').reduce((acc, s) => acc + (s.grade || 0), 0) / students.filter(s => s.status === 'enrolled').length) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Grade</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(students.filter(s => s.status === 'enrolled').reduce((acc, s) => acc + s.assignmentsCompleted, 0) / students.filter(s => s.status === 'enrolled').length) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="dropped">Dropped</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600 mb-6">
                {students.length === 0 
                  ? "No students are enrolled in this course yet."
                  : "No students match your current filters."
                }
              </p>
              {students.length === 0 && (
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleAddStudent}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Your First Student
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{student.name}</CardTitle>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Remove Student"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                      {student.grade && (
                        <Badge variant="outline" className={getGradeColor(student.grade)}>
                          Grade: {student.grade}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Assignments</div>
                        <div className="font-medium">
                          {student.assignmentsCompleted}/{student.totalAssignments}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Assignments</div>
                        <div className="font-medium text-blue-600">
                          {student.assignmentsCompleted}/{student.totalAssignments}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last Activity: {new Date(student.lastActivity).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/faculty/course-management/${resolvedParams.id}/students/${student.id}/assignments`)}
                        className="flex-1"
                      >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Assignments
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                <Button variant="outline" onClick={() => setShowStudentDetails(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Student ID</div>
                    <div className="text-lg font-semibold">{selectedStudent.studentId}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Status</div>
                    <div className="text-lg font-semibold">{selectedStudent.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Grade</div>
                    <div className="text-lg font-semibold">
                      {selectedStudent.grade ? `${selectedStudent.grade}/100` : 'Not graded'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Assignments</div>
                    <div className="text-lg font-semibold">{selectedStudent.assignmentsCompleted}/{selectedStudent.totalAssignments}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Assignments Completed</div>
                    <div className="text-lg font-semibold">
                      {selectedStudent.assignmentsCompleted}/{selectedStudent.totalAssignments}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Enrollment Date</div>
                    <div className="text-lg font-semibold">
                      {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{selectedStudent.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Last Activity: {new Date(selectedStudent.lastActivity).toLocaleDateString()}
                    </span>
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
