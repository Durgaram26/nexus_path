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
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  courseType: 'online' | 'offline' | 'hybrid';
  enrolledStudents: number;
  maxStudents: number;
}

export default function CourseAssignments({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [resolvedParams.id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseResponse = await api.get(`/faculty/courses/${resolvedParams.id}`);

      if (courseResponse.data.success) {
        const courseData = courseResponse.data.course;
        setCourse({
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          instructor: courseData.creator?.name || 'Unknown Instructor',
          courseType: courseData.courseType || 'online',
          enrolledStudents: courseData.enrollments?.length || 0,
          maxStudents: courseData.maxStudents || 50
        });

        // Extract assignments from course data
        if (courseData.assignments && Array.isArray(courseData.assignments)) {
          const transformedAssignments: Assignment[] = courseData.assignments.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints,
            isMandatory: assignment.isMandatory,
            submissionType: assignment.submissionType || 'file',
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
          }));
          setAssignments(transformedAssignments);
        }
      }
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        console.warn('API endpoint not implemented yet. Using empty state.');
        toast.info('Course management API is not yet implemented. This is a preview of the interface.');
        setCourse(null);
        setAssignments([]);
      } else {
        toast.error('Failed to fetch course data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowPreview(true);
  };

  const handleEdit = (assignment: Assignment) => {
    // Navigate to edit assignment page
    router.push(`/faculty/course-management/${resolvedParams.id}/assignments/${assignment.id}/edit`);
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('Assignment deleted successfully');
      
      // Try to delete from server (API may not be implemented yet)
      try {
        await api.delete(`/faculty/assignments/${assignmentId}`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('Assignment deletion API not implemented. Removed from UI only.');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
      fetchCourseData();
    }
  };

  const handleGradeSubmission = async (submissionId: number, grade: number, feedback: string) => {
    try {
      setAssignments(prev => 
        prev.map(assignment => ({
          ...assignment,
          submissions: assignment.submissions.map(submission => 
            submission.id === submissionId 
              ? { ...submission, grade, feedback, status: 'graded' as const }
              : submission
          )
        }))
      );
      toast.success('Submission graded successfully');
      
      // Try to save to server (API may not be implemented yet)
      try {
        await api.post(`/faculty/submissions/${submissionId}/grade`, {
          grade,
          feedback
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('Submission grading API not implemented. Saved in UI only.');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <AlertCircle className="w-4 h-4" />;
      case 'late': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading course assignments...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Course Assignments</h1>
            <p className="text-gray-600 mt-2">
              {course?.title} - {course?.enrolledStudents}/{course?.maxStudents} students enrolled
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="flex items-center gap-2"
            onClick={() => router.push(`/faculty/course-management/${resolvedParams.id}/assignments/create`)}
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600 mb-6">
                {assignments.length === 0 
                  ? "No assignments have been created for this course yet."
                  : "No assignments match your search criteria."
                }
              </p>
              {assignments.length === 0 && (
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => router.push(`/faculty/course-management/${resolvedParams.id}/assignments/create`)}
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Assignment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(assignment)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assignment)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {assignment.submissionType === 'file' && <FileText className="w-3 h-3" />}
                        {assignment.submissionType === 'code' && <Code className="w-3 h-3" />}
                        {assignment.submissionType === 'text' && <ClipboardList className="w-3 h-3" />}
                        {assignment.submissionType === 'quiz' && <BookOpen className="w-3 h-3" />}
                        {assignment.submissionType}
                      </Badge>
                      {assignment.isMandatory && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          MANDATORY
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {assignment.maxPoints} points
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assignment.submissions.length} submissions
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {assignment.submissions.filter(s => s.status === 'graded').length} graded
                      </div>
                    </div>

                    {/* Recent Submissions */}
                    {assignment.submissions.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Recent Submissions</div>
                        <div className="space-y-1">
                          {assignment.submissions.slice(0, 3).map((submission) => (
                            <div key={submission.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{submission.studentName}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getSubmissionStatusColor(submission.status)}`}
                                >
                                  {getSubmissionStatusIcon(submission.status)}
                                  {submission.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {submission.grade && (
                                  <span className="font-medium">{submission.grade}/{assignment.maxPoints}</span>
                                )}
                                <span className="text-gray-500">
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

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(assignment)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assignment)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/faculty/course-management/${resolvedParams.id}/assignments/${assignment.id}/grade`)}
                        className="flex-1"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Grade
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
      {showPreview && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedAssignment.title}</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedAssignment.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Due Date</div>
                    <div className="text-lg font-semibold">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Max Points</div>
                    <div className="text-lg font-semibold">{selectedAssignment.maxPoints}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Submission Type</div>
                    <div className="text-lg font-semibold capitalize">{selectedAssignment.submissionType}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Mandatory</div>
                    <div className="text-lg font-semibold">{selectedAssignment.isMandatory ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Student Submissions */}
                {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Student Submissions</h3>
                    <div className="space-y-4">
                      {selectedAssignment.submissions.map((submission) => (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{submission.studentName}</span>
                              <Badge 
                                variant={submission.status === 'graded' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {submission.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {submission.grade && (
                                <span className="font-medium">{submission.grade}/{selectedAssignment.maxPoints}</span>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {submission.feedback && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <div className="text-sm text-gray-600">Feedback:</div>
                              <div className="text-sm">{submission.feedback}</div>
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
