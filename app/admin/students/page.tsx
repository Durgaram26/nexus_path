'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface College {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  college: College;
}

interface Student {
  id: string;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  departmentId: string;
  department: Department;
  year: number;
  registerNumber: string;
}

export default function AdminStudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newStudentPhoneNumber, setNewStudentPhoneNumber] = useState('');
  const [newStudentDepartmentId, setNewStudentDepartmentId] = useState<string>('');
  const [newStudentYear, setNewStudentYear] = useState<number | ''>('');
  const [newStudentRegisterNumber, setNewStudentRegisterNumber] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change state
  const [changingPasswordFor, setChangingPasswordFor] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // state
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  
  // Track which students have user accounts
  const [studentsWithAccounts, setStudentsWithAccounts] = useState<Set<string>>(new Set());

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
    setLoading(true);
    try {
      const response = await api.get('/student');
      // The API returns { success: true, students: [...] }
      setStudents(response.data.students || []);
      
      // Check which students have user accounts
      try {
        const usersResponse = await api.get('/users?role=student&format=json');
        const userEmails = new Set<string>(usersResponse.data.map((u: any) => u.email));
        setStudentsWithAccounts(userEmails);
      } catch (error) {
        console.error('Failed to fetch user accounts:');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch students', { description: errorMessage });
      // Ensure students is always an array even on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail || !newStudentDepartmentId || !newStudentYear || !newStudentRegisterNumber) return;
    
    setLoading(true);
    try {
      await api.post('/student', {
        email: newStudentEmail,
        name: newStudentName,
        gender: newStudentGender,
        phoneNumber: newStudentPhoneNumber,
        departmentId: newStudentDepartmentId,
        year: newStudentYear,
        registerNumber: newStudentRegisterNumber
      });
      toast.success('Student created', { description: newStudentEmail });
      setNewStudentEmail('');
      setNewStudentName('');
      setNewStudentGender('MALE');
      setNewStudentPhoneNumber('');
      setNewStudentDepartmentId('');
      setNewStudentYear('');
      setNewStudentRegisterNumber('');
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
      await api.put(`/student/${editingStudent.id}`, {
        email: editingStudent.email,
        name: editingStudent.name,
        gender: editingStudent.gender,
        phoneNumber: editingStudent.phoneNumber,
        departmentId: editingStudent.departmentId,
        year: editingStudent.year,
        registerNumber: editingStudent.registerNumber
      });
      toast.success('Student updated', { description: editingStudent.email });
      setEditingStudent(null);
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update student', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteStudent = async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/student/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete student', { description: errorMessage });
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
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to change password', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <Card className="mb-6">
          <>
            <>{editingStudent ? 'Edit Student' : 'Create Student'}</>
            <>{editingStudent ? 'Update an existing .' : 'Add a new to a department.'}</>
          </>
          <CardContent>
            <form onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={editingStudent ? editingStudent.email : newStudentEmail}
                  onChange={(e) => (editingStudent ? setEditingStudent({ ...editingStudent, email: e.target.value }) : setNewStudentEmail(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">Name (Optional)</Label>
                <Input
                  id="studentName"
                  type="text"
                  value={editingStudent ? editingStudent.name : newStudentName}
                  onChange={(e) => (editingStudent ? setEditingStudent({ ...editingStudent, name: e.target.value }) : setNewStudentName(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentGender">Gender</Label>
                <select
                  id="studentGender"
                  className="border rounded h-10 px-3 w-full"
                  value={editingStudent ? editingStudent.gender : newStudentGender}
                  onChange={(e) => (editingStudent ? setEditingStudent({ ...editingStudent, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }) : setNewStudentGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER'))}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentPhoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="studentPhoneNumber"
                  type="tel"
                  value={editingStudent ? editingStudent.phoneNumber || '' : newStudentPhoneNumber}
                  onChange={(e) => (editingStudent ? setEditingStudent({ ...editingStudent, phoneNumber: e.target.value }) : setNewStudentPhoneNumber(e.target.value))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentDepartment">Department</Label>
                <select
                  id="studentDepartment"
                  className="border rounded h-10 px-3 w-full"
                  value={editingStudent ? editingStudent.departmentId : newStudentDepartmentId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingStudent) {
                      setEditingStudent({ ...editingStudent, departmentId: value });
                    } else {
                      setNewStudentDepartmentId(value);
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
              <div className="space-y-2">
                <Label htmlFor="studentYear">Year</Label>
                <Input
                  id="studentYear"
                  type="number"
                  value={editingStudent ? editingStudent.year : (newStudentYear === '' ? '' : newStudentYear)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? '' : parseInt(value);
                    if (editingStudent) {
                      setEditingStudent({ ...editingStudent, year: numValue === '' ? 0 : numValue });
                    } else {
                      setNewStudentYear(numValue);
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentRegister">Register Number</Label>
                <Input
                  id="studentRegister"
                  type="text"
                  value={editingStudent ? editingStudent.registerNumber : newStudentRegisterNumber}
                  onChange={(e) => (editingStudent ? setEditingStudent({ ...editingStudent, registerNumber: e.target.value }) : setNewStudentRegisterNumber(e.target.value))}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (editingStudent ? 'Updating...' : 'Creating...') : (editingStudent ? 'Update Student' : 'Create Student')}
              </Button>
              {editingStudent && (
                <Button variant="outline" onClick={() => setEditingStudent(null)} className="w-full mt-2">
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

        <Card>
          <>
            <>Existing Students</>
            <>Manage your members. and search through the list.</>
          </>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="mb-2 block">by Department</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={filterDepartmentId} 
                  onChange={(e) => setFilterDepartmentId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.college.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-2 block">by Year</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (!students || students.length === 0) ? (
              <div>Loading students...</div>
            ) : (!students || !Array.isArray(students) || students.filter(s => 
              (filterDepartmentId ? s.departmentId === filterDepartmentId : true) &&
              (filterYear ? s.year === filterYear : true)
            ).length === 0) ? (
              <div className="text-gray-500">
                {(!students || students.length === 0) ? 'No students found.' : 'No students match the current filters.'}
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-3">
                  Showing {students && Array.isArray(students) ? students.filter(s => 
                    (filterDepartmentId ? s.departmentId === filterDepartmentId : true) &&
                    (filterYear ? s.year === filterYear : true)
                  ).length : 0} of {students && Array.isArray(students) ? students.length : 0} students
                </div>
                <ul className="space-y-3">
                  {students && Array.isArray(students) ? students.filter(s => 
                    (filterDepartmentId ? s.departmentId === filterDepartmentId : true) &&
                    (filterYear ? s.year === filterYear : true)
                  ).map((student) => (
                    <li key={student.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          {student.email} • {student.registerNumber} • {student.department?.name} • Year {student.year}
                          {student.phoneNumber && (
                            <span> • 📞 {student.phoneNumber}</span>
                          )}
                          {studentsWithAccounts.has(student.email) && (
                            <span className="ml-2 text-green-600">✓ Account Created</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {studentsWithAccounts.has(student.email) && (
                          <Button variant="outline" size="sm" onClick={() => setChangingPasswordFor(student)}>
                            Change Password
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setEditingStudent(student)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  )) : null}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}