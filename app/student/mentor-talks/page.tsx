'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin,
  Link,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Building,
  User,
  Target,
  BookOpen,
  MessageSquare,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface MentorTalk {
  id: number;
  title: string;
  speakerName: string;
  company: string;
  designation: string;
  topic: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  mode: string;
  meetingLink?: string;
  venue?: string;
  maxAttendees?: number;
  currentAttendees: number;
  status: string;
  assignedTo?: string;
  isRegistered: boolean;
  feedback?: {
    id: number;
    rating: number;
    feedback?: string;
    submittedAt: string;
  };
}

export default function StudentMentorTalksPage() {
  const [talks, setTalks] = useState<MentorTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTalk, setSelectedTalk] = useState<MentorTalk | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    feedback: ''
  });

  useEffect(() => {
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/mentor-talks');
      
      if (response.data.success) {
        setTalks(response.data.talks);
      } else {
        throw new Error('Failed to fetch talks');
      }
    } catch (error) {
      console.error('Error fetching talks:', error);
      toast.error('Failed to load mentor talks');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (talkId: number) => {
    try {
      const response = await api.post(`/student/mentor-talks/${talkId}/register`);
      
      if (response.data.success) {
        toast.success('Successfully registered for the talk');
        fetchTalks(); // Refresh talks
      } else {
        throw new Error('Failed to register');
      }
    } catch (error) {
      console.error('Error registering for talk:', error);
      toast.error('Failed to register for the talk');
    }
  };

  const handleSubmitFeedback = async (talkId: number) => {
    if (feedbackForm.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      const response = await api.post(`/student/mentor-talks/${talkId}/feedback`, feedbackForm);
      
      if (response.data.success) {
        toast.success('Feedback submitted successfully');
        setSelectedTalk(null);
        setFeedbackForm({ rating: 0, feedback: '' });
        fetchTalks(); // Refresh talks
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (scheduledDate: string) => {
    return new Date(scheduledDate) > new Date();
  };

  const isPast = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date();
  };

  const filteredTalks = talks.filter(talk => {
    if (selectedTab === 'upcoming') {
      return isUpcoming(talk.scheduledDate) && talk.status === 'scheduled';
    } else {
      return isPast(talk.scheduledDate) || talk.status === 'completed';
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor talks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Industry Mentor Talks</h1>
          <p className="text-gray-600 mt-2">Join industry expert sessions and gain insights</p>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">{talks.length} talks available</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{talks.length}</div>
                <div className="text-sm text-gray-600">Total Talks</div>
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
                  {talks.filter(t => isUpcoming(t.scheduledDate) && t.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
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
                  {talks.filter(t => t.isRegistered).length}
                </div>
                <div className="text-sm text-gray-600">Registered</div>
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
                  {talks.filter(t => t.feedback).length}
                </div>
                <div className="text-sm text-gray-600">Feedback Given</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'upcoming' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('upcoming')}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Upcoming Talks
        </Button>
        <Button
          variant={selectedTab === 'past' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('past')}
          className="flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Past Talks
        </Button>
      </div>

      {/* Talks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalks.map((talk) => (
          <Card key={talk.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {talk.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span>{talk.speakerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{talk.designation} at {talk.company}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={getStatusColor(talk.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(talk.status)}
                      {talk.status}
                    </div>
                  </Badge>
                  <Badge variant="outline">
                    {talk.mode}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Topic */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Topic</h4>
                  <p className="text-sm text-gray-600">{talk.topic}</p>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(talk.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(talk.scheduledTime)}</span>
                  </div>
                </div>

                {/* Mode-specific info */}
                {talk.mode === 'online' && talk.meetingLink && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="w-4 h-4" />
                    <span className="truncate">{talk.meetingLink}</span>
                  </div>
                )}
                
                {talk.mode === 'offline' && talk.venue && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{talk.venue}</span>
                  </div>
                )}

                {/* Assignment */}
                {talk.assignedTo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>For: {talk.assignedTo}</span>
                  </div>
                )}

                {/* Attendance */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Attendees</span>
                    <span className="font-medium">
                      {talk.currentAttendees}
                      {talk.maxAttendees && `/${talk.maxAttendees}`}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {talk.maxAttendees && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((talk.currentAttendees / talk.maxAttendees) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Registration Status */}
                {selectedTab === 'upcoming' && (
                  <div className="pt-2 border-t">
                    {talk.isRegistered ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Registered</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Not registered</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Status */}
                {selectedTab === 'past' && (
                  <div className="pt-2 border-t">
                    {talk.feedback ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Star className="w-4 h-4" />
                        <span>Feedback submitted ({talk.feedback.rating}/5)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>No feedback yet</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {selectedTab === 'upcoming' ? (
                    <>
                      {!talk.isRegistered ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleRegister(talk.id)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Register
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registered
                        </Button>
                      )}
                      {talk.meetingLink && (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {!talk.feedback ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedTalk(talk)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Give Feedback
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Star className="w-4 h-4 mr-1" />
                          Feedback Given
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTalks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedTab === 'upcoming' ? 'No Upcoming Talks' : 'No Past Talks'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedTab === 'upcoming' 
                ? 'No upcoming mentor talks are scheduled.' 
                : 'You haven\'t attended any mentor talks yet.'
              }
            </p>
            <p className="text-sm text-gray-500">
              Check back later for new industry expert sessions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      {selectedTalk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feedback for "{selectedTalk.title}"</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTalk(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFeedbackForm(prev => ({ ...prev, rating }))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        feedbackForm.rating >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <textarea
                  id="feedback"
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full mt-1 p-2 border rounded h-20"
                  placeholder="Share your thoughts about the talk..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTalk(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitFeedback(selectedTalk.id)}
                  className="flex-1"
                >
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
