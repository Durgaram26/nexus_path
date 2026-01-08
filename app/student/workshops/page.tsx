'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Link, 
  Play,
  FileText,
  CheckCircle,
  AlertCircle,
  Target,
  GraduationCap,
  User,
  Mail,
  Phone,
  Award,
  Wrench,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Workshop {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  workshopType: string;
  location?: string;
  meetingLink?: string;
  isMandatory: boolean;
  enrolledStudents: number;
  maxStudents: number;
  assignments: Assignment[];
  enrollment?: {
    status: string;
    enrolledAt: string;
    grade?: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    lastActivity: string;
  };
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: string;
  submissions: Submission[];
}

interface Submission {
  id: number;
  submittedAt: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  textSubmission?: string;
  codeSubmission?: string;
}

export default function StudentWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      // Use the simplified database API for workshops
      const response = await api.get('/student/workshops-simple');
      
      if (response.data.success) {
        setWorkshops(response.data.workshops || []);
      } else {
        throw new Error('Failed to fetch workshops');
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error('Failed to load workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'dropped': return 'bg-red-100 text-red-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isAssignmentOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return isAssignmentOverdue(assignment.dueDate) ? 'overdue' : 'pending';
    }
    
    const latestSubmission = assignment.submissions[assignment.submissions.length - 1];
    return latestSubmission.status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Workshops</h1>
          <p className="text-gray-600 mt-2">Workshops assigned through your career roadmap</p>
        </div>
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-600" />
          <span className="text-sm text-gray-600">{workshops.length} workshops</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{workshops.length}</div>
                <div className="text-sm text-gray-600">Total Workshops</div>
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
                  {workshops.filter(w => w.enrollment?.status === 'enrolled').length}
                </div>
                <div className="text-sm text-gray-600">Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {workshops.reduce((acc, w) => acc + (w.assignments?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {workshops.reduce((acc, w) => {
                    const overdue = w.assignments?.filter(a => 
                      getSubmissionStatus(a) === 'overdue'
                    ).length || 0;
                    return acc + overdue;
                  }, 0)}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop) => (
          <Card 
            key={workshop.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedWorkshop(workshop)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {workshop.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {workshop.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={getLevelColor(workshop.level)}>
                    {workshop.level}
                  </Badge>
                  {workshop.enrollment && (
                    <Badge className={getStatusColor(workshop.enrollment.status)}>
                      {workshop.enrollment.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Workshop Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{workshop.instructor}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{workshop.duration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(workshop.startDate)} - {formatDate(workshop.endDate)}</span>
                </div>

                {workshop.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{workshop.location}</span>
                  </div>
                )}

                {/* Assignment Status */}
                {workshop.assignments && workshop.assignments.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assignments</span>
                      <span className="font-medium">
                        {workshop.enrollment?.assignmentsCompleted || 0} / {workshop.enrollment?.totalAssignments || workshop.assignments.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((workshop.enrollment?.assignmentsCompleted || 0) / (workshop.enrollment?.totalAssignments || workshop.assignments.length)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setSelectedWorkshop(workshop);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    View Workshop
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Navigate to certificate submission with pre-filled workshop data
                      const params = new URLSearchParams({
                        courseName: workshop.title,
                        courseProvider: workshop.instructor,
                        courseLink: workshop.meetingLink || '',
                        courseType: 'workshop',
                        description: workshop.description
                      });
                      window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                    }}
                    title="Submit Certificate for this Workshop"
                  >
                    <Award className="w-4 h-4" />
                  </Button>
                  {workshop.meetingLink && (
                    <Button size="sm" variant="outline">
                      <Link className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {workshops.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workshops Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any workshops assigned through your career roadmap yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your faculty to get workshops assigned to your roadmap.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Workshop Details Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Workshop Details</h2>
                <Button variant="outline" onClick={() => setSelectedWorkshop(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Workshop Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedWorkshop.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedWorkshop.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{selectedWorkshop.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedWorkshop.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedWorkshop.startDate)} - {formatDate(selectedWorkshop.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getLevelColor(selectedWorkshop.level)}>
                      {selectedWorkshop.level}
                    </Badge>
                    <Badge variant="outline">
                      {selectedWorkshop.category}
                    </Badge>
                    {selectedWorkshop.enrollment && (
                      <Badge className={getStatusColor(selectedWorkshop.enrollment.status)}>
                        {selectedWorkshop.enrollment.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Workshop Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Workshop Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium">{selectedWorkshop.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedWorkshop.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{selectedWorkshop.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedWorkshop.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedWorkshop.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Enrollment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedWorkshop.enrollment ? selectedWorkshop.enrollment.status : 'Not Enrolled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled Students:</span>
                        <span className="font-medium">{selectedWorkshop.enrolledStudents}/{selectedWorkshop.maxStudents}</span>
                      </div>
                      {selectedWorkshop.enrollment && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enrolled At:</span>
                          <span className="font-medium">{formatDate(selectedWorkshop.enrollment.enrolledAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mandatory:</span>
                        <span className="font-medium">{selectedWorkshop.isMandatory ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      // Navigate to certificate submission with pre-filled workshop data
                      const params = new URLSearchParams({
                        courseName: selectedWorkshop.title,
                        courseProvider: selectedWorkshop.instructor,
                        courseLink: selectedWorkshop.meetingLink || '',
                        courseType: 'workshop',
                        description: selectedWorkshop.description
                      });
                      window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                    }}
                    className="flex-1"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Submit Certificate
                  </Button>
                  {selectedWorkshop.meetingLink && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedWorkshop.meetingLink, '_blank')}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedWorkshop(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
