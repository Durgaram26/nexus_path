'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Bell, FileText, Info, Send } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registerNumber: string;
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
}

interface MessageComposerProps {
  facultyId: number;
  onMessageSent?: () => void;
}

export function MessageComposer({ facultyId, onMessageSent }: MessageComposerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  
  // states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('all');

  // Fetch students for individual messaging
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/faculty/assigned-students');
        console.log('Students API response:', response.data);
        const studentsData = response.data.students || [];
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        console.log('Loaded students:', studentsData.length);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      }
    };

    fetchStudents();
  }, []);

  // students based on search and filter criteria
  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(student => 
        student.department.id.toString() === selectedDepartment
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(student => 
        student.year.toString() === selectedYear
      );
    }

    // Career path filter
    if (selectedCareerPath !== 'all') {
      filtered = filtered.filter(student =>
        student.careerPaths.some(cp => cp.careerPath.id.toString() === selectedCareerPath)
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedDepartment, selectedYear, selectedCareerPath]);

  // Get unique departments, years, and career paths for filters
  const getUniqueDepartments = () => {
    const departments = students.map(s => s.department);
    return departments.filter((dept, index, self) => 
      index === self.findIndex(d => d.id === dept.id)
    );
  };

  const getUniqueYears = () => {
    const years = students.map(s => s.year);
    return [...new Set(years)].sort();
  };

  const getUniqueCareerPaths = () => {
    const careerPaths = students.flatMap(s => s.careerPaths.map(cp => cp.careerPath));
    return careerPaths.filter((cp, index, self) => 
      index === self.findIndex(c => c.id === cp.id)
    );
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please fill in both subject and content');
      return;
    }

    if (!isBroadcast && selectedStudents.length === 0) {
      toast.error('Please select at least one or choose broadcast message');
      return;
    }

    setIsLoading(true);

    try {
      const messageData = {
        subject: subject.trim(),
        content: content.trim(),
        messageType,
        priority,
        isBroadcast,
        recipientIds: isBroadcast ? [] : selectedStudents
      };

      await api.post('/faculty/send-message', messageData);
      
      toast.success(
        isBroadcast 
          ? 'Broadcast message sent to all students' 
          : `Message sent to ${selectedStudents.length} (s)`
      );

      // Reset form
      setSubject('');
      setContent('');
      setSelectedStudents([]);
      setIsBroadcast(false);
      setMessageType('general');
      setPriority('normal');

      onMessageSent?.();

    } catch (error) {
      console.error('Error sending message:');
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'reminder':
        return <div className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Send Message</h2>
        </div>
        <p className="text-gray-600">
          Send messages to individual students or broadcast to all students
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Message Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    General
                  </div>
                </SelectItem>
                <SelectItem value="announcement">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Announcement
                  </div>
                </SelectItem>
                <SelectItem value="reminder">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4" />
                    Reminder
                  </div>
                </SelectItem>
                <SelectItem value="assignment">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Assignment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Broadcast Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="broadcast"
            checked={isBroadcast}
            onChange={(e) => {
              setIsBroadcast(e.target.checked);
              if (e.target.checked) {
                setSelectedStudents([]);
              }
            }}
            className="rounded border-gray-300"
          />
          <label htmlFor="broadcast" className="text-sm font-medium flex items-center gap-2">
            <div className="h-4 w-4" />
            Send to all students (Broadcast)
          </label>
        </div>

        {/* Student Selection (only if not broadcast) */}
        {!isBroadcast && (
          <div className="space-y-4">
            <label className="text-sm font-medium">Select Students</label>
            
            {/* Search and Filters */}
            <div className="space-y-3">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Students</label>
                <Input
                  placeholder="Search by name, register number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {getUniqueDepartments().map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {getUniqueYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Career Path */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Career Path</label>
                  <Select value={selectedCareerPath} onValueChange={setSelectedCareerPath}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Career Paths" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Career Paths</SelectItem>
                      {getUniqueCareerPaths().map((cp) => (
                        <SelectItem key={cp.id} value={cp.id.toString()}>
                          {cp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count and clear filters */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
                {(searchTerm || selectedDepartment !== 'all' || selectedYear !== 'all' || selectedCareerPath !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                      setSelectedYear('all');
                      setSelectedCareerPath('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Student List */}
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {students.length === 0 ? 'No students available' : 'No students match the current filters'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.registerNumber} • {student.department.name}
                        </div>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <Button variant="secondary" size="sm">Selected</Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="text-sm text-gray-500">
              {selectedStudents.length} (s) selected out of {filteredStudents.length} shown
            </div>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            placeholder="Enter message subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            placeholder="Enter your message content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full"
          />
        </div>

        {/* Preview */}
        {(subject || content) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {getMessageTypeIcon(messageType)}
                <span className="font-medium">{subject || 'No subject'}</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(priority)}`}>
                  {priority.toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {content || 'No content'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {isBroadcast 
                  ? `Will be sent to all students` 
                  : `Will be sent to ${selectedStudents.length} student(s)`
                }
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || (!subject.trim() || !content.trim())}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
