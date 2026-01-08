'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Building, 
  Star,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  UserPlus,
  Target,
  Award,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface IndustryMentor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  industry: string;
  experience: number;
  expertise: string[];
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  maxStudents: number;
  currentStudents: number;
  timezone: string;
  availability: string;
  preferences?: string;
  createdAt: string;
  mentorAssignments: {
    id: number;
    student: {
      id: number;
      name: string;
      email: string;
    };
    assignedAt: string;
    isActive: boolean;
    goals?: string;
  }[];
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<IndustryMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [showAddMentor, setShowAddMentor] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/mentors');
      
      if (response.data.success) {
        setMentors(response.data.mentors);
      } else {
        throw new Error('Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to load mentors');
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
    
    return matchesSearch && matchesIndustry;
  });

  const uniqueIndustries = [...new Set(mentors.map(m => m.industry))];

  const getAvailabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentors...</p>
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
          <p className="text-gray-600 mt-2">Manage industry mentors and student assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAddMentor(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Mentor
          </Button>
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
                <div className="text-sm text-gray-600">Total Mentors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {mentors.filter(m => m.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Mentors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {mentors.reduce((acc, m) => acc + m.currentStudents, 0)}
                </div>
                <div className="text-sm text-gray-600">Students Mentored</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{uniqueIndustries.length}</div>
                <div className="text-sm text-gray-600">Industries</div>
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
                placeholder="Search mentors by name, company, industry, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {mentor.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building className="w-4 h-4" />
                    <span>{mentor.position} at {mentor.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{mentor.experience} years experience</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={mentor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {mentor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {mentor.industry}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{mentor.email}</span>
                  </div>
                  {mentor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{mentor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Expertise */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Expertise</h4>
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

                {/* Student Capacity */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Student Capacity</span>
                    <span className={`font-medium ${getAvailabilityColor(mentor.currentStudents, mentor.maxStudents)}`}>
                      {mentor.currentStudents}/{mentor.maxStudents}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        mentor.currentStudents / mentor.maxStudents >= 0.9 ? 'bg-red-500' :
                        mentor.currentStudents / mentor.maxStudents >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${(mentor.currentStudents / mentor.maxStudents) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Current Students */}
                {mentor.mentorAssignments.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Current Students</h4>
                    <div className="space-y-1">
                      {mentor.mentorAssignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">{assignment.student.name}</span>
                        </div>
                      ))}
                      {mentor.mentorAssignments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{mentor.mentorAssignments.length - 2} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign Student
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentors Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterIndustry 
                ? 'No mentors match your search criteria.' 
                : 'No industry mentors have been added yet.'
              }
            </p>
            {!searchTerm && !filterIndustry && (
              <Button onClick={() => setShowAddMentor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Mentor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
