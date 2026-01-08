'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '@/src/components/layout/dashboard-layout';
import StudentSidebar from '@/components/student/StudentSidebar';
import { ArrowLeft, ArrowRight, Clock, Target, BookOpen, Users, Award } from 'lucide-react';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: any[];
  learningPath: string;
  careerOutcomes: any[];
  createdAt: string;
}

interface Student {
  id: number;
  email: string;
  name: string;
  department: {
    id: number;
    name: string;
  };
  year: number;
}

export default function RoadmapDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [certificateSubmissions, setCertificateSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Resolve params Promise
    params.then((resolvedParams) => {
      setRoadmapId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (roadmapId) {
      fetchRoadmapDetails();
      // Fetch student profile in background, don't block roadmap display
      fetchStudentProfile();
      // Fetch certificate submissions to track progress
      fetchCertificateSubmissions();
    }
  }, [roadmapId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      // Don't show error to user as this is not critical for roadmap display
      // The roadmap can still be displayed without student profile
    }
  };

  const fetchCertificateSubmissions = async () => {
    // Certificate submissions API not implemented yet
    setCertificateSubmissions([]);
  };

  // Check if certificate has been submitted for a specific activity
  const getCertificateStatus = (activityTitle: string) => {
    // Since API is not implemented, all activities show as not submitted
    return { status: 'not-submitted', submission: null };
  };

  const fetchRoadmapDetails = async () => {
    try {
      setLoading(true);
      
      // Try to get roadmap from assigned roadmaps first (preferred method)
      try {
        const response = await api.get('/student/assigned-roadmaps');
        
        if (response.data.success && response.data.roadmaps.length > 0) {
          // Find the specific roadmap by ID
          const foundRoadmap = response.data.roadmaps.find((r: any) => r.id === parseInt(roadmapId as string));
          
          if (foundRoadmap) {
            // Parse JSON fields if they're strings
            const parsedRoadmap = {
              ...foundRoadmap,
              milestones: typeof foundRoadmap.milestones === 'string' 
                ? JSON.parse(foundRoadmap.milestones) 
                : foundRoadmap.milestones || [],
              careerOutcomes: typeof foundRoadmap.careerOutcomes === 'string' 
                ? JSON.parse(foundRoadmap.careerOutcomes) 
                : foundRoadmap.careerOutcomes || []
            };
            setRoadmap(parsedRoadmap);
            setProgress(foundRoadmap.progress || 0);
            return; // Success, exit early
          }
        }
      } catch (assignedError) {
        console.log('Could not fetch from assigned roadmaps, trying direct API...');
      }
      
      // Fallback: Try direct API call to roadmap details
      try {
        const response = await api.get(`/api/learning/roadmap-details/${roadmapId}`);
        const roadmapData = response.data.roadmap;
        
        // Parse JSON fields if they're strings
        const parsedRoadmap = {
          ...roadmapData,
          milestones: typeof roadmapData.milestones === 'string' 
            ? JSON.parse(roadmapData.milestones) 
            : roadmapData.milestones || [],
          careerOutcomes: typeof roadmapData.careerOutcomes === 'string' 
            ? JSON.parse(roadmapData.careerOutcomes) 
            : roadmapData.careerOutcomes || []
        };
        
        setRoadmap(parsedRoadmap);
        setProgress(0); // Default progress for direct access
      } catch (directError) {
        console.error('Both methods failed:', { directError });
        toast.error('Failed to fetch roadmap details. Please try again.');
      }
      
    } catch (error) {
      console.error('Error fetching roadmap details:', error);
      toast.error('Failed to fetch roadmap details');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push('/student/roadmap');
  };


  if (!roadmapId) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Roadmap ID</h1>
            <p className="text-gray-600 mb-4">The roadmap ID is missing or invalid.</p>
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading roadmap details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!roadmap) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Roadmap Not Found</h1>
            <p className="text-gray-600 mb-4">The requested roadmap could not be found.</p>
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={goBack} 
            variant="outline" 
            size="sm" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmaps
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{roadmap.title}</h1>
              <p className="text-gray-600 text-lg">{roadmap.description}</p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-sm">
                {roadmap.careerPath}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {roadmap.studentLevel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Milestone Progress Breakdown */}
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-3">Learning Milestones Progress</h4>
                  <div className={`grid gap-2 ${roadmap.milestones.length <= 4 ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                    {roadmap.milestones.map((milestone: any, index: number) => {
                      const milestoneProgress = Math.min(100, Math.max(0, (progress / roadmap.milestones.length) * 100));
                      const isCompleted = progress >= ((index + 1) / roadmap.milestones.length) * 100;
                      const isActive = index === 0 && progress > 0 && !isCompleted;
                      const isLocked = index > 0 && !isCompleted;
                      
                      return (
                        <div 
                          key={milestone.id || index} 
                          className={`text-center p-3 border rounded-lg ${
                            isCompleted ? 'bg-green-50 border-green-200' : 
                            isActive ? 'bg-blue-50 border-blue-200' : 
                            isLocked ? 'bg-gray-50 border-gray-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`text-lg font-bold ${
                            isCompleted ? 'text-green-600' : 
                            isActive ? 'text-blue-600' : 
                            isLocked ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : isActive ? `${Math.round(milestoneProgress)}%` : '🔒'}
                      </div>
                          <div className={`text-xs ${
                            isCompleted ? 'text-green-600' : 
                            isActive ? 'text-blue-600' : 
                            isLocked ? 'text-gray-400' : 'text-gray-400'
                          }`}>
                            {milestone.title || `Milestone ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                            {isCompleted ? 'Completed' : 
                             isActive ? 'In Progress' : 
                             isLocked ? 'Locked' : 'Not Started'}
                      </div>
                    </div>
                      );
                    })}
                  </div>
                  
                  {progress < (100 / roadmap.milestones.length) && (
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      Complete the first milestone to unlock the next one
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{roadmap.totalDuration}</div>
                  <div className="text-sm text-blue-600">Total Duration</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{roadmap.milestones.length}</div>
                  <div className="text-sm text-green-600">Milestones</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{roadmap.careerOutcomes.length}</div>
                  <div className="text-sm text-purple-600">Career Outcomes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semester Breakdown Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Semester Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(Array.isArray(roadmap.milestones) ? roadmap.milestones : []).map((semester: any, semesterIndex: number) => {
                // Calculate milestone progress based on actual roadmap structure
                const totalMilestones = roadmap.milestones.length;
                const milestoneProgressThreshold = (100 / totalMilestones);
                const isFirstMilestone = semesterIndex === 0;
                const isCompleted = progress >= ((semesterIndex + 1) * milestoneProgressThreshold);
                const isActive = isFirstMilestone && progress > 0 && !isCompleted;
                const isLocked = semesterIndex > 0 && !isCompleted;
                
                // Calculate progress for this specific milestone
                const milestoneProgress = isFirstMilestone ? 
                  Math.min(100, Math.max(0, (progress / milestoneProgressThreshold))) : 
                  (isCompleted ? 100 : 0);
                
                const displayProgress = isLocked ? 0 : milestoneProgress;
                
                
                return (
                  <div key={semester.id || semesterIndex} className={`border rounded-lg p-6 ${isLocked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-xl">{semester.title || `Semester ${semesterIndex + 1}`}</h4>
                          {isCompleted && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              ✅ Completed
                            </Badge>
                          )}
                          {isActive && (
                            <Badge variant="default" className="text-xs bg-blue-500">
                              In Progress
                            </Badge>
                          )}
                          {isFirstMilestone && progress === 0 && !isActive && !isCompleted && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Not Started
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              🔒 Locked
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{semester.description || 'No description available'}</p>
                        
                        {/* Progress for active or completed milestone - only first milestone */}
                        {isFirstMilestone && (isActive || isCompleted) && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Milestone Progress</span>
                              <span className="font-medium">{displayProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                }`}
                                style={{ width: `${displayProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Locked milestone message */}
                        {isLocked && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-700">
                              🔒 Complete the previous milestone to unlock this one
                            </p>
                          </div>
                        )}

                        {/* Semester Activities/Milestones */}
                        {semester.activities && Array.isArray(semester.activities) && semester.activities.length > 0 && (
                          <div>
                            <h5 className="text-lg font-medium text-gray-800 mb-4">Activities & Milestones:</h5>
                            
                            {/* Group activities by category */}
                            {(() => {
                              const filteredActivities = semester.activities.filter((activity: any) => 
                                activity.category !== 'technical-skills' && 
                                activity.category !== 'core-engineering'
                              );
                              
                              // Group activities by category
                              const groupedActivities = filteredActivities.reduce((groups: any, activity: any) => {
                                const category = activity.category || 'other';
                                if (!groups[category]) {
                                  groups[category] = [];
                                }
                                groups[category].push(activity);
                                return groups;
                              }, {});
                              
                              const categoryLabels: { [key: string]: string } = {
                                'online-courses': 'Online Courses',
                                'workshops': 'Workshops',
                                'competitions': 'Competitions',
                                'internships': 'Internships',
                                'mini-projects': 'Mini Projects',
                                'alumni-interaction': 'Alumni Interaction',
                                'assessment': 'Assessments',
                                'profile-building': 'Profile Building',
                                'other': 'Other Activities'
                              };
                              
                              const categoryColors: { [key: string]: string } = {
                                'online-courses': 'blue',
                                'workshops': 'orange',
                                'competitions': 'red',
                                'internships': 'indigo',
                                'mini-projects': 'pink',
                                'alumni-interaction': 'cyan',
                                'assessment': 'yellow',
                                'profile-building': 'teal',
                                'other': 'gray'
                              };
                              
                              return Object.entries(groupedActivities).map(([category, activities]: [string, any]) => (
                                <div key={category} className="mb-6">
                                  {/* Category Header */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-3 h-3 rounded-full bg-${categoryColors[category]}-500`}></div>
                                    <h6 className="text-lg font-semibold text-gray-800">{categoryLabels[category]}</h6>
                                    <span className="text-sm text-gray-500">({activities.length} activities)</span>
                                  </div>
                                  
                                  {/* Activities Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activities.map((activity: any, activityIndex: number) => (
                                      <div key={activity.id || activityIndex} className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                                        {/* Activity Header */}
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex-1">
                                            <h6 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                              {activity.title}
                                            </h6>
                                            
                                            {/* Category Badge */}
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                              categoryColors[category] === 'blue' ? 'bg-blue-100 text-blue-800' :
                                              categoryColors[category] === 'orange' ? 'bg-orange-100 text-orange-800' :
                                              categoryColors[category] === 'red' ? 'bg-red-100 text-red-800' :
                                              categoryColors[category] === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                                              categoryColors[category] === 'pink' ? 'bg-pink-100 text-pink-800' :
                                              categoryColors[category] === 'cyan' ? 'bg-cyan-100 text-cyan-800' :
                                              categoryColors[category] === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                              categoryColors[category] === 'teal' ? 'bg-teal-100 text-teal-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {categoryLabels[category]}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Activity Description */}
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                                        
                                        {/* Activity Details */}
                                        <div className="space-y-3">
                                          {/* Timeline */}
                                    {activity.timeline && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                                              <Clock className="w-3 h-3 text-gray-400" />
                                              <span className="font-medium">{activity.timeline}</span>
                                      </div>
                                    )}
                                    
                                          {/* Expected Outcome */}
                                    {activity.outcome && (
                                            <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                                              <div className="font-medium text-green-800 mb-1">Expected Outcome:</div>
                                              <div>{activity.outcome}</div>
                                      </div>
                                    )}
                                    
                                          {/* Resource Link */}
                                    {activity.link && (
                                      <a 
                                        href={activity.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                              className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                                      >
                                              <span>View Resource</span>
                                              <ArrowRight className="w-3 h-3" />
                                      </a>
                                    )}

                                          {/* Certificate Submission for Online Courses, Workshops, and Internships */}
                                          {(activity.category === 'online-courses' || activity.category === 'workshops' || activity.category === 'internships') && (() => {
                                            const certStatus = getCertificateStatus(activity.title);
                                            const isSubmitted = certStatus.status !== 'not-submitted';
                                            const isApproved = certStatus.status === 'approved';
                                            const isPending = certStatus.status === 'pending';
                                            const isRejected = certStatus.status === 'rejected';
                                            
                                            return (
                                              <div className={`mt-3 p-3 rounded-lg border ${
                                                isApproved ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300' :
                                                isPending ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' :
                                                isRejected ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300' :
                                                'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                                              }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <Award className={`w-4 h-4 ${
                                                      isApproved ? 'text-green-600' :
                                                      isPending ? 'text-yellow-600' :
                                                      isRejected ? 'text-red-600' :
                                                      'text-green-600'
                                                    }`} />
                                                    <span className={`text-sm font-medium ${
                                                      isApproved ? 'text-green-800' :
                                                      isPending ? 'text-yellow-800' :
                                                      isRejected ? 'text-red-800' :
                                                      'text-green-800'
                                                    }`}>
                                                      {isApproved ? 'Certificate Approved' :
                                                       isPending ? 'Certificate Under Review' :
                                                       isRejected ? 'Certificate Rejected' :
                                                       'Certificate Submission Required'}
                                                    </span>
                                                  </div>
                                                  {/* Status Badge */}
                                                  <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                      isApproved ? 'bg-green-500' :
                                                      isPending ? 'bg-yellow-500' :
                                                      isRejected ? 'bg-red-500' :
                                                      'bg-yellow-500'
                                                    }`}></div>
                                                    <span className={`text-xs font-medium ${
                                                      isApproved ? 'text-green-700' :
                                                      isPending ? 'text-yellow-700' :
                                                      isRejected ? 'text-red-700' :
                                                      'text-yellow-700'
                                                    }`}>
                                                      {isApproved ? 'Approved' :
                                                       isPending ? 'Pending' :
                                                       isRejected ? 'Rejected' :
                                                       'Not Submitted'}
                                                    </span>
                                                  </div>
                                                </div>
                                                <p className={`text-xs mb-3 ${
                                                  isApproved ? 'text-green-700' :
                                                  isPending ? 'text-yellow-700' :
                                                  isRejected ? 'text-red-700' :
                                                  'text-green-700'
                                                }`}>
                                                  {isApproved ? 
                                                    `✅ Certificate approved! This ${activity.category === 'online-courses' ? 'course' : activity.category === 'workshops' ? 'workshop' : 'internship'} has been completed and verified.` :
                                                    isPending ? 
                                                    `⏳ Certificate under review. Faculty is evaluating your submission for this ${activity.category === 'online-courses' ? 'course' : activity.category === 'workshops' ? 'workshop' : 'internship'}.` :
                                                    isRejected ? 
                                                    `❌ Certificate rejected. Please review feedback and resubmit for this ${activity.category === 'online-courses' ? 'course' : activity.category === 'workshops' ? 'workshop' : 'internship'}.` :
                                                    `Complete this ${activity.category === 'online-courses' ? 'course' : activity.category === 'workshops' ? 'workshop' : 'internship'} and submit your certificate/completion document for faculty evaluation.`
                                                  }
                                                </p>
                                                <div className="flex gap-2">
                                                  {!isSubmitted && (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        // Navigate to certificate submission with pre-filled data
                                                        const params = new URLSearchParams({
                                                          courseName: activity.title,
                                                          courseProvider: activity.tool || 'Unknown Provider',
                                                          courseLink: activity.link || '',
                                                          courseType: activity.category === 'online-courses' ? 'online-course' : activity.category === 'workshops' ? 'workshop' : 'internship',
                                                          description: activity.description || ''
                                                        });
                                                        window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                                                      }}
                                                      className="text-xs bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                      Submit Certificate
                                                    </Button>
                                                  )}
                                                  {isRejected && (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        // Navigate to certificate submission with pre-filled data for resubmission
                                                        const params = new URLSearchParams({
                                                          courseName: activity.title,
                                                          courseProvider: activity.tool || 'Unknown Provider',
                                                          courseLink: activity.link || '',
                                                          courseType: activity.category === 'online-courses' ? 'online-course' : activity.category === 'workshops' ? 'workshop' : 'internship',
                                                          description: activity.description || ''
                                                        });
                                                        window.open(`/student/certificate-submission?${params.toString()}`, '_blank');
                                                      }}
                                                      className="text-xs bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                      Resubmit Certificate
                                                    </Button>
                                                  )}
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                      // Check submission status
                                                      console.log('Check certificate status for:', activity.title);
                                                    }}
                                                    className="text-xs"
                                                  >
                                                    View Details
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                        
                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Career Outcomes Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Career Outcomes & Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Technical Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Technical Skills
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    // Extract technical skills activities and their tools/skills
                    const technicalActivities: any[] = [];
                    if (Array.isArray(roadmap.milestones)) {
                      roadmap.milestones.forEach((semester: any) => {
                        if (semester.activities && Array.isArray(semester.activities)) {
                          semester.activities.forEach((activity: any) => {
                            // Only include from technical-skills category
                            if (activity.category === 'technical-skills') {
                              technicalActivities.push(activity);
                            }
                          });
                        }
                      });
                    }
                    return technicalActivities.map((activity: any, index: number) => (
                      <div key={activity.id || index} className="border rounded-lg p-3 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">{activity.title}</div>
                            {activity.tool && (
                              <div className="text-xs text-blue-600 mb-1">Tool: {activity.tool}</div>
                            )}
                            {activity.skills && (
                              <div className="text-xs text-gray-600">Skills: {activity.skills}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Core Engineering Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Core Engineering Skills
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    // Extract core engineering activities and their tools/skills
                    const coreActivities: any[] = [];
                    if (Array.isArray(roadmap.milestones)) {
                      roadmap.milestones.forEach((semester: any) => {
                        if (semester.activities && Array.isArray(semester.activities)) {
                          semester.activities.forEach((activity: any) => {
                            // Only include from core-engineering category
                            if (activity.category === 'core-engineering') {
                              coreActivities.push(activity);
                            }
                          });
                        }
                      });
                    }
                    return coreActivities.map((activity: any, index: number) => (
                      <div key={activity.id || index} className="border rounded-lg p-3 hover:bg-green-50 transition-colors">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">{activity.title}</div>
                            {activity.tool && (
                              <div className="text-xs text-green-600 mb-1">Tool: {activity.tool}</div>
                            )}
                            {activity.skills && (
                              <div className="text-xs text-gray-600 mb-1">Skills: {activity.skills}</div>
                            )}
                            {activity.outcome && (
                              <div className="text-xs text-gray-600">Outcome: {activity.outcome}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Activities & Milestones */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Activities & Milestones
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    // Extract activity categories and types from all activities
                    const activityTypes = new Set<string>();
                    if (Array.isArray(roadmap.milestones)) {
                      roadmap.milestones.forEach((semester: any) => {
                        if (semester.activities && Array.isArray(semester.activities)) {
                          semester.activities.forEach((activity: any) => {
                            // Add activity categories (excluding technical-skills and core-engineering)
                            if (activity.category && 
                                activity.category !== 'technical-skills' && 
                                activity.category !== 'core-engineering') {
                              // Convert category names to readable format
                              const categoryLabels: { [key: string]: string } = {
                                'online-courses': 'Online Courses',
                                'workshops': 'Workshops',
                                'competitions': 'Competitions',
                                'internships': 'Internships',
                                'mini-projects': 'Mini Projects',
                                'alumni-interaction': 'Alumni Interaction',
                                'assessment': 'Assessments',
                                'profile-building': 'Profile Building'
                              };
                              activityTypes.add(categoryLabels[activity.category] || activity.category);
                            }
                            // Add tools/platforms from non-technical activities
                            if (activity.tool && 
                                activity.category !== 'technical-skills' && 
                                activity.category !== 'core-engineering') {
                              activityTypes.add(activity.tool);
                            }
                          });
                        }
                      });
                    }
                    return Array.from(activityTypes).map((type: string, index: number) => (
                      <div key={index} className="border rounded-lg p-3 hover:bg-orange-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                          <span className="font-medium text-sm">{type}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Traditional Career Outcomes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Career Outcomes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Array.isArray(roadmap.careerOutcomes) ? roadmap.careerOutcomes : []).map((outcome: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
                        <span className="font-medium">{outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={goBack}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmaps
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
