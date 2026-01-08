'use client';

import { useState, use, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search,
  Users,
  UserCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ExistingStudent {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  registerNumber: string;
  year: number;
  department: {
    name: string;
  };
  careerPaths: {
    id: number;
    careerPath: {
      id: number;
      name: string;
    };
  }[];
}

export default function AddStudent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [existingStudents, setExistingStudents] = useState<ExistingStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ExistingStudent | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    careerPath: '',
    showFilters: false
  });

  // Load existing students on component mount
  useEffect(() => {
    fetchExistingStudents();
  }, []);

  const fetchExistingStudents = async () => {
    try {
      // Get students from the database via the existing students API
      const response = await api.get('/faculty/students');
      if (response.data.success) {
        setExistingStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // If API doesn't exist, fetch from database directly
      try {
        const response = await api.get('/api/student');
        if (response.data.success) {
          setExistingStudents(response.data.students);
        }
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
        // Fallback to empty array - no mock data
        setExistingStudents([]);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelectStudent = (student: ExistingStudent) => {
    // Toggle selection - if already selected, unselect
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null);
    } else {
      setSelectedStudent(student);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      year: '',
      careerPath: '',
      showFilters: false
    });
    setSearchTerm('');
  };

  const filteredStudents = existingStudents.filter(student => {
    // Search filter
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Department filter
    const matchesDepartment = !filters.department || 
      student.department.name.toLowerCase().includes(filters.department.toLowerCase());
    
    // Year filter
    const matchesYear = !filters.year || 
      student.year.toString() === filters.year;
    
    // Career Path filter
    const matchesCareerPath = !filters.careerPath || 
      student.careerPaths.some(cp => 
        cp.careerPath.name.toLowerCase().includes(filters.careerPath.toLowerCase())
      );
    
    return matchesSearch && matchesDepartment && matchesYear && matchesCareerPath;
  });

  // Get unique departments, years, and career paths for filter options
  const uniqueDepartments = [...new Set(existingStudents.map(s => s.department.name))];
  const uniqueYears = [...new Set(existingStudents.map(s => s.year))].sort();
  const uniqueCareerPaths = [...new Set(
    existingStudents.flatMap(s => s.careerPaths.map(cp => cp.careerPath.name))
  )].sort();

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student to assign');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/faculty/courses/${resolvedParams.id}/students`, {
        name: selectedStudent.name,
        email: selectedStudent.email,
        phone: selectedStudent.phoneNumber || '',
        studentId: selectedStudent.registerNumber,
        enrollmentDate: new Date().toISOString(),
        status: 'enrolled',
        assignmentsCompleted: 0,
        totalAssignments: 0,
        lastActivity: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Student assigned successfully');
        router.push(`/faculty/course-management/${resolvedParams.id}/students`);
      } else {
        throw new Error('Failed to assign student');
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      
      // Check if it's a 404 error (API not implemented)
      if (error.response?.status === 404) {
        toast.info('Assign student API is not yet implemented. This is a preview of the interface.');
        // Simulate success for demo purposes
        setTimeout(() => {
          router.push(`/faculty/course-management/${resolvedParams.id}/students`);
        }, 1000);
      } else {
        toast.error('Failed to assign student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/faculty/course-management/${resolvedParams.id}/students`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-gray-900">Assign Student</h1>
            <p className="text-gray-600 mt-2">Assign an existing student to this course</p>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Select Student to Assign
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {filters.showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            {filters.showFilters && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-600"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Department Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">All Years</option>
                      {uniqueYears.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Career Path Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Career Path</label>
                    <select
                      value={filters.careerPath}
                      onChange={(e) => handleFilterChange('careerPath', e.target.value)}
                      className="border rounded h-10 px-3 w-full bg-white"
                    >
                      <option value="">All Career Paths</option>
                      {uniqueCareerPaths.map((careerPath) => (
                        <option key={careerPath} value={careerPath}>
                          {careerPath}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.department || filters.year || filters.careerPath) && (
                  <div className="flex flex-wrap gap-2">
                    {filters.department && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Dept: {filters.department}
                        <button
                          onClick={() => handleFilterChange('department', '')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.year && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Year: {filters.year}
                        <button
                          onClick={() => handleFilterChange('year', '')}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.careerPath && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        Career: {filters.careerPath}
                        <button
                          onClick={() => handleFilterChange('careerPath', '')}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                {selectedStudent && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedStudent.name} selected
                  </span>
                )}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedStudent?.id === student.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        {selectedStudent?.id === student.id && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>ID: {student.registerNumber}</span>
                        <span>Year: {student.year}</span>
                        <span>Dept: {student.department.name}</span>
                      </div>
                      {student.careerPaths.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {student.careerPaths.map((cp) => (
                            <span
                              key={cp.id}
                              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                            >
                              {cp.careerPath.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`transition-colors ${
                      selectedStudent?.id === student.id 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                    }`}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No students found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedStudent}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              {loading ? 'Assigning...' : 'Assign Student'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <h3 className="font-semibold text-gray-900">Important Notes:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Select an existing student from the list above</li>
              <li>The student will be automatically enrolled in the course</li>
              <li>An email notification will be sent to the student's email address</li>
              <li>The student will start with 0 completed assignments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}