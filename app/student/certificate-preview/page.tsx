'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  User,
  Award,
  Building,
  ExternalLink,
  CheckCircle,
  Clock,
  X,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CertificateSubmission {
  id: number;
  studentId: number;
  courseName: string;
  courseProvider: string;
  completionDate: string;
  certificateFile: string;
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
    department: {
      name: string;
    };
  };
}

export default function CertificatePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');
  
  const [submission, setSubmission] = useState<CertificateSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    } else {
      setError('No submission ID provided');
      setLoading(false);
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      console.log('Fetching certificate submission:', submissionId);
      
      // Get all submissions and find the one with matching ID
      const response = await api.get('/student/certificate-submission');
      
      if (response.data.success) {
        const submissions = response.data.submissions || [];
        const foundSubmission = submissions.find((sub: CertificateSubmission) => sub.id.toString() === submissionId);
        
        if (foundSubmission) {
          setSubmission(foundSubmission);
          console.log('✅ Certificate submission found:', foundSubmission);
        } else {
          setError('Certificate submission not found');
        }
      } else {
        setError('Failed to load certificate submission');
      }
    } catch (error) {
      console.error('Error fetching certificate submission:', error);
      setError('Failed to load certificate submission');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (submission?.certificateFile) {
      try {
        // Create a download link with proper authentication
        const link = document.createElement('a');
        link.href = `/api/certificate-files/${submission.certificateFile}`;
        link.download = submission.certificateFile;
        link.target = '_blank';
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

  const handlePreview = () => {
    if (submission?.certificateFile) {
      setShowPreview(true);
    } else {
      toast.error('No certificate file available');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested certificate could not be found.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Certificate
            </Button>
            <Button 
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </Button>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Certificate Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {submission.courseName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{submission.courseProvider}</span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(submission.status)} flex items-center gap-1`}>
                    {getStatusIcon(submission.status)}
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Completion Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(submission.completionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Course Type</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {submission.courseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {submission.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{submission.description}</p>
                  </div>
                )}

                {/* Course Link */}
                {submission.courseLink && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Course Link</label>
                    <div className="mt-1">
                      <a 
                        href={submission.courseLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Course
                      </a>
                    </div>
                  </div>
                )}

                {/* Faculty Comments */}
                {submission.facultyComments && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Faculty Comments</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{submission.facultyComments}</p>
                    </div>
                  </div>
                )}

                {/* Grade */}
                {submission.grade && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Grade</label>
                    <div className="mt-1">
                      <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                        {submission.grade}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{submission.student.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{submission.student.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900">{submission.student.department.name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-xs text-gray-600">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {submission.evaluatedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Evaluated</p>
                      <p className="text-xs text-gray-600">
                        {new Date(submission.evaluatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate File */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Certificate File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{submission.certificateFile}</p>
                    <p className="text-xs text-gray-600">PDF Document</p>
                  </div>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Certificate Preview</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
              
              <PDFViewer
                fileUrl={`/api/certificate-files/${submission?.certificateFile}`}
                fileName={submission?.certificateFile}
                onDownload={handleDownload}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
