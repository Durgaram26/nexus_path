'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Code,
  ClipboardList,
  Star,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface StudentSubmission {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  textSubmission?: string;
  codeSubmission?: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: 'file' | 'text' | 'code' | 'quiz';
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  courseType: 'online' | 'offline' | 'hybrid';
}

export default function GradeAssignment({ 
  params 
}: { 
  params: Promise<{ id: string; assignmentId: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id, resolvedParams.assignmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseResponse, assignmentResponse, submissionsResponse] = await Promise.all([
        api.get(`/faculty/courses/${resolvedParams.id}`),
        api.get(`/faculty/courses/${resolvedParams.id}/assignments/${resolvedParams.assignmentId}`),
        api.get(`/faculty/courses/${resolvedParams.id}/assignments/${resolvedParams.assignmentId}/submissions`)
      ]);

      if (courseResponse.data.success) {
        const courseData = courseResponse.data.course;
        setCourse({
          id: courseData.id,
          title: courseData.title,
          instructor: courseData.instructor,
          courseType: courseData.courseType
        });
      }

      if (assignmentResponse.data.success) {
        const assignmentData = assignmentResponse.data.assignment;
        setAssignment({
          id: assignmentData.id,
          title: assignmentData.title,
          description: assignmentData.description,
          dueDate: assignmentData.dueDate,
          maxPoints: assignmentData.maxPoints,
          isMandatory: assignmentData.isMandatory,
          submissionType: assignmentData.submissionType
        });
      }

      if (submissionsResponse.data.success) {
        const transformedSubmissions: StudentSubmission[] = submissionsResponse.data.submissions.map((submission: any) => ({
          id: submission.id,
          studentId: submission.studentId,
          studentName: submission.studentName,
          studentEmail: submission.studentEmail,
          submittedAt: submission.submittedAt,
          status: submission.status,
          grade: submission.grade,
          feedback: submission.feedback,
          fileUrl: submission.fileUrl,
          textSubmission: submission.textSubmission,
          codeSubmission: submission.codeSubmission
        }));
        setSubmissions(transformedSubmissions);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        console.warn('API endpoint not implemented yet. Using empty state.');
        toast.info('Course management API is not yet implemented. This is a preview of the interface.');
        setCourse({
          id: parseInt(resolvedParams.id),
          title: 'Sample Course',
          instructor: 'Faculty Member',
          courseType: 'online'
        });
        setAssignment({
          id: parseInt(resolvedParams.assignmentId),
          title: 'Sample Assignment',
          description: 'This is a preview of the assignment grading interface.',
          dueDate: '2024-12-31',
          maxPoints: 100,
          isMandatory: true,
          submissionType: 'code'
        });
        setSubmissions([]);
      } else {
        toast.error('Failed to fetch assignment data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: number, grade: number, feedback: string) => {
    setGrading(submissionId);
    try {
      const response = await api.post(`/faculty/assignments/submissions/${submissionId}/grade`, {
        grade,
        feedback
      });
      
      if (response.data.success) {
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === submissionId 
              ? { ...submission, grade, feedback, status: 'graded' as const }
              : submission
          )
        );
        toast.success('Submission graded successfully');
      } else {
        throw new Error('Failed to grade submission');
      }
    } catch (error: any) {
      console.error('Error grading submission:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        toast.info('Course management API is not yet implemented. This is a preview of the interface.');
      } else {
        toast.error('Failed to grade submission');
      }
    } finally {
      setGrading(null);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      case 'submitted': return <AlertCircle className="w-4 h-4" />;
      case 'late': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const isLate = (submittedAt: string, dueDate: string) => {
    return new Date(submittedAt) > new Date(dueDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading assignment submissions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Grade Assignment</h1>
            <p className="text-gray-600 mt-2">
              {course?.title} - {assignment?.title}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Grades
          </Button>
        </div>
      </div>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Max Points</div>
              <div className="text-lg font-semibold">{assignment?.maxPoints}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Due Date</div>
              <div className="text-lg font-semibold">{assignment && new Date(assignment.dueDate).toLocaleDateString()}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Submission Type</div>
              <div className="text-lg font-semibold capitalize">{assignment?.submissionType}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Submissions</div>
              <div className="text-lg font-semibold">{submissions.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Students</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded h-10 px-3 w-full bg-white"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                {submissions.length === 0 
                  ? "No students have submitted this assignment yet."
                  : "No submissions match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{submission.studentName}</h3>
                        <p className="text-sm text-gray-600">{submission.studentEmail}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                      {isLate(submission.submittedAt, assignment?.dueDate || '') && submission.status !== 'graded' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          LATE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      {submission.grade && (
                        <div className="text-lg font-semibold text-green-600">
                          {submission.grade}/{assignment?.maxPoints}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Submission Content */}
                    {submission.codeSubmission && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Code Submission</Label>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm">{submission.codeSubmission}</pre>
                        </div>
                      </div>
                    )}

                    {submission.textSubmission && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Text Submission</Label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm">{submission.textSubmission}</p>
                        </div>
                      </div>
                    )}

                    {submission.fileUrl && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">File Submission</Label>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <a 
                            href={submission.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Download File
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Grading Section */}
                    {submission.status !== 'graded' ? (
                      <GradingForm
                        submission={submission}
                        maxPoints={assignment?.maxPoints || 100}
                        onGrade={handleGrade}
                        grading={grading === submission.id}
                      />
                    ) : (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-800">Graded</h4>
                          <div className="text-lg font-bold text-green-600">
                            {submission.grade}/{assignment?.maxPoints}
                          </div>
                        </div>
                        {submission.feedback && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">Feedback</Label>
                            <p className="text-sm text-gray-700">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface GradingFormProps {
  submission: StudentSubmission;
  maxPoints: number;
  onGrade: (submissionId: number, grade: number, feedback: string) => void;
  grading: boolean;
}

function GradingForm({ submission, maxPoints, onGrade, grading }: GradingFormProps) {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade && feedback) {
      onGrade(submission.id, parseInt(grade), feedback);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-3">Grade Submission</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`grade-${submission.id}`}>Grade (0-{maxPoints})</Label>
            <Input
              id={`grade-${submission.id}`}
              type="number"
              min="0"
              max={maxPoints}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter grade"
              required
            />
          </div>
          <div>
            <Label htmlFor={`feedback-${submission.id}`}>Feedback</Label>
            <Textarea
              id={`feedback-${submission.id}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows={3}
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={grading || !grade || !feedback}
            className="flex items-center gap-2"
          >
            {grading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {grading ? 'Grading...' : 'Submit Grade'}
          </Button>
        </div>
      </form>
    </div>
  );
}
