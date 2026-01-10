'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { 
  Search, 
  Filter, 
  CheckCircle,
  X,
  Clock,
  Eye,
  Download,
  User,
  Calendar,
  Award,
  FileText,
  ChevronDown,
  ChevronRight,
  Star,
  Building,
  GraduationCap,
  BookOpen,
  Users,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CertificateSubmission {
  id: number;
  studentId: number;
  courseName: string;
  courseProvider: string;
  completionDate: string;
  certificateFileName: string;
  fileMimeType?: string;
  fileSize?: number;
  description?: string;
  courseLink?: string;
  courseType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  evaluatedAt?: string;
  evaluatedBy?: number;
  facultyComments?: string;
  grade?: string;
  student: {
    id: number;
    name: string;
    email: string;
    year: number;
    department: {
      id: number;
      name: string;
    };
    careerPaths: {
      careerPath: {
        id: number;
        name: string;
      };
    }[];
    roadmapAssignments: {
      id: number;
      isActive: boolean;
      roadmap: {
        title: string;
      };
    }[];
  };
  evaluator?: {
    id: number;
    name: string;
    department: {
      name: string;
    };
  };
}

interface FilterOptions {
  departments: { id: number; name: string }[];
  careerPaths: { id: number; name: string }[];
  courseProviders: string[];
  years: number[];
}

interface EvaluationFilters {
  search: string;
  status: string;
  department: string;
  year: string;
  careerPath: string;
  courseProvider: string;
  courseAssignment: string;
}

