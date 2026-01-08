'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Search,
  Filter,
  Users,
  Building,
  Award,
  Star,
  User,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface IndustryMentor {
  id: number;
  name: string;
  email: string;
  company: string;
  position: string;
  industry: string;
  experience: number;
  expertise: string[];
  bio?: string;
  isActive: boolean;
  maxStudents: number;
  currentStudents: number;
  timezone: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  registerNumber: string;
  year: number;
  department: {
    name: string;
  };
  careerPaths: {
    careerPath: {
      name: string;
    };
  }[];
}

export default function AssignMentorPage() {
  const [mentors, setMentors] = useState<IndustryMentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<IndustryMentor | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    goals: '',
    notes: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mentorsResponse, studentsResponse] = await Promise.all([
        api.get('/faculty/mentors'),
        api.get('/faculty/students')
      ]);
      
      if (mentorsResponse.data.success) {
        setMentors(mentorsResponse.data.mentors);
      }
      
      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.students);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchTerm || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = !filterIndustry || mentor.industry === filterIndustry;
    
    return matchesSearch && matchesIndustry && mentor.isActive;
  });

  const uniqueIndustries = [...new Set(mentors.map(m => m.industry))];

  const handleMentorSelect = (mentor: IndustryMentor) => {
    setSelectedMentor(mentor);
    setSelectedStudents([]);
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignMentor = async () => {
    if (!selectedMentor || selectedStudents.length === 0) {
      toast.error('Please select a mentor and at least one student');
      return;
    }

    if (selectedMentor.currentStudents + selectedStudents.length > selectedMentor.maxStudents) {
      toast.error(`Mentor can only handle ${selectedMentor.maxStudents} students. Currently has ${selectedMentor.currentStudents}.`);
      return;
    }

    setAssigning(true);
    try {
      const assignments = selectedStudents.map(studentId => ({
        mentorId: selectedMentor.id,
        studentId: studentId,
        goals: assignmentData.goals.trim() || null,
        notes: assignmentData.notes.trim() || null,
        startDate: assignmentData.startDate || new Date().toISOString(),
        endDate: assignmentData.endDate || null
      }));

      const response = await api.post('/faculty/mentors/assign', {
        assignments: assignments
      });

      if (response.data.success) {
        toast.success(`Mentor assigned to ${selectedStudents.length} students successfully`);
        setSelectedMentor(null);
        setSelectedStudents([]);
        setAssignmentData({
          goals: '',
          notes: '',
          startDate: '',
          endDate: ''
        });
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast.error('Failed to assign mentor');
    } finally {
      setAssigning(false);
    }
  };

  const getAvailabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentors and students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Industry Mentor</h1>
          <p className="text-gray-600 mt-1">Connect students with industry professionals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentors Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Available Mentors
              </CardTitle>
              <div className="text-sm text-gray-600">
                {filteredMentors.length} mentors
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search mentors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full border rounded h-10 px-3 bg-white"
                >
                  <option value="">All Industries</option>
                  {uniqueIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mentors List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMentor?.id === mentor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleMentorSelect(mentor)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                        <p className="text-sm text-gray-600">{mentor.position} at {mentor.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {mentor.industry}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {mentor.experience} years exp
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${getAvailabilityColor(mentor.currentStudents, mentor.maxStudents)}`}>
                          {mentor.currentStudents}/{mentor.maxStudents}
                        </div>
                        <div className="text-xs text-gray-500">students</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Select Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedMentor ? (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Selected Mentor</h3>
                    <p className="text-blue-800">{selectedMentor.name} - {selectedMentor.company}</p>
                    <p className="text-sm text-blue-700">
                      Can mentor {selectedMentor.maxStudents - selectedMentor.currentStudents} more students
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-2 border rounded cursor-pointer transition-colors ${
                          selectedStudents.includes(student.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleStudentToggle(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {student.department.name}
                              </Badge>
                              <span className="text-xs text-gray-500">Year {student.year}</span>
                            </div>
                          </div>
                          {selectedStudents.includes(student.id) && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assignment Details */}
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <Label htmlFor="goals">Mentoring Goals (Optional)</Label>
                      <textarea
                        id="goals"
                        value={assignmentData.goals}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, goals: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded h-20 text-sm"
                        placeholder="Describe the goals for this mentoring relationship..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Assignment Notes (Optional)</Label>
                      <textarea
                        id="notes"
                        value={assignmentData.notes}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded h-16 text-sm"
                        placeholder="Any additional notes for this assignment..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={assignmentData.startDate}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={assignmentData.endDate}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assign Button */}
                  <Button
                    onClick={handleAssignMentor}
                    disabled={assigning || selectedStudents.length === 0}
                    className="w-full"
                  >
                    {assigning ? 'Assigning...' : `Assign to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a mentor to assign students</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
