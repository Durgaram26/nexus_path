'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
  Code,
  File,
  Type,
  Send,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: string;
  submissions: AssignmentSubmission[];
}

interface AssignmentSubmission {
  id: number;
  submittedAt: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  textSubmission?: string;
  codeSubmission?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  assignments: Assignment[];
}

export default function CourseAssignments({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionCode, setSubmissionCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [resolvedParams.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/courses/${resolvedParams.id}`);
      
      if (response.data.success) {
        setCourse(response.data.course);
      } else {
        throw new Error('Failed to fetch course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'late': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return isOverdue(assignment.dueDate) ? 'overdue' : 'pending';
    }
    
    const latestSubmission = assignment.submissions[assignment.submissions.length - 1];
    return latestSubmission.status;
  };

  const handleSubmitAssignment = async (assignment: Assignment) => {
    if (!submissionText.trim() && !submissionCode.trim()) {
      toast.error('Please provide a submission');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/student/assignments/${assignment.id}/submit`, {
        textSubmission: submissionText,
        codeSubmission: submissionCode,
        submissionType: assignment.submissionType
      });

      if (response.data.success) {
        toast.success('Assignment submitted successfully');
        setSubmissionText('');
        setSubmissionCode('');
        setSelectedAssignment(null);
        fetchCourse(); // Refresh assignments
      } else {
        throw new Error('Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-1">Course Assignments</p>
        </div>
      </div>

      {/* Course Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
              <p className="text-gray-600 mt-1">{course.description}</p>
              <p className="text-sm text-gray-500 mt-2">Instructor: {course.instructor}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {course.assignments.length}
              </div>
              <div className="text-sm text-gray-600">Assignments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {course.assignments.map((assignment) => {
          const status = getSubmissionStatus(assignment);
          const isOverdueAssignment = isOverdue(assignment.dueDate);
          
          return (
            <Card 
              key={assignment.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                isOverdueAssignment && status !== 'graded' ? 'border-red-200' : ''
              }`}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getStatusColor(status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(status)}
                        {status}
                      </div>
                    </Badge>
                    {assignment.isMandatory && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Mandatory
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Due:</span>
                    <span className={`font-medium ${
                      isOverdueAssignment ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {formatDate(assignment.dueDate)}
                    </span>
                    {isOverdueAssignment && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{assignment.maxPoints} points</span>
                  </div>

                  {/* Submission Type */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {assignment.submissionType === 'code' && <Code className="w-4 h-4" />}
                    {assignment.submissionType === 'file' && <File className="w-4 h-4" />}
                    {assignment.submissionType === 'text' && <Type className="w-4 h-4" />}
                    <span className="capitalize">{assignment.submissionType} submission</span>
                  </div>

                  {/* Latest Grade */}
                  {assignment.submissions && assignment.submissions.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Latest Grade:</span>
                        <span className="font-medium">
                          {assignment.submissions[assignment.submissions.length - 1].grade || 'Not graded'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      variant={status === 'graded' ? 'outline' : 'default'}
                    >
                      {status === 'graded' ? (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          View Submission
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          {status === 'submitted' ? 'Resubmit' : 'Submit'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {course.assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
            <p className="text-gray-600">
              This course doesn't have any assignments yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedAssignment.title}</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAssignment(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedAssignment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedAssignment.dueDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Points:</span>
                  <span className="ml-2 font-medium">{selectedAssignment.maxPoints}</span>
                </div>
              </div>

              {/* Submission Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Your Submission</h3>
                
                {selectedAssignment.submissionType === 'text' && (
                  <div>
                    <Label htmlFor="textSubmission">Text Submission</Label>
                    <textarea
                      id="textSubmission"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full mt-1 p-3 border rounded-lg h-32"
                      placeholder="Enter your submission here..."
                    />
                  </div>
                )}

                {selectedAssignment.submissionType === 'code' && (
                  <div>
                    <Label htmlFor="codeSubmission">Code Submission</Label>
                    <textarea
                      id="codeSubmission"
                      value={submissionCode}
                      onChange={(e) => setSubmissionCode(e.target.value)}
                      className="w-full mt-1 p-3 border rounded-lg h-40 font-mono text-sm"
                      placeholder="Enter your code here..."
                    />
                  </div>
                )}

                {selectedAssignment.submissionType === 'file' && (
                  <div>
                    <Label htmlFor="fileSubmission">File Upload</Label>
                    <Input
                      id="fileSubmission"
                      type="file"
                      className="mt-1"
                      accept=".pdf,.doc,.docx,.txt,.zip"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: PDF, DOC, DOCX, TXT, ZIP
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitAssignment(selectedAssignment)}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
