'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Calendar,
  User,
  Award,
  CheckCircle,
  Clock,
  X,
  Plus,
  Download,
  Eye,
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
  certificateFile: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
  facultyComments?: string;
  grade?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: {
    name: string;
  };
}

export default function CertificateSubmissionPage() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  // Removed preview modal state - now using dedicated preview page

  const [formData, setFormData] = useState({
    courseName: '',
    courseProvider: '',
    completionDate: '',
    description: '',
    certificateFile: null as File | null,
    courseLink: '',
    courseType: 'online-course' // Default to online course
  });

  useEffect(() => {
    fetchData();
    // Check for URL parameters to pre-fill form
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('courseName')) {
      setFormData(prev => ({
        ...prev,
        courseName: urlParams.get('courseName') || '',
        courseProvider: urlParams.get('courseProvider') || '',
        courseLink: urlParams.get('courseLink') || '',
        courseType: urlParams.get('courseType') || 'online-course',
        description: urlParams.get('description') || ''
      }));
      setShowSubmissionForm(true);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch student data
      try {
        const studentResponse = await api.get('/auth/me');
        setStudent(studentResponse.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        // Continue without student data
      }

      // Fetch certificate submissions
      try {
        console.log('Fetching certificate submissions...');
        const submissionsResponse = await api.get('/student/certificate-submission');
        console.log('Certificate submissions response:', submissionsResponse);
        
        if (submissionsResponse.data.success) {
          setSubmissions(submissionsResponse.data.submissions || []);
          console.log('✅ Certificate submissions loaded:', submissionsResponse.data.submissions?.length || 0);
        } else {
          console.log('❌ Failed to load certificate submissions:', submissionsResponse.data.error);
          setSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching certificate submissions:', error);
        setSubmissions([]);
      }

      // Fetch mandatory courses from roadmap milestones and workshops
      try {
        console.log('Attempting to fetch roadmap data...');
        const coursesResponse = await api.get('/student/assigned-roadmaps');
        console.log('Full roadmap response:', coursesResponse);
        console.log('Roadmap data:', coursesResponse.data);
        console.log('Success status:', coursesResponse.data?.success);
        console.log('Roadmaps array:', coursesResponse.data?.roadmaps);
        console.log('Roadmaps length:', coursesResponse.data?.roadmaps?.length);
        console.log('Data type of roadmaps:', typeof coursesResponse.data?.roadmaps);
        console.log('Is roadmaps array?', Array.isArray(coursesResponse.data?.roadmaps));
        
        // Check if we have any data at all
        if (coursesResponse.data.success && coursesResponse.data.roadmaps && coursesResponse.data.roadmaps.length > 0) {
          // Extract mandatory courses from roadmap milestones
          const mandatoryCourses: any[] = [];
          coursesResponse.data.roadmaps.forEach((roadmap: any) => {
            console.log('Processing roadmap:', roadmap.title);
            
            // Parse milestones if they're strings (same logic as roadmap details page)
            let milestones = roadmap.milestones;
            if (typeof milestones === 'string') {
              try {
                milestones = JSON.parse(milestones);
              } catch (e) {
                console.error('Error parsing milestones:', e);
                milestones = [];
              }
            }
            
            if (milestones && Array.isArray(milestones)) {
              milestones.forEach((milestone: any) => {
                console.log('Processing milestone:', milestone.title);
                
                // Parse activities if they're strings
                let activities = milestone.activities;
                if (typeof activities === 'string') {
                  try {
                    activities = JSON.parse(activities);
                  } catch (e) {
                    console.error('Error parsing activities:', e);
                    activities = [];
                  }
                }
                
                if (activities && Array.isArray(activities)) {
                  activities.forEach((activity: any) => {
                    console.log('Processing activity:', activity.title, 'Category:', activity.category);
                    // Only include online-courses, workshops, and internships
                    if (activity.category === 'online-courses' || 
                        activity.category === 'workshops' || 
                        activity.category === 'internships') {
                      console.log('Adding mandatory course:', activity.title);
                      mandatoryCourses.push({
                        title: activity.title,
                        description: activity.description,
                        category: activity.category,
                        provider: activity.tool || 'Unknown Provider',
                        link: activity.link || ''
                      });
                    }
                  });
                }
              });
            }
          });
          console.log('Mandatory courses found:', mandatoryCourses);
          // Remove duplicates within roadmap courses
          const uniqueCourses = mandatoryCourses.filter((course, index, self) => 
            index === self.findIndex(c => c.title === course.title)
          );
          setRecommendedCourses(uniqueCourses);
        } else {
          console.log('No roadmaps found or roadmaps not successful');
          console.log('Response structure:', coursesResponse.data);
          setRecommendedCourses([]);
        }
      } catch (error) {
        console.error('Error fetching mandatory courses:', error);
        setRecommendedCourses([]);
      }

      // Fetch mandatory workshops separately (only mandatory ones)
      try {
        console.log('Attempting to fetch mandatory workshops...');
        const workshopsResponse = await api.get('/student/mandatory-workshops');
        console.log('Workshops response:', workshopsResponse);
        
        if (workshopsResponse.data.success && workshopsResponse.data.mandatoryCourses) {
          console.log('Mandatory workshops found:', workshopsResponse.data.mandatoryCourses);
          // Only add workshops that are marked as mandatory
          const mandatoryWorkshops = workshopsResponse.data.mandatoryCourses
            .filter((workshop: any) => workshop.isMandatory === true)
            .map((workshop: any) => ({
              ...workshop,
              category: 'workshops', // Ensure they're marked as workshops
              isWorkshop: true // Add a flag to distinguish from courses
            }));
          // Add workshops while avoiding duplicates
          setRecommendedCourses(prev => {
            const existingTitles = new Set(prev.map(course => course.title));
            const newWorkshops = mandatoryWorkshops.filter((workshop: any) => !existingTitles.has(workshop.title));
            return [...prev, ...newWorkshops];
          });
        }
      } catch (error: any) {
        console.error('Error fetching mandatory workshops:', error);
        console.error('Error details:', error.response?.data);
        // Don't set empty array here, keep existing courses
        // Show a toast notification about the error
        toast.error('Could not load mandatory workshops. Please try again later.');
      }
      
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Some data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFormData(prev => ({ ...prev, certificateFile: file }));
      toast.success('PDF file selected successfully');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseName || !formData.courseProvider || !formData.completionDate || !formData.certificateFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting certificate...', formData);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('courseName', formData.courseName);
      submitData.append('courseProvider', formData.courseProvider);
      submitData.append('completionDate', formData.completionDate);
      submitData.append('description', formData.description);
      submitData.append('courseLink', formData.courseLink);
      submitData.append('courseType', formData.courseType);
      
      if (formData.certificateFile) {
        submitData.append('certificateFile', formData.certificateFile);
      }

      // Submit to API
      const response = await api.post('/student/certificate-submission', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Certificate submission response:', response);

      if (response.data.success) {
        // Refresh submissions list
        console.log('✅ Certificate submitted, refreshing submissions...');
        await fetchData();
        
        setFormData({
          courseName: '',
          courseProvider: '',
          completionDate: '',
          description: '',
          certificateFile: null,
          courseLink: '',
          courseType: 'online-course'
        });
        setShowSubmissionForm(false);
        toast.success('Certificate submitted successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to submit certificate');
      }
    } catch (error) {
      console.error('Error submitting certificate:', error);
      toast.error('Failed to submit certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = (submission: CertificateSubmission) => {
    // Navigate to the dedicated preview page
    window.open(`/student/certificate-preview?id=${submission.id}`, '_blank');
  };

  const handleDownload = (submission: CertificateSubmission) => {
    if (submission.certificateFile) {
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Submissions</h1>
          <p className="text-gray-600 mt-2">Submit your course certificates for faculty evaluation</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowSubmissionForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Submit Certificate
          </Button>
          <Button 
            variant="outline"
            onClick={fetchData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Student Info */}
      {student && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{student.firstName} {student.lastName}</h3>
                <p className="text-gray-600">{student.email}</p>
                <p className="text-sm text-gray-500">{student.department.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mandatory Courses and Workshops from Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-red-600" />
            Mandatory Activities from Your Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mandatory Activities</h3>
                <p className="text-gray-600">Complete your roadmap setup to see mandatory courses and workshops.</p>
              </div>
            ) : (
              recommendedCourses.map((course, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                course.isWorkshop ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{course.title}</h4>
                      <Badge variant="destructive" className="text-xs">
                        MANDATORY
                      </Badge>
                      {course.isWorkshop && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                          WORKSHOP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{course.provider}</span>
                    </div>
                    <div className={`p-2 rounded-lg mb-3 ${
                      course.isWorkshop ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <p className={`text-xs font-medium ${
                        course.isWorkshop ? 'text-orange-700' : 'text-red-700'
                      }`}>
                        ⚠️ Certificate submission is MANDATORY for this {course.isWorkshop ? 'workshop' : 'course'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(course.link, '_blank')}
                    className="flex-1"
                  >
                    View Course
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        courseName: course.title,
                        courseProvider: course.provider,
                        courseLink: course.link || '',
                        courseType: course.category === 'online-courses' ? 'online-course' : 
                                   course.category === 'workshops' ? 'workshop' : 
                                   course.category === 'internships' ? 'internship' : 'online-course',
                        description: course.description || ''
                      }));
                      setShowSubmissionForm(true);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Submit Certificate
                  </Button>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Submitted</h3>
              <p className="text-gray-600 mb-6">
                Submit your course certificates to track your learning progress.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowSubmissionForm(true)}>
                  Submit Your First Certificate
                </Button>
                <Button variant="outline" onClick={fetchData}>
                  Refresh
                </Button>
              </div>
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
                      </div>
                      
                      <p className="text-gray-600 mb-3">{submission.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>{submission.courseProvider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(submission.completionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{submission.certificateFile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {submission.status === 'approved' && submission.grade && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Grade: {submission.grade}</span>
                          </div>
                          {submission.facultyComments && (
                            <p className="text-sm text-green-700 mt-1">{submission.facultyComments}</p>
                          )}
                        </div>
                      )}

                      {submission.status === 'rejected' && submission.facultyComments && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800">Rejected</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">{submission.facultyComments}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(submission)}
                        title="Preview Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {submission.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(submission)}
                          title="Download Certificate"
                          className="text-green-600 hover:text-green-800"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Submit Certificate</h2>
                <Button variant="outline" onClick={() => setShowSubmissionForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="courseName">Activity Name *</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                    placeholder="e.g., Python Programming Fundamentals, Software Engineering Internship"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="courseProvider">Provider/Organization *</Label>
                  <Input
                    id="courseProvider"
                    value={formData.courseProvider}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseProvider: e.target.value }))}
                    placeholder="e.g., Coursera, Google, Microsoft, University"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="courseLink">Activity Link (Optional)</Label>
                  <Input
                    id="courseLink"
                    value={formData.courseLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseLink: e.target.value }))}
                    placeholder="https://coursera.org/learn/python or company website"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="courseType">Activity Type</Label>
                  <select
                    id="courseType"
                    value={formData.courseType}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online-course">Online Course</option>
                    <option value="workshop">Workshop</option>
                    <option value="internship">Internship</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="certification">Professional Certification</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="completionDate">Completion Date *</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you learned, skills gained, or experience acquired..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="certificateFile">Certificate/Completion Document *</Label>
                  <div className="mt-1">
                    <Input
                      id="certificateFile"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted format: PDF only (Max size: 10MB)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Certificate
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSubmissionForm(false)}
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

      {/* Preview now handled by dedicated preview page */}
    </div>
  );
}
