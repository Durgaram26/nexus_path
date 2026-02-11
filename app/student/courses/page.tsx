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
  Award,
  X,
  TrendingUp,
  ArrowRight
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
      case 'enrolled': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dropped': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const enrolledCount = courses.filter(c => c.enrollment?.status === 'enrolled').length;
  const totalAssignments = courses.reduce((acc, c) => acc + (c.assignments?.length || 0), 0);
  const overdueCount = courses.reduce((acc, c) => {
    const overdue = c.assignments?.filter(a => getSubmissionStatus(a) === 'overdue').length || 0;
    return acc + overdue;
  }, 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your learning progress and manage course assignments
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{courses.length} Total</span>
        </div>
      </div>

      {/* Career Paths */}
      {careerPaths.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPaths.map((careerPath) => (
            <Card key={careerPath.id} className="border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{careerPath.name}</h3>
                    {careerPath.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{careerPath.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-2">
                      Assigned {new Date(careerPath.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 hover:shadow-lg hover:border-emerald-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{enrolledCount}</div>
            <p className="text-xs text-muted-foreground">Active Enrollments</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 hover:shadow-lg hover:border-purple-300 transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Total Assignments</p>
          </CardContent>
        </Card>

        <Card className={`border transition-all ${overdueCount > 0 ? 'border-orange-300 bg-orange-50/50 hover:shadow-lg hover:shadow-orange-100' : 'border-border/60 hover:shadow-lg'}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-orange-100' : 'bg-slate-50'}`}>
                <AlertCircle className={`w-5 h-5 ${overdueCount > 0 ? 'text-orange-600' : 'text-slate-600'}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${overdueCount > 0 ? 'text-orange-600' : 'text-foreground'}`}>
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Overdue Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="border border-border/60 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedCourse(course)}
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <Badge className={`${getLevelColor(course.level)} text-[10px] shrink-0`}>
                      {course.level}
                    </Badge>
                  </div>

                  {/* Course Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="truncate">{formatDate(course.startDate)}</span>
                    </div>
                  </div>

                  {/* Assignment Progress */}
                  {course.assignments && course.assignments.length > 0 && (
                    <div className="pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {course.assignments.filter(a => getSubmissionStatus(a) === 'graded').length}/{course.assignments.length}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(course.assignments.filter(a => getSubmissionStatus(a) === 'graded').length / course.assignments.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  {course.enrollment && (
                    <div className="flex items-center justify-between pt-2">
                      <Badge className={`${getStatusColor(course.enrollment.status)} text-[10px]`}>
                        {course.enrollment.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                        }}
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Assigned</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You don't have any courses assigned through your career roadmap yet. Contact your faculty to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Course Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Course Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{selectedCourse.title}</h3>
                  <p className="text-muted-foreground">{selectedCourse.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
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
                <div className="flex flex-col gap-2">
                  <Badge className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge variant="outline" className="border-border">
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
                <Card className="border border-border/40">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Course Information</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instructor:</span>
                        <span className="font-medium text-foreground">{selectedCourse.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium text-foreground">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-foreground">{selectedCourse.courseType}</span>
                      </div>
                      {selectedCourse.location && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-foreground">{selectedCourse.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/40">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Enrollment Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-foreground">
                          {selectedCourse.enrollment ? selectedCourse.enrollment.status : 'Not Enrolled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium text-foreground">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}</span>
                      </div>
                      {selectedCourse.enrollment && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enrolled:</span>
                            <span className="font-medium text-foreground">{formatDate(selectedCourse.enrollment.enrolledAt)}</span>
                          </div>
                          {selectedCourse.enrollment.grade && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Grade:</span>
                              <span className="font-semibold text-primary">{selectedCourse.enrollment.grade}%</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mandatory:</span>
                        <span className={`font-medium ${selectedCourse.isMandatory ? 'text-orange-600' : 'text-foreground'}`}>
                          {selectedCourse.isMandatory ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assignments Section */}
              {selectedCourse.assignments && selectedCourse.assignments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Assignments ({selectedCourse.assignments.length})</h4>
                  <div className="space-y-3">
                    {selectedCourse.assignments.map((assignment) => (
                      <Card key={assignment.id} className="border border-border/40 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground text-sm">{assignment.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">{assignment.description}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {formatDate(assignment.dueDate)}
                                </span>
                                <span>Points: {assignment.maxPoints}</span>
                                <span className={assignment.isMandatory ? 'text-orange-600 font-semibold' : ''}>
                                  {assignment.isMandatory ? 'Mandatory' : 'Optional'}
                                </span>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(getSubmissionStatus(assignment))} text-[10px] shrink-0`}>
                              {getSubmissionStatus(assignment)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
