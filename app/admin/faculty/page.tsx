'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface College {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  college: College;
}

interface Faculty {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  departmentId: number;
  department: Department;
  assignedYears?: string | null;
  canAssignCrossDepartment?: boolean;
  allowedDepartments?: string | null;
}

interface Student {
  id: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  departmentId: number;
  department: Department;
  year: number;
  registerNumber: string;
}

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
}

interface StudentCareerPath {
  id: number;
  studentId: number;
  careerPathId: number;
  assignedAt: string;
  careerPath: CareerPath;
}

interface FacultyCareerPath {
  id: number;
  facultyId: number;
  careerPathId: number;
  assignedAt: string;
  careerPath: CareerPath;
}

export default function AdminFacultyPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyGender, setNewFacultyGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newFacultyDepartmentId, setNewFacultyDepartmentId] = useState<number | ''>('');
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change state
  const [changingPasswordFor, setChangingPasswordFor] = useState<Faculty | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // state
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | ''>('');
  
  // Track which faculty have user accounts
  const [facultiesWithAccounts, setFacultiesWithAccounts] = useState<Set<string>>(new Set());

  // Career path assignment state (for students)
  const [showCareerPathModal, setShowCareerPathModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCareerPathId, setSelectedCareerPathId] = useState<number | ''>('');
  const [StudentCareerPaths, setStudentCareerPaths] = useState<StudentCareerPath[]>([]);

  // Faculty assignment state (for faculty members)
  const [showFacultyAssignmentModal, setShowFacultyAssignmentModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [facultyCareerPaths, setFacultyCareerPaths] = useState<FacultyCareerPath[]>([]);
  const [selectedFacultyCareerPathId, setSelectedFacultyCareerPathId] = useState<number | ''>('');
  const [FacultyAssignedYears, setFacultyAssignedYears] = useState<string>('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  
  // Cross-department permission state
  const [canAssignCrossDepartment, setCanAssignCrossDepartment] = useState(false);
  const [AllowedDepartments, setAllowedDepartments] = useState<string>('');
  const [selectedAllowedDepartments, setSelectedAllowedDepartments] = useState<number[]>([]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department');
      setDepartments(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch departments', { description: errorMessage });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/student');
      // The student API returns { success: true, students: [...] }
      setStudents(response.data.students || []);
    } catch (error: unknown) {
      console.error('Failed to fetch students:');
      // Ensure students is always an array even on error
      setStudents([]);
    }
  };

  const fetchCareerPaths = async () => {
    try {
      const response = await api.get('/career-path');
      setCareerPaths(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch career paths:');
    }
  };

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/faculty');
      setFaculties(response.data);
      
      // Check which faculties have user accounts
      try {
        const usersResponse = await api.get('/users?role=faculty&format=json');
        const userEmails = new Set<string>(usersResponse.data.map((u: any) => u.email));
        setFacultiesWithAccounts(userEmails);
      } catch (error) {
        console.error('Failed to fetch user accounts:');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch faculties', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
    fetchStudents();
    fetchCareerPaths();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/faculty', {
        email: newFacultyEmail,
        name: newFacultyName,
        gender: newFacultyGender,
        departmentId: newFacultyDepartmentId});
      toast.success('Faculty created', { description: newFacultyEmail });
      setNewFacultyEmail('');
      setNewFacultyName('');
      setNewFacultyGender('MALE');
      setNewFacultyDepartmentId('');
      fetchFaculties();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create faculty', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setLoading(true);
    try {
      await api.put('/faculty', {
        id: editingFaculty.id,
        email: editingFaculty.email,
        name: editingFaculty.name,
        gender: editingFaculty.gender,
        departmentId: editingFaculty.departmentId});
      toast.success('Faculty updated', { description: editingFaculty.email });
      setEditingFaculty(null);
      fetchFaculties();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update faculty', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    setLoading(true);
    try {
      await api.delete('/faculty', { data: { id } });
      toast.success('Faculty deleted');
      fetchFaculties();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete faculty', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordFor) return;
    setLoading(true);
    try {
      // Create or update user account with new password
      await api.post('/users', { email: changingPasswordFor.email, password: newPassword });
      toast.success('Password changed', { description: changingPasswordFor.email });
      setChangingPasswordFor(null);
      setNewPassword('');
      // Refresh the account status
      fetchFaculties();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to change password', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCareerPathModal = async (student: Student) => {
    setSelectedStudent(student);
    setShowCareerPathModal(true);
    setLoading(true);
    try {
      const response = await api.get(`/student/${student.id}/career-path`);
      setStudentCareerPaths(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch career paths', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCareerPathId) return;
    setLoading(true);
    try {
      await api.post(`/student/${selectedStudent.id}/career-path`, { careerPathId: selectedCareerPathId });
      toast.success('Career path assigned', { description: `Assigned to ${selectedStudent?.name}` });
      setSelectedCareerPathId('');
      // Refresh career paths for this student
      if (selectedStudent) {
        const response = await api.get(`/student/${selectedStudent.id}/career-path`);
        setStudentCareerPaths(response.data);
      }
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
      await api.delete(`/student/${selectedStudent.id}/career-path`, { data: { careerPathId } });
      toast.success('Career path removed');
      // Refresh career paths for this student
      if (selectedStudent) {
        const response = await api.get(`/student/${selectedStudent.id}/career-path`);
        setStudentCareerPaths(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to remove career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Faculty assignment functions
  const handleOpenFacultyAssignmentModal = async (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setShowFacultyAssignmentModal(true);
    setLoading(true);
    try {
      // Fetch faculty career paths
      const response = await api.get(`/faculty/${faculty.id}/career-paths`);
      setFacultyCareerPaths(response.data);
      
      // Parse assigned years from faculty data
      if (faculty.assignedYears) {
        const years = faculty.assignedYears.split(',').map((y: string) => parseInt(y.trim()));
        setSelectedYears(years);
        setFacultyAssignedYears(faculty.assignedYears);
      } else {
        setSelectedYears([]);
        setFacultyAssignedYears('');
      }

      // Parse cross-department permissions
      setCanAssignCrossDepartment(faculty.canAssignCrossDepartment || false);
      if (faculty.allowedDepartments) {
        const allowedDeptIds = faculty.allowedDepartments.split(',').map((id: string) => parseInt(id.trim()));
        setSelectedAllowedDepartments(allowedDeptIds);
        setAllowedDepartments(faculty.allowedDepartments);
      } else {
        setSelectedAllowedDepartments([]);
        setAllowedDepartments('');
      }
    } catch (error: unknown) {
      console.error('Error fetching faculty assignments:');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch faculty assignments', { description: errorMessage });
      setFacultyCareerPaths([]);
      setSelectedYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCareerPathToFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !selectedFacultyCareerPathId) return;
    setLoading(true);
    try {
      await api.post(`/faculty/${selectedFaculty.id}/career-paths`, { careerPathId: selectedFacultyCareerPathId });
      toast.success('Career path assigned to faculty', { description: `Assigned to ${selectedFaculty?.name}` });
      setSelectedFacultyCareerPathId('');
      // Refresh career paths for this faculty
      if (selectedFaculty) {
        const response = await api.get(`/faculty/${selectedFaculty.id}/career-paths`);
        setFacultyCareerPaths(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to assign career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCareerPathFromFaculty = async (careerPathId: number) => {
    if (!selectedFaculty) return;
    setLoading(true);
    try {
      await api.delete(`/faculty/${selectedFaculty.id}/career-paths`, { data: { careerPathId } });
      toast.success('Career path removed from faculty');
      // Refresh career paths for this faculty
      if (selectedFaculty) {
        const response = await api.get(`/faculty/${selectedFaculty.id}/career-paths`);
        setFacultyCareerPaths(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to remove career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort()
    );
  };

  const handleUpdateFacultyYears = async () => {
    if (!selectedFaculty) return;
    setLoading(true);
    try {
      const yearsString = selectedYears.length > 0 ? selectedYears.join(',') : null;
      await api.put(`//faculty/${selectedFaculty.id}/years`, { assignedYears: yearsString });
      toast.success('Faculty year assignments updated');
      setFacultyAssignedYears(yearsString || '');
      fetchFaculties(); // Refresh faculty list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update year assignments', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const toggleAllowedDepartment = (departmentId: number) => {
    setSelectedAllowedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId].sort()
    );
  };

  const handleUpdateCrossDepartmentPermissions = async () => {
    if (!selectedFaculty) return;
    setLoading(true);
    try {
      const allowedDeptString = selectedAllowedDepartments.length > 0 ? selectedAllowedDepartments.join(',') : null;
      await api.put(`/faculty/${selectedFaculty.id}/cross-department`, { 
        canAssignCrossDepartment,
        allowedDepartments: allowedDeptString
      });
      toast.success('Cross-department permissions updated');
      setAllowedDepartments(allowedDeptString || '');
      fetchFaculties(); // Refresh faculty list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update cross-department permissions', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <Card className="mb-6">
          <>
            <>{editingFaculty ? 'Edit Faculty' : 'Create Faculty'}</>
            <>{editingFaculty ? 'Update an existing faculty member.' : 'Add a new faculty member to a department.'}</>
          </>
          <CardContent>
            <form onSubmit={editingFaculty ? handleUpdateFaculty : handleCreateFaculty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facultyEmail">Email</Label>
                <Input
                  id="facultyEmail"
                  type="email"
                  value={editingFaculty ? editingFaculty.email : newFacultyEmail}
                  onChange={(e) => (editingFaculty ? setEditingFaculty({ ...editingFaculty, email: e.target.value }) : setNewFacultyEmail(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyName">Name (Optional)</Label>
                <Input
                  id="facultyName"
                  type="text"
                  value={editingFaculty ? editingFaculty.name : newFacultyName}
                  onChange={(e) => (editingFaculty ? setEditingFaculty({ ...editingFaculty, name: e.target.value }) : setNewFacultyName(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyGender">Gender</Label>
                <select
                  id="facultyGender"
                  className="border rounded h-10 px-3 w-full"
                  value={editingFaculty ? editingFaculty.gender : newFacultyGender}
                  onChange={(e) => (editingFaculty ? setEditingFaculty({ ...editingFaculty, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }) : setNewFacultyGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER'))}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyDepartment">Department</Label>
                <select
                  id="facultyDepartment"
                  className="border rounded h-10 px-3 w-full"
                  value={editingFaculty ? editingFaculty.departmentId : newFacultyDepartmentId}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? '' : parseInt(value);
                    if (editingFaculty) {
                      setEditingFaculty({ ...editingFaculty, departmentId: numValue === '' ? 0 : numValue });
                    } else {
                      setNewFacultyDepartmentId(numValue);
                    }
                  }}
                  required
                >
                  <option value="">Select a Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.college.name})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (editingFaculty ? 'Updating...' : 'Creating...') : (editingFaculty ? 'Update Faculty' : 'Create Faculty')}
              </Button>
              {editingFaculty && (
                <Button variant="outline" onClick={() => setEditingFaculty(null)} className="w-full mt-2">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        {changingPasswordFor && (
          <Card className="mb-6 border-yellow-500">
            <>
              <>Change Password for {changingPasswordFor.name}</>
              <>Set a new password for {changingPasswordFor.email}</>
            </>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setChangingPasswordFor(null); setNewPassword(''); }} 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Career Path Assignment Modal */}
        {showCareerPathModal && selectedStudent && (
          <Card className="mb-6 border-blue-500">
            <>
              <>Manage Career Paths for {selectedStudent.name}</>
              <>Assign career paths to {selectedStudent.email}</>
            </>
            <CardContent>
              <div className="space-y-6">
                {/* Assign new career path */}
                <form onSubmit={handleAssignCareerPath} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="careerPath">Assign Career Path</Label>
                    <select
                      id="careerPath"
                      className="border rounded h-10 px-3 w-full"
                      value={selectedCareerPathId}
                      onChange={(e) => setSelectedCareerPathId(parseInt(e.target.value))}
                      required
                    >
                      <option value="">Select a Career Path</option>
                      {careerPaths.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Assigning...' : 'Assign Career Path'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => { 
                        setShowCareerPathModal(false); 
                        setSelectedStudent(null); 
                        setSelectedCareerPathId('');
                        setStudentCareerPaths([]);
                      }} 
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </form>

                {/* Currently assigned career paths */}
                <div>
                  <h3 className="font-medium mb-3">Assigned Career Paths</h3>
                  {StudentCareerPaths.length === 0 ? (
                    <p className="text-sm text-gray-500">No career paths assigned yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {StudentCareerPaths.map((scp) => (
                        <li key={scp.id} className="flex items-center justify-between p-3 border rounded-md">
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <>
            <>Student List - Assign Career Paths</>
            <>Select a to assign career paths.</>
          </>
          <CardContent>
            {/* students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="mb-2 block">by Department</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={filterDepartmentId} 
                  onChange={(e) => setFilterDepartmentId(e.target.value ? parseInt(e.target.value) : '')}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.college.name})</option>
                  ))}
                </select>
              </div>
            </div>

            {(!students || !Array.isArray(students) || students.filter(s => 
              (filterDepartmentId ? s.departmentId === filterDepartmentId : true)
            ).length === 0) ? (
              <div className="text-gray-500">No students found.</div>
            ) : (
              <ul className="space-y-3">
                {students && Array.isArray(students) ? students.filter(s => 
                  (filterDepartmentId ? s.departmentId === filterDepartmentId : true)
                ).map((student) => (
                  <li key={student.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.email} • {student.registerNumber} • {student.department?.name} • Year {student.year}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => selectedStudent && handleOpenCareerPathModal(selectedStudent)}
                    >
                      Manage Career Paths
                    </Button>
                  </li>
                )) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Faculty Assignment Modal */}
        {showFacultyAssignmentModal && selectedFaculty && (
          <Card className="mb-6 border-purple-500">
            <>
              <>Configure Assignments for {selectedFaculty?.name}</>
              <>
                Set which career paths and years this faculty will manage
              </>
            </>
            <CardContent>
              <div className="space-y-6">
                {/* Year Assignment Section */}
                <div className="border-b pb-6">
                  <h3 className="font-medium mb-3">📅 Assigned Years</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Select which year(s) this faculty will manage. Leave empty for all years.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3, 4].map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleYear(year)}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          selectedYears.includes(year)
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Year {year}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {selectedYears.length === 0 ? (
                      <span className="text-orange-600">⚠️ No years selected = All years</span>
                    ) : (
                      <span>Selected: Year {selectedYears.join(', ')}</span>
                    )}
                  </div>
                  <Button onClick={handleUpdateFacultyYears} disabled={loading} size="sm">
                    {loading ? 'Updating...' : 'Update Year Assignments'}
                  </Button>
                </div>

                {/* Career Path Assignment Section */}
                <div>
                  <h3 className="font-medium mb-3">🎯 Assigned Career Paths</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Assign career paths this faculty will manage. Leave empty for all career paths.
                  </p>
                  
                  <form onSubmit={handleAssignCareerPathToFaculty} className="space-y-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="facultyCareerPath">Assign Career Path</Label>
                      <select
                        id="facultyCareerPath"
                        className="border rounded h-10 px-3 w-full"
                        value={selectedFacultyCareerPathId}
                        onChange={(e) => setSelectedFacultyCareerPathId(parseInt(e.target.value))}
                        required
                      >
                        <option value="">Select a Career Path</option>
                        {careerPaths.map((cp) => (
                          <option key={cp.id} value={cp.id}>
                            {cp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" disabled={loading} size="sm">
                      {loading ? 'Assigning...' : 'Assign Career Path'}
                    </Button>
                  </form>

                  {/* Currently assigned career paths */}
                  {facultyCareerPaths.length === 0 ? (
                    <p className="text-sm text-orange-600">⚠️ No career paths assigned = All career paths</p>
                  ) : (
                    <ul className="space-y-2">
                      {facultyCareerPaths.map((fcp) => (
                        <li key={fcp.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                          <div>
                            <div className="font-medium">{fcp.careerPath.name}</div>
                            <div className="text-sm text-gray-600">
                              Assigned on {new Date(fcp.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveCareerPathFromFaculty(fcp.careerPathId)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Cross-Department Permission Section */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">🏛️ Cross-Department Permissions</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Allow this faculty to assign career paths to students in other departments.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="canAssignCrossDepartment"
                        checked={canAssignCrossDepartment}
                        onChange={(e) => setCanAssignCrossDepartment(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="canAssignCrossDepartment">
                        Enable Cross-Department Career Path Assignment
                      </Label>
                    </div>
                    
                    {canAssignCrossDepartment && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="">Allowed Departments</Label>
                          <p className="text-sm text-gray-600 mb-2">
                            Select which departments this faculty can access. Leave empty for all departments.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {departments.map((dept) => (
                              <button
                                key={dept.id}
                                type="button"
                                onClick={() => toggleAllowedDepartment(dept.id)}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                  selectedAllowedDepartments.includes(dept.id)
                                    ? 'bg-green-500 text-white border-green-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {dept.name}
                              </button>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            {selectedAllowedDepartments.length === 0 ? (
                              <span className="text-orange-600">⚠️ No departments selected = All departments</span>
                            ) : (
                              <span>Selected: {selectedAllowedDepartments.map(id => 
                                departments.find(d => d.id === id)?.name
                              ).join(', ')}</span>
                            )}
                          </div>
                        </div>
                        
                        <Button onClick={handleUpdateCrossDepartmentPermissions} disabled={loading} size="sm">
                          {loading ? 'Updating...' : 'Update Cross-Department Permissions'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      setShowFacultyAssignmentModal(false); 
                      setSelectedFaculty(null); 
                      setFacultyCareerPaths([]);
                      setSelectedFacultyCareerPathId('');
                      setSelectedYears([]);
                      setFacultyAssignedYears('');
                      setCanAssignCrossDepartment(false);
                      setSelectedAllowedDepartments([]);
                      setAllowedDepartments('');
                    }} 
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <>
            <>Existing Faculty</>
            <>Manage your faculty members and their assignments. and search through the list.</>
          </>
          <CardContent>
            {/* Filters */}
            <div className="mb-6">
              <Label className="mb-2 block">by Department</Label>
              <select 
                className="border rounded h-10 px-3 w-full" 
                value={filterDepartmentId} 
                onChange={(e) => setFilterDepartmentId(e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.college.name})</option>
                ))}
              </select>
            </div>

            {loading && faculties.length === 0 ? (
              <div>Loading faculties...</div>
            ) : faculties.filter(f => 
              (filterDepartmentId ? f.departmentId === filterDepartmentId : true)
            ).length === 0 ? (
              <div className="text-gray-500">
                {faculties.length === 0 ? 'No faculty members found.' : 'No faculty match the current filters.'}
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-3">
                  Showing {faculties.filter(f => 
                    (filterDepartmentId ? f.departmentId === filterDepartmentId : true)
                  ).length} of {faculties.length} faculty
                </div>
                <ul className="space-y-3">
                  {faculties.filter(f => 
                    (filterDepartmentId ? f.departmentId === filterDepartmentId : true)
                  ).map((faculty) => (
                    <li key={faculty.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{faculty.name}</div>
                        <div className="text-sm text-gray-600">
                          {faculty.email} • {faculty?.department.name}
                          {facultiesWithAccounts.has(faculty.email) && (
                            <span className="ml-2 text-green-600">✓ Account Created</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="default" size="sm" onClick={() => handleOpenFacultyAssignmentModal(faculty)}>
                          Configure Assignments
                        </Button>
                        {facultiesWithAccounts.has(faculty.email) && (
                          <Button variant="outline" size="sm" onClick={() => setChangingPasswordFor(faculty)}>
                            Change Password
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setEditingFaculty(faculty)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteFaculty(faculty.id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}