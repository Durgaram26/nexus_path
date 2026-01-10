'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface College {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  college: College;
}

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
}

interface StudentCareerPath {
  id: number;
  studentId: number; // Fixed missing property name
  careerPathId: number;
  assignedAt: string;
  careerPath: CareerPath;
}

interface Student {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  departmentId: string;
  department: Department;
  year: number;
  registerNumber: string;
  careerPaths: StudentCareerPath[];
}

interface FacultyInfo {
  id: number;
  name: string;
  email: string;
  department: Department;
  canAssignCrossDepartment: boolean;
  allowedDepartments?: string | null; // Fixed missing property name
}

export default function FacultyStudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [facultyInfo, setFacultyInfo] = useState<FacultyInfo | null>(null);
  const [loading, setLoading] = useState(false); // Fixed useState declaration

  // Student CRUD state
  const [showStudentModal, setShowStudentModal] = useState(false); // Fixed useState declaration
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    email: '',
    name: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    departmentId: '',
    year: '',
    registerNumber: ''
  });

  // Career path assignment state
  const [showCareerPathModal, setShowCareerPathModal] = useState(false); // Fixed useState declaration
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCareerPathId, setSelectedCareerPathId] = useState<string>('');
  const [studentCareerPaths, setStudentCareerPaths] = useState<StudentCareerPath[]>([]);

  // Filter and search state
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [searchRegisterNumber, setSearchRegisterNumber] = useState('');

  useEffect(() => {
    fetchFacultyInfo();
    fetchStudents();
    fetchDepartments();
    fetchCareerPaths();
  }, []);

  const fetchFacultyInfo = async () => {
    try {
      console.log('Fetching faculty info...');
      const response = await api.get('/auth/me'); // Fixed API call
      console.log('Faculty info:', response.data);
      setFacultyInfo(response.data);
    } catch (error: unknown) { // Fixed error type annotation
      console.error('Error fetching faculty info:', error);
      toast.error('Failed to fetch faculty information', { 
        description: (error as any)?.response?.data?.message || (error as Error).message 
      });
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      const response = await api.get('/faculty/assigned-students'); // Fixed API call
      console.log('Students:', response.data);
      setStudents(response.data.students || []);
    } catch (error: unknown) { // Fixed error type annotation
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students', { 
        description: (error as any)?.response?.data?.message || (error as Error).message 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await api.get('/department'); // Fixed API call
      console.log('Departments:', response.data);
      setDepartments(response.data);
    } catch (error: unknown) { // Fixed error type annotation
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments', { 
        description: (error as any)?.response?.data?.message || (error as Error).message 
      });
    }
  };

  const fetchCareerPaths = async () => {
    try {
      console.log('Fetching career paths...');
      const response = await api.get('/career-path'); // Fixed API call
      console.log('Career paths:', response.data);
      setCareerPaths(response.data);
    } catch (error: unknown) { // Fixed error type annotation
      console.error('Error fetching career paths:', error);
      toast.error('Failed to fetch career paths', { 
        description: (error as any)?.response?.data?.message || (error as Error).message 
      });
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email || !newStudent.name || !newStudent.departmentId || !newStudent.year || !newStudent.registerNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/student', {
        email: newStudent.email,
        name: newStudent.name,
        gender: newStudent.gender,
        departmentId: newStudent.departmentId,
        year: parseInt(newStudent.year),
        registerNumber: newStudent.registerNumber
      });
      
      toast.success('Student created successfully');
      setNewStudent({
        email: '',
        name: '',
        gender: 'MALE',
        departmentId: '',
        year: '',
        registerNumber: ''
      });
      setShowStudentModal(false);
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create student', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setLoading(true);
    try {
      await api.put(`/student/${editingStudent.id}`, { // Fixed endpoint
        email: editingStudent.email,
        name: editingStudent.name,
        gender: editingStudent.gender,
        departmentId: editingStudent.departmentId,
        year: editingStudent.year,
        registerNumber: editingStudent.registerNumber
      });
      
      toast.success('Student updated successfully');
      setEditingStudent(null);
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update student', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    setLoading(true);
    try {
      await api.delete(`/student/${studentId}`); // Fixed endpoint
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete student', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCareerPathId) return;

    setLoading(true);
    try {
      await api.post(`/student/${selectedStudent.id}/career-path`, { careerPathId: selectedCareerPathId }); // Fixed endpoint
      toast.success('Career path assigned successfully');
      setSelectedCareerPathId('');
      fetchStudentCareerPaths(selectedStudent.id);
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to assign career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCareerPath = async (careerPathId: number) => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      await api.delete(`/student/${selectedStudent.id}/career-path`, { data: { careerPathId } }); // Fixed endpoint
      toast.success('Career path removed successfully');
      fetchStudentCareerPaths(selectedStudent.id);
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to remove career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCareerPaths = async (studentId: number) => { // Added parameter type
    try {
      const response = await api.get(`/student/${studentId}/career-path`);
      setStudentCareerPaths(response.data);
    } catch (error: unknown) {
      console.error('Error fetching career paths:', error);
      toast.error('Failed to fetch career paths');
    }
  };

  const handleOpenCareerPathModal = async (student: Student) => { // Added parameter type
    setSelectedStudent(student);
    setShowCareerPathModal(true);
    await fetchStudentCareerPaths(student.id);
  };

  const handleOpenEditModal = (student: Student) => { // Added parameter type
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setNewStudent({
      email: '',
      name: '',
      gender: 'MALE',
      departmentId: '',
      year: '',
      registerNumber: ''
    });
    setShowStudentModal(true);
  };

  // Filter students based on current filters
  const filteredStudents = students.filter(student => {
    const matchesDepartment = !filterDepartmentId || student.departmentId === filterDepartmentId;
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesRegisterNumber = !searchRegisterNumber || 
      student.registerNumber.toLowerCase().includes(searchRegisterNumber.toLowerCase());
    
    return matchesDepartment && matchesYear && matchesRegisterNumber;
  });

  // Get available departments for faculty (based on cross-department permissions)
  const getAvailableDepartments = () => {
    if (!facultyInfo) return [];
    
    if (facultyInfo.canAssignCrossDepartment) {
      if (facultyInfo.allowedDepartments) {
        const allowedDeptIds = facultyInfo.allowedDepartments.split(',').map(id => id.trim());
        return departments.filter(dept => allowedDeptIds.includes(dept.id));
      }
      return departments; // All departments
    }
    
    return departments.filter(dept => dept.id === facultyInfo.department.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                My Assigned Students
              </div>
            </CardTitle>
            <CardDescription>
              View and manage students assigned to you. You can assign career paths and view details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Faculty Info */}
            {facultyInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Your Access Level</h3>
                <p className="text-sm text-blue-700">
                  Department: {facultyInfo.department.name}
                  {facultyInfo.canAssignCrossDepartment && (
                    <span className="ml-2 text-green-600">
                      • Cross-Department Access Enabled
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="filterDepartment">Filter by Department</Label>
                <select
                  id="filterDepartment"
                  className="border rounded h-10 px-3 w-full"
                  value={filterDepartmentId}
                  onChange={(e) => setFilterDepartmentId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="filterYear">Filter by Year</Label>
                <select
                  id="filterYear"
                  className="border rounded h-10 px-3 w-full"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="searchRegister">Search by Register Number</Label>
                <Input
                  id="searchRegister"
                  placeholder="Enter register number"
                  value={searchRegisterNumber}
                  onChange={(e) => setSearchRegisterNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Students List */}
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map(student => (
                  <Card key={student.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-medium text-lg">{student.name}</h3>
                            <span className="text-sm text-gray-500">#{student.registerNumber}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Year {student.year}
                            </span>
                            <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {student.department.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                          
                          {/* Career Paths */}
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Career Paths:</h4>
                            {student.careerPaths.length === 0 ? (
                              <span className="text-sm text-gray-500">No career paths assigned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {student.careerPaths.map((scp) => (
                                  <span
                                    key={scp.id}
                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                  >
                                    {scp.careerPath.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCareerPathModal(student)}
                          >
                            Manage Career Paths
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenEditModal(student)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal */}
        {showStudentModal && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingStudent.email}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editingStudent.name}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={editingStudent.gender}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={editingStudent.department.name}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={`Year ${editingStudent.year}`}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="registerNumber">Register Number</Label>
                    <Input
                      id="registerNumber"
                      value={editingStudent.registerNumber}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={editingStudent.phoneNumber || 'Not provided'}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowStudentModal(false);
                      setEditingStudent(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Career Path Assignment Modal */}
        {showCareerPathModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Manage Career Paths for {selectedStudent.name}</CardTitle>
                <CardDescription>
                  Assign or remove career paths for this student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Assign New Career Path */}
                  <div>
                    <h3 className="font-medium mb-3">Assign New Career Path</h3>
                    <form onSubmit={handleAssignCareerPath} className="flex gap-2">
                      <select
                        className="border rounded h-10 px-3 flex-1"
                        value={selectedCareerPathId}
                        onChange={(e) => setSelectedCareerPathId(e.target.value)}
                        required
                      >
                        <option value="">Select a Career Path</option>
                        {careerPaths.map((cp) => (
                          <option key={cp.id} value={cp.id}>
                            {cp.name}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Assigning...' : 'Assign'}
                      </Button>
                    </form>
                  </div>

                  {/* Current Career Paths */}
                  <div>
                    <h3 className="font-medium mb-3">Current Career Paths</h3>
                    {studentCareerPaths.length === 0 ? (
                      <p className="text-sm text-gray-500">No career paths assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {studentCareerPaths.map((scp) => (
                          <div key={scp.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                            <div>
                              <div className="font-medium">{scp.careerPath.name}</div>
                              <div className="text-sm text-gray-600">
                                Assigned on {new Date(scp.assignedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCareerPath(scp.careerPathId)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCareerPathModal(false);
                      setSelectedStudent(null);
                      setStudentCareerPaths([]);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}