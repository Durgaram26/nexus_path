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
  X
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
  status: string;
  startDate: string;
  endDate: string;
  courseType: string;
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

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
  assignedAt: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: string;
  submissions?: AssignmentSubmission[];
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

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use the simplified database API
      const response = await api.get('/student/courses-simple');
      
      if (response.data.success) {
        setCourses(response.data.courses || []);
        setCareerPaths(response.data.careerPaths || []);
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setCourses([]);
      setCareerPaths([]);
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
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Courses assigned through your career roadmap</p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">{courses.length} courses</span>
        </div>
      </div>

      {/* Career Paths Section */}
      {careerPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              My Career Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerPaths.map((careerPath) => (
                <div key={careerPath.id} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-2">{careerPath.name}</h3>
                  {careerPath.description && (
                    <p className="text-sm text-gray-600 mb-3">{careerPath.description}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Assigned: {new Date(careerPath.assignedAt).toLocaleDateString()}</div>
                    {careerPath.assignedByUser && (
                      <div>Assigned by: {careerPath.assignedByUser.name || careerPath.assignedByUser.email}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
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
                  {courses.filter(c => c.enrollment?.status === 'enrolled').length}
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
                  {courses.reduce((acc, c) => acc + (c.assignments?.length || 0), 0)}
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
                  {courses.reduce((acc, c) => {
                    const overdue = c.assignments?.filter(a => 
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCourse(course)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  {course.enrollment && (
                    <Badge className={getStatusColor(course.enrollment.status)}>
                      {course.enrollment.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Course Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{course.instructor}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                </div>

                {course.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{course.location}</span>
                  </div>
                )}

                {/* Assignment Status */}
                {course.assignments && course.assignments.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assignments</span>
                      <span className="font-medium">
                        {course.assignments.filter(a => 
                          getSubmissionStatus(a) === 'graded'
                        ).length}/{course.assignments.length}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(course.assignments.filter(a => 
                            getSubmissionStatus(a) === 'graded'
                          ).length / course.assignments.length) * 100}%` 
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
                      setSelectedCourse(course);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    View Course
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // Navigate to certificate submission with pre-filled course data
                      const params = new URLSearchParams({
                        courseName: course.title,
                        courseProvider: course.instructor,
                        courseLink: course.meetingLink || '',
                        courseType: 'online-course',
                        description: course.description
                      });
                      window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                    }}
                    title="Submit Certificate for this Course"
                  >
                    <Award className="w-4 h-4" />
                  </Button>
                  {course.meetingLink && (
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
      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any courses assigned through your career roadmap yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your faculty to get courses assigned to your roadmap.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Course Details</h2>
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Course Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedCourse.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{selectedCourse.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedCourse.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedCourse.startDate)} - {formatDate(selectedCourse.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getLevelColor(selectedCourse.level)}>
                      {selectedCourse.level}
                    </Badge>
                    <Badge variant="outline">
                      {selectedCourse.category}
                    </Badge>
                    {selectedCourse.enrollment && (
                      <Badge className={getStatusColor(selectedCourse.enrollment.status)}>
                        {selectedCourse.enrollment.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Course Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium">{selectedCourse.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{selectedCourse.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedCourse.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedCourse.courseType}</span>
                      </div>
                      {selectedCourse.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedCourse.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Enrollment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedCourse.enrollment ? selectedCourse.enrollment.status : 'Not Enrolled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled Students:</span>
                        <span className="font-medium">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}</span>
                      </div>
                      {selectedCourse.enrollment && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enrolled At:</span>
                          <span className="font-medium">{formatDate(selectedCourse.enrollment.enrolledAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mandatory:</span>
                        <span className="font-medium">{selectedCourse.isMandatory ? 'Yes' : 'No'}</span>
                      </div>
                      {selectedCourse.enrollment && selectedCourse.enrollment.grade && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium">{selectedCourse.enrollment.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignments Section */}
                {selectedCourse.assignments && selectedCourse.assignments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Assignments</h4>
                    <div className="space-y-3">
                      {selectedCourse.assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Due: {formatDate(assignment.dueDate)}</span>
                                <span>Points: {assignment.maxPoints}</span>
                                <span className={assignment.isMandatory ? 'text-red-600' : 'text-gray-500'}>
                                  {assignment.isMandatory ? 'Mandatory' : 'Optional'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge variant="outline" className={getStatusColor(getSubmissionStatus(assignment))}>
                                {getSubmissionStatus(assignment)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      // Navigate to certificate submission with pre-filled course data
                      const params = new URLSearchParams({
                        courseName: selectedCourse.title,
                        courseProvider: selectedCourse.instructor,
                        courseLink: selectedCourse.meetingLink || '',
                        courseType: selectedCourse.courseType,
                        description: selectedCourse.description
                      });
                      window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                    }}
                    className="flex-1"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Submit Certificate
                  </Button>
                  {selectedCourse.meetingLink && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedCourse.meetingLink, '_blank')}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCourse(null)}
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
