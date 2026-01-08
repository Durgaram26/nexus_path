'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users,
  Video,
  MapPin,
  Link,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building,
  User,
  Target,
  BookOpen,
  Star
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
  createdAt: string;
  attendees: {
    id: number;
    student: {
      id: number;
      name: string;
      email: string;
    };
    status: string;
    attendedAt: string;
  }[];
  feedback: {
    id: number;
    student: {
      id: number;
      name: string;
    };
    rating: number;
    feedback?: string;
    submittedAt: string;
  }[];
}

export default function MentorTalksPage() {
  const [talks, setTalks] = useState<MentorTalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingTalk, setEditingTalk] = useState<MentorTalk | null>(null);
  const [selectedTalk, setSelectedTalk] = useState<MentorTalk | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    speakerName: '',
    company: '',
    designation: '',
    topic: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    mode: 'online',
    meetingLink: '',
    venue: '',
    maxAttendees: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/mentor-talks');
      
      if (response.data.success) {
        setTalks(response.data.talks || []);
      } else {
        console.error('API Error:', response.data);
        throw new Error(response.data.message || 'Failed to fetch talks');
      }
    } catch (error) {
      console.error('Error fetching talks:', error);
      console.error('Error details:', error);
      toast.error('Failed to load mentor talks. Please try again.');
      // Set empty array as fallback
      setTalks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title || !createForm.speakerName || !createForm.company || !createForm.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/faculty/mentor-talks', createForm);
      
      if (response.data.success) {
        toast.success('Mentor talk created successfully');
        setShowCreateForm(false);
        setCreateForm({
          title: '',
          speakerName: '',
          company: '',
          designation: '',
          topic: '',
          description: '',
          scheduledDate: '',
          scheduledTime: '',
          mode: 'online',
          meetingLink: '',
          venue: '',
          maxAttendees: '',
          assignedTo: ''
        });
        fetchTalks();
      } else {
        throw new Error('Failed to create talk');
      }
    } catch (error) {
      console.error('Error creating talk:', error);
      toast.error('Failed to create mentor talk');
    }
  };

  const handleEditTalk = (talk: MentorTalk) => {
    setEditingTalk(talk);
    setCreateForm({
      title: talk.title,
      speakerName: talk.speakerName,
      company: talk.company,
      designation: talk.designation,
      topic: talk.topic,
      description: talk.description || '',
      scheduledDate: talk.scheduledDate.split('T')[0], // Convert to YYYY-MM-DD format
      scheduledTime: talk.scheduledTime,
      mode: talk.mode,
      meetingLink: talk.meetingLink || '',
      venue: talk.venue || '',
      maxAttendees: talk.maxAttendees?.toString() || '',
      assignedTo: talk.assignedTo || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title || !createForm.speakerName || !createForm.company || !createForm.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingTalk) return;

    try {
      const response = await api.put(`/faculty/mentor-talks/${editingTalk.id}`, createForm);
      
      if (response.data.success) {
        toast.success('Mentor talk updated successfully');
        setShowEditForm(false);
        setEditingTalk(null);
        setCreateForm({
          title: '',
          speakerName: '',
          company: '',
          designation: '',
          topic: '',
          description: '',
          scheduledDate: '',
          scheduledTime: '',
          mode: 'online',
          meetingLink: '',
          venue: '',
          maxAttendees: '',
          assignedTo: ''
        });
        fetchTalks();
      } else {
        throw new Error('Failed to update talk');
      }
    } catch (error) {
      console.error('Error updating talk:', error);
      toast.error('Failed to update mentor talk');
    }
  };

  const handleDeleteTalk = async (talkId: number) => {
    if (!confirm('Are you sure you want to delete this mentor talk? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/faculty/mentor-talks/${talkId}`);
      
      if (response.data.success) {
        toast.success('Mentor talk deleted successfully');
        fetchTalks();
      } else {
        throw new Error('Failed to delete talk');
      }
    } catch (error) {
      console.error('Error deleting talk:', error);
      toast.error('Failed to delete mentor talk');
    }
  };

  const handleViewDetails = (talk: MentorTalk) => {
    setSelectedTalk(talk);
    setShowDetailsModal(true);
  };

  const filteredTalks = talks.filter(talk => {
    const matchesSearch = !searchTerm || 
      talk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talk.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talk.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talk.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || talk.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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

  const isUpcoming = (scheduledDate: string) => {
    return new Date(scheduledDate) > new Date();
  };

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
          <p className="text-gray-600 mt-2">Create and manage industry expert sessions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Talk
        </Button>
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
                  {talks.filter(t => t.status === 'scheduled' && isUpcoming(t.scheduledDate)).length}
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
                  {talks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {talks.reduce((acc, t) => acc + t.currentAttendees, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Attendees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search talks by title, speaker, company, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border rounded h-10 px-3 bg-white"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <span>{talk.scheduledTime}</span>
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
                    <span>Assigned to: {talk.assignedTo}</span>
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

                {/* Feedback */}
                {talk.feedback.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Feedback</span>
                      <span className="font-medium">
                        {talk.feedback.length} responses
                      </span>
                    </div>
                    {talk.feedback.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {(talk.feedback.reduce((acc, f) => acc + f.rating, 0) / talk.feedback.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({talk.feedback.length} ratings)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(talk)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditTalk(talk)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteTalk(talk.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentor Talks</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus 
                ? 'No talks match your search criteria.' 
                : 'No industry mentor talks have been created yet.'
              }
            </p>
            {!searchTerm && !filterStatus && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Talk
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Talk Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Mentor Talk</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTalk} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Talk Title *</Label>
                    <Input
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerName">Speaker Name *</Label>
                    <Input
                      id="speakerName"
                      value={createForm.speakerName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, speakerName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={createForm.company}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, designation: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    value={createForm.topic}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, topic: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded h-20"
                    placeholder="Brief description of the talk..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={createForm.scheduledDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledTime">Time *</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={createForm.scheduledTime}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <select
                    id="mode"
                    value={createForm.mode}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full border rounded h-10 px-3 bg-white"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {createForm.mode === 'online' && (
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input
                      id="meetingLink"
                      value={createForm.meetingLink}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                {createForm.mode === 'offline' && (
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={createForm.venue}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Conference Room A, Building 1"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={createForm.maxAttendees}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
                    <Input
                      id="assignedTo"
                      value={createForm.assignedTo}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Year 2, Computer Science"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Create Talk
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Talk Modal */}
      {showEditForm && editingTalk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Mentor Talk</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTalk(null);
                    setCreateForm({
                      title: '',
                      speakerName: '',
                      company: '',
                      designation: '',
                      topic: '',
                      description: '',
                      scheduledDate: '',
                      scheduledTime: '',
                      mode: 'online',
                      meetingLink: '',
                      venue: '',
                      maxAttendees: '',
                      assignedTo: ''
                    });
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateTalk} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Talk Title *</Label>
                    <Input
                      id="edit-title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-speakerName">Speaker Name *</Label>
                    <Input
                      id="edit-speakerName"
                      value={createForm.speakerName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, speakerName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-company">Company *</Label>
                    <Input
                      id="edit-company"
                      value={createForm.company}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-designation">Designation</Label>
                    <Input
                      id="edit-designation"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, designation: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-topic">Topic *</Label>
                  <Input
                    id="edit-topic"
                    value={createForm.topic}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, topic: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded h-20"
                    placeholder="Brief description of the talk..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-scheduledDate">Date *</Label>
                    <Input
                      id="edit-scheduledDate"
                      type="date"
                      value={createForm.scheduledDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-scheduledTime">Time *</Label>
                    <Input
                      id="edit-scheduledTime"
                      type="time"
                      value={createForm.scheduledTime}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-mode">Mode *</Label>
                  <select
                    id="edit-mode"
                    value={createForm.mode}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full border rounded h-10 px-3 bg-white"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {createForm.mode === 'online' && (
                  <div>
                    <Label htmlFor="edit-meetingLink">Meeting Link</Label>
                    <Input
                      id="edit-meetingLink"
                      value={createForm.meetingLink}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                {createForm.mode === 'offline' && (
                  <div>
                    <Label htmlFor="edit-venue">Venue</Label>
                    <Input
                      id="edit-venue"
                      value={createForm.venue}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Conference Room A, Building 1"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-maxAttendees">Max Attendees (Optional)</Label>
                    <Input
                      id="edit-maxAttendees"
                      type="number"
                      value={createForm.maxAttendees}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-assignedTo">Assigned To (Optional)</Label>
                    <Input
                      id="edit-assignedTo"
                      value={createForm.assignedTo}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="Year 2, Computer Science"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingTalk(null);
                      setCreateForm({
                        title: '',
                        speakerName: '',
                        company: '',
                        designation: '',
                        topic: '',
                        description: '',
                        scheduledDate: '',
                        scheduledTime: '',
                        mode: 'online',
                        meetingLink: '',
                        venue: '',
                        maxAttendees: '',
                        assignedTo: ''
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Update Talk
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedTalk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Mentor Talk Details</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTalk(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Talk Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Talk Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Title</Label>
                        <p className="text-gray-900">{selectedTalk.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Topic</Label>
                        <p className="text-gray-900">{selectedTalk.topic}</p>
                      </div>
                      {selectedTalk.description && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Description</Label>
                          <p className="text-gray-900">{selectedTalk.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Speaker Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Speaker Name</Label>
                        <p className="text-gray-900">{selectedTalk.speakerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Company</Label>
                        <p className="text-gray-900">{selectedTalk.company}</p>
                      </div>
                      {selectedTalk.designation && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Designation</Label>
                          <p className="text-gray-900">{selectedTalk.designation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule & Location</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Date</Label>
                          <p className="text-gray-900">{formatDate(selectedTalk.scheduledDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Time</Label>
                          <p className="text-gray-900">{selectedTalk.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTalk.mode === 'online' ? (
                          <Video className="w-4 h-4 text-gray-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-gray-600" />
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            {selectedTalk.mode === 'online' ? 'Meeting Link' : 'Venue'}
                          </Label>
                          <p className="text-gray-900">
                            {selectedTalk.mode === 'online' 
                              ? (selectedTalk.meetingLink || 'No link provided')
                              : (selectedTalk.venue || 'No venue specified')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Status & Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedTalk.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedTalk.status)}
                            {selectedTalk.status}
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {selectedTalk.mode}
                        </Badge>
                      </div>
                      {selectedTalk.assignedTo && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                          <p className="text-gray-900">{selectedTalk.assignedTo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance & Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Attendees</span>
                      <span className="font-medium">
                        {selectedTalk.currentAttendees}
                        {selectedTalk.maxAttendees && `/${selectedTalk.maxAttendees}`}
                      </span>
                    </div>
                    
                    {selectedTalk.maxAttendees && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((selectedTalk.currentAttendees / selectedTalk.maxAttendees) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}

                    {selectedTalk.attendees.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Registered Students</Label>
                        <div className="mt-2 space-y-1">
                          {selectedTalk.attendees.map((attendee) => (
                            <div key={attendee.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900">{attendee.student.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {attendee.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
                  <div className="space-y-3">
                    {selectedTalk.feedback.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Average Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-semibold">
                              {(selectedTalk.feedback.reduce((acc, f) => acc + f.rating, 0) / selectedTalk.feedback.length).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">/ 5.0</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {selectedTalk.feedback.map((feedback) => (
                            <div key={feedback.id} className="border rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{feedback.student.name}</span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-sm ${
                                        i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {feedback.feedback && (
                                <p className="text-sm text-gray-600 mt-1">{feedback.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No feedback received yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTalk(null);
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTalk(null);
                    handleEditTalk(selectedTalk);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Talk
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
