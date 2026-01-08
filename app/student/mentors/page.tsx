'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin,
  Link,
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Download,
  User,
  Building,
  Award,
  Target,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Mentor {
  id: number;
  name: string;
  email: string;
  company: string;
  position: string;
  industry: string;
  experience: number;
  expertise: string[];
  bio?: string;
  profileImage?: string;
  timezone: string;
  assignment: {
    id: number;
    assignedAt: string;
    goals?: string;
    notes?: string;
  };
}

interface MentorMeeting {
  id: number;
  title: string;
  description?: string;
  meetingType: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  location?: string;
  status: string;
  agenda?: string;
  notes?: string;
  feedback?: string;
  studentFeedback?: string;
  rating?: number;
  mentor: {
    id: number;
    name: string;
    company: string;
    position: string;
  };
}

export default function StudentMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [meetings, setMeetings] = useState<MentorMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'mentors' | 'meetings'>('mentors');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mentorsResponse, meetingsResponse] = await Promise.all([
        api.get('/student/mentors'),
        api.get('/student/mentor-meetings')
      ]);
      
      if (mentorsResponse.data.success) {
        setMentors(mentorsResponse.data.mentors);
      }
      
      if (meetingsResponse.data.success) {
        setMeetings(meetingsResponse.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'rescheduled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  const isOverdue = (scheduledAt: string, status: string) => {
    return new Date(scheduledAt) < new Date() && status === 'scheduled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Industry Mentors</h1>
          <p className="text-gray-600 mt-2">Connect with industry professionals and schedule meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">{mentors.length} mentors assigned</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{mentors.length}</div>
                <div className="text-sm text-gray-600">Assigned Mentors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {meetings.filter(m => m.status === 'scheduled' && isUpcoming(m.scheduledAt)).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming Meetings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {meetings.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed Meetings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {meetings.filter(m => m.rating).length > 0 
                    ? (meetings.filter(m => m.rating).reduce((acc, m) => acc + (m.rating || 0), 0) / meetings.filter(m => m.rating).length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'mentors' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('mentors')}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          My Mentors
        </Button>
        <Button
          variant={selectedTab === 'meetings' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('meetings')}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Meetings
        </Button>
      </div>

      {/* Mentors Tab */}
      {selectedTab === 'mentors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {mentor.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Building className="w-4 h-4" />
                      <span>{mentor.position} at {mentor.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{mentor.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Industry & Expertise */}
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {mentor.industry}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Assignment Info */}
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Assigned: {formatDate(mentor.assignment.assignedAt)}</span>
                      </div>
                      {mentor.assignment.goals && (
                        <div className="text-xs text-gray-500 mt-1">
                          <strong>Goals:</strong> {mentor.assignment.goals}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meetings Tab */}
      {selectedTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meeting.title}
                      </h3>
                      <Badge className={getStatusColor(meeting.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(meeting.status)}
                          {meeting.status}
                        </div>
                      </Badge>
                      {isOverdue(meeting.scheduledAt, meeting.status) && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{meeting.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Meeting Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(meeting.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(meeting.scheduledAt)} ({meeting.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getMeetingTypeIcon(meeting.meetingType)}
                          <span className="capitalize">{meeting.meetingType} meeting</span>
                        </div>
                      </div>

                      {/* Mentor Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{meeting.mentor.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4" />
                          <span>{meeting.mentor.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>{meeting.mentor.position}</span>
                        </div>
                      </div>

                      {/* Meeting Actions */}
                      <div className="space-y-2">
                        {meeting.meetingLink && (
                          <Button size="sm" className="w-full">
                            <Play className="w-4 h-4 mr-1" />
                            Join Meeting
                          </Button>
                        )}
                        {meeting.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        {meeting.agenda && (
                          <Button size="sm" variant="outline" className="w-full">
                            <BookOpen className="w-4 h-4 mr-1" />
                            View Agenda
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {meeting.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t">
                        {meeting.feedback && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Mentor Feedback</h4>
                            <p className="text-sm text-gray-600">{meeting.feedback}</p>
                          </div>
                        )}
                        {meeting.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < meeting.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty States */}
      {selectedTab === 'mentors' && mentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentors Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any industry mentors assigned yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your faculty to get industry mentors assigned to your career path.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'meetings' && meetings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meetings Scheduled</h3>
            <p className="text-gray-600 mb-4">
              You don't have any mentor meetings scheduled yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your assigned mentors to schedule meetings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