export default function CertificateEvaluationPage() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    careerPaths: [],
    courseProviders: [],
    years: []
  });
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [filters, setFilters] = useState<EvaluationFilters>({
    search: '',
    status: '',
    department: '',
    year: '',
    careerPath: '',
    courseProvider: '',
    courseAssignment: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CertificateSubmission | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);

  const [evaluationData, setEvaluationData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    grade: '',
    comments: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/faculty/certificate-submissions?${queryParams.toString()}`);
      
      if (response.data) {
        setSubmissions(response.data.submissions || []);
        setFilterOptions(response.data.filterOptions || {
          departments: [],
          careerPaths: [],
          courseProviders: [],
          years: []
        });
      }
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      const errorMessage = error?.response?.data?.details || error?.response?.data?.error || 'Failed to fetch certificate submissions';
      console.error('Error details:', {
        message: errorMessage,
        status: error?.response?.status,
        data: error?.response?.data
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (submission: CertificateSubmission) => {
    setSelectedSubmission(submission);
    setEvaluationData({
      status: 'approved',
      grade: '',
      comments: ''
    });
    setShowEvaluationForm(true);
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;

    setEvaluating(selectedSubmission.id);
    try {
      const response = await api.put('/faculty/certificate-submissions', {
        id: selectedSubmission.id,
        status: evaluationData.status,
        grade: evaluationData.grade,
        comments: evaluationData.comments,
        evaluatedBy: 1 // Replace with actual faculty ID from auth
      });

      if (response.data?.success) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === selectedSubmission.id ? response.data.submission : sub)
        );
        setShowEvaluationForm(false);
        setSelectedSubmission(null);
        toast.success(`Certificate ${evaluationData.status} successfully!`);
      }
    } catch (error) {
      console.error('Error evaluating certificate:', error);
      toast.error('Failed to evaluate certificate');
    } finally {
      setEvaluating(null);
    }
  };

  const handlePreview = (submission: CertificateSubmission) => {
    setSelectedSubmission(submission);
    setShowPreview(true);
  };

  const handleDownload = (submission: CertificateSubmission) => {
    if (submission.certificateFileName) {
      try {
        // Create a download link with proper authentication
        const link = document.createElement('a');
        link.href = `/api/certificate-files/${encodeURIComponent(submission.certificateFileName)}`;
        link.download = submission.certificateFileName;
        link.click();
        toast.success('Certificate download started');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download certificate');
      }
    } else {
      toast.error('No certificate file available');
    }
  };


  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      department: '',
      year: '',
      careerPath: '',
      courseProvider: '',
      courseAssignment: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourseAssignmentStatus = (submission: CertificateSubmission) => {
    // Check if roadmapAssignments exists and is an array
    if (!submission.student.roadmapAssignments || !Array.isArray(submission.student.roadmapAssignments)) {
      return 'not-assigned';
    }
    
    const hasActiveAssignments = submission.student.roadmapAssignments.some(ra => ra.isActive);
    return hasActiveAssignments ? 'assigned' : 'not-assigned';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading certificate submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Evaluation</h1>
          <p className="text-gray-600 mt-2">Review and evaluate student certificate submissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{submissions.filter(s => s.status === 'pending').length}</span> pending
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600"
              >
                Clear All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search submissions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Career Path */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Career Path
                </label>
                <select
                  value={filters.careerPath}
                  onChange={(e) => setFilters(prev => ({ ...prev, careerPath: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Career Paths</option>
                  {filterOptions.careerPaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Provider */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Course Provider
                </label>
                <select
                  value={filters.courseProvider}
                  onChange={(e) => setFilters(prev => ({ ...prev, courseProvider: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Providers</option>
                  {filterOptions.courseProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Assignment Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Course Assignment
                </label>
                <select
                  value={filters.courseAssignment}
                  onChange={(e) => setFilters(prev => ({ ...prev, courseAssignment: e.target.value }))}
                  className="border rounded h-10 px-3 w-full bg-white"
                >
                  <option value="">All Students</option>
                  <option value="assigned">With Active Assignments</option>
                  <option value="not-assigned">Without Active Assignments</option>
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                No certificate submissions match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{submission.courseName}</h3>
                        <Badge variant="outline" className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </div>
                        </Badge>
                        {submission.grade && (
                          <Badge variant="outline" className={getGradeColor(submission.grade)}>
                            Grade: {submission.grade}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={getCourseAssignmentStatus(submission) === 'assigned' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {getCourseAssignmentStatus(submission) === 'assigned' ? 'Assigned' : 'Not Assigned'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{submission.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{submission.student.department.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>Year {submission.student.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>{submission.courseProvider}</span>
                        </div>
                      </div>

                      {/* Career Paths */}
                      {submission.student.careerPaths.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Career Paths: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {submission.student.careerPaths.map((cp, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cp.careerPath.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Roadmap Assignments */}
                      {submission.student.roadmapAssignments.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Active Roadmaps: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {submission.student.roadmapAssignments.map((ra, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {ra.roadmap.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-600 mb-3">{submission.description}</p>

                      {submission.status === 'approved' && submission.facultyComments && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Approved</span>
                          </div>
                          <p className="text-sm text-green-700">{submission.facultyComments}</p>
                        </div>
                      )}

                      {submission.status === 'rejected' && submission.facultyComments && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <X className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800">Rejected</span>
                          </div>
                          <p className="text-sm text-red-700">{submission.facultyComments}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(submission)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(submission)}
                        title="Download Certificate"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleEvaluate(submission)}
                          title="Evaluate"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Evaluate Certificate</h2>
                <Button variant="outline" onClick={() => setShowEvaluationForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedSubmission.courseName}</h3>
                <p className="text-sm text-gray-600">Student: {selectedSubmission.student.name}</p>
                <p className="text-sm text-gray-600">Department: {selectedSubmission.student.department.name}</p>
                <p className="text-sm text-gray-600">Year: {selectedSubmission.student.year}</p>
                <p className="text-sm text-gray-600">Provider: {selectedSubmission.courseProvider}</p>
              </div>

              <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="status">Evaluation Status *</Label>
                  <select
                    id="status"
                    value={evaluationData.status}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, status: e.target.value as 'approved' | 'rejected' }))}
                    className="border rounded h-10 px-3 w-full bg-white mt-1"
                    required
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <select
                    id="grade"
                    value={evaluationData.grade}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, grade: e.target.value }))}
                    className="border rounded h-10 px-3 w-full bg-white mt-1"
                  >
                    <option value="">Select Grade</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={evaluationData.comments}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Add your evaluation comments..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={evaluating === selectedSubmission.id} className="flex-1">
                    {evaluating === selectedSubmission.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Evaluation
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEvaluationForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Certificate Details</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedSubmission)}
                    title="Download Certificate"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Student Name</label>
                      <p className="text-lg">{selectedSubmission.student.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg">{selectedSubmission.student.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <p className="text-lg">{selectedSubmission.student.department.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Year</label>
                      <p className="text-lg">Year {selectedSubmission.student.year}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Course Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course Name</label>
                      <p className="text-lg">{selectedSubmission.courseName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Provider</label>
                      <p className="text-lg">{selectedSubmission.courseProvider}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Completion Date</label>
                      <p className="text-lg">{new Date(selectedSubmission.completionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge variant="outline" className={getStatusColor(selectedSubmission.status)}>
                        {selectedSubmission.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedSubmission.student.careerPaths.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Career Paths</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.student.careerPaths.map((cp, index) => (
                        <Badge key={index} variant="outline">
                          {cp.careerPath.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.student.roadmapAssignments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Active Roadmap Assignments</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.student.roadmapAssignments.map((ra, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {ra.roadmap.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{selectedSubmission.description}</p>
                  </div>
                )}

                {selectedSubmission.evaluator && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Evaluation Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Evaluated By</label>
                        <p className="text-lg">{selectedSubmission.evaluator.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Evaluated At</label>
                        <p className="text-lg">{selectedSubmission.evaluatedAt ? new Date(selectedSubmission.evaluatedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    {selectedSubmission.facultyComments && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600">Faculty Comments</label>
                        <p className="text-gray-700 mt-1">{selectedSubmission.facultyComments}</p>
                      </div>
                    )}
                    {selectedSubmission.grade && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600">Grade</label>
                        <Badge variant="outline" className={getGradeColor(selectedSubmission.grade)}>
                          {selectedSubmission.grade}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Certificate File Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Certificate File</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{selectedSubmission.certificateFileName}</p>
                      <p className="text-xs text-gray-600">Certificate Document</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(selectedSubmission)}
                        title="Download Certificate"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Document Preview Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Document Preview</h3>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <PDFViewer
                      fileUrl={`/api/certificate-files/${encodeURIComponent(selectedSubmission?.certificateFileName || '')}`}
                      fileName={selectedSubmission?.certificateFileName}
                      onDownload={() => handleDownload(selectedSubmission)}
                      className="w-full"
                    />
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