'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface College {
  id: number;
  name: string;
}

interface Department {
  id: number;
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
  studentId: number;
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
  departmentId: number;
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
  assignedDepartments: string | null;
}

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [facultyInfo, setFacultyInfo] = useState<FacultyInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Student CRUD state
  const [showStudentModal, setShowStudentModal] = useState(false);
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
  const [showCareerPathModal, setShowCareerPathModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCareerPathId, setSelectedCareerPathId] = useState<number | ''>('');
  const [StudentCareerPaths, setStudentCareerPaths] = useState<StudentCareerPath[]>([]);

  // and search state
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [searchRegisterNumber, setSearchRegisterNumber] = useState('');
  
  // Account creation states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkAccountCreation, setBulkAccountCreation] = useState(false);
  const [accountCreationResults, setAccountCreationResults] = useState<any[]>([]);
  const [accountCreationLoading, setAccountCreationLoading] = useState(false);
  const [studentsAccountStatus, setStudentsAccountStatus] = useState<Map<number, {hasAccount: boolean, source?: string}>>(new Map());
  const [loadingAccountStatus, setLoadingAccountStatus] = useState(false);
  const [facultyPermissions, setFacultyPermissions] = useState<any>(null);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Map<number, boolean>>(new Map());
  const [studentPasswords, setStudentPasswords] = useState<Map<number, string>>(new Map());
  
  // Password input states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<Student | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [passwordMethod, setPasswordMethod] = useState<'custom' | 'auto' | 'student+reg'>('student+reg');
  
  // Bulk password input states
  const [showBulkPasswordModal, setShowBulkPasswordModal] = useState(false);
  const [bulkPasswordPrefix, setBulkPasswordPrefix] = useState('student');
  const [useBulkCustomPassword, setUseBulkCustomPassword] = useState(false);
  const [bulkCustomPassword, setBulkCustomPassword] = useState('');
  const [bulkPasswordMethod, setBulkPasswordMethod] = useState<'custom' | 'auto' | 'student+reg'>('student+reg');

  useEffect(() => {
    fetchFacultyInfo();
    fetchStudents();
    fetchDepartments();
    fetchCareerPaths();
  }, []);

  // Fetch account status for students
  const fetchAccountStatus = async (studentIds: number[], retryCount = 0) => {
    if (studentIds.length === 0) return;
    
    setLoadingAccountStatus(true);
    try {
      const response = await api.get(`/faculty/students-account-status?studentIds=${studentIds.join(',')}`);
      
      if (response.data.success) {
        const statusMap = new Map<number, {hasAccount: boolean, source?: string}>();
        response.data.results.forEach((result: any) => {
          statusMap.set(result.studentId, {
            hasAccount: result.hasAccount,
            source: result.accountSource
          });
        });
        setStudentsAccountStatus(statusMap);
      }
    } catch (error: any) {
      console.error('Error fetching account status:', error);
      
      // Retry once for 500 errors
      if (error.response?.status === 500 && retryCount < 1) {
        setTimeout(() => fetchAccountStatus(studentIds, retryCount + 1), 1000);
        return;
      }
      
      if (error.response?.status === 500) {
        toast.error('Server error while checking account status. Please try again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to check account status.');
      } else {
        toast.error('Failed to check account status. Please try again.');
      }
    } finally {
      setLoadingAccountStatus(false);
    }
  };

  const fetchFacultyInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      setFacultyInfo(response.data);
      setFacultyPermissions(response.data);
    } catch (error: any) {
      console.error('Error fetching faculty info:', error);
      if (error.response?.status === 404) {
        toast.error('Faculty profile not found. Please contact administrator.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again.');
        // Redirect to login
        window.location.href = '/auth/login';
      } else {
        toast.error('Failed to fetch faculty information');
      }
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/assigned-students');
      const studentsData = response.data.students || [];
      setStudents(studentsData);
      
      // Fetch account status for all students
      if (studentsData.length > 0) {
        const studentIds = studentsData.map((s: Student) => s.id);
        try {
          await fetchAccountStatus(studentIds);
        } catch (error) {
          console.warn('Account status check failed, continuing without it:', error);
          // Set empty status map so UI shows "Checking..." state
          setStudentsAccountStatus(new Map());
          // Continue without account status - the page will still work
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department');
      setDepartments(response.data);
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const fetchCareerPaths = async () => {
    try {
      const response = await api.get('/career-path');
      setCareerPaths(response.data);
    } catch (error: unknown) {
      console.error('Error fetching career paths:', error);
      toast.error('Failed to fetch career paths');
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
        departmentId: parseInt(newStudent.departmentId),
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
      await api.put(`/student/${editingStudent.id}`, {
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
      await api.delete('/student', { data: { id: studentId } });
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete student', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Account creation functions
  const handleCreateAccount = async (studentId: number) => {
    // Find the student to show in password modal
    const student = students.find(s => s.id === studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }
    
    setSelectedStudentForPassword(student);
    setCustomPassword('');
    setUseCustomPassword(false);
    setShowPasswordModal(true);
  };

  const handleConfirmCreateAccount = async () => {
    if (!selectedStudentForPassword) return;
    
    setAccountCreationLoading(true);
    try {
      let passwordData: any = { createAccount: true };
      
      if (passwordMethod === 'custom') {
        passwordData.password = customPassword;
      } else if (passwordMethod === 'student+reg') {
        passwordData.passwordType = 'name+reg';
      } else {
        // auto method - use default generation
        passwordData.passwordPrefix = 'student';
      }
      
      const response = await api.post('/faculty/create-student-account', {
        studentId: selectedStudentForPassword.id,
        ...passwordData
      });
      
      if (response.data.success) {
        toast.success(`Account created for ${response.data.student.name}`);
        toast.info(`Login credentials: ${response.data.student.email} / ${response.data.user.password}`);
        
        // Store credentials for display (download is now optional)
        const credentials = response.data.credentials;
        if (credentials) {
          setLastCreatedCredentials(credentials);
          // Removed automatic download - user can download manually if needed
        }
        
        // Refresh account status
        await fetchAccountStatus([selectedStudentForPassword.id]);
      } else {
        toast.error(response.data.message || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'You do not have permission to create accounts for this student');
      } else if (error.response?.status === 409) {
        toast.warning('Account already exists for this student');
      } else {
        toast.error('Failed to create account');
      }
    } finally {
      setAccountCreationLoading(false);
      setShowPasswordModal(false);
      setSelectedStudentForPassword(null);
    }
  };

  const handleBulkCreateAccounts = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to create accounts for');
      return;
    }

    // Filter out students who already have accounts
    const studentsWithoutAccounts = selectedStudents.filter(studentId => 
      !studentsAccountStatus.get(studentId)?.hasAccount
    );

    if (studentsWithoutAccounts.length === 0) {
      toast.warning('All selected students already have accounts');
      setSelectedStudents([]);
      return;
    }

    if (studentsWithoutAccounts.length < selectedStudents.length) {
      const skippedCount = selectedStudents.length - studentsWithoutAccounts.length;
      toast.info(`Skipping ${skippedCount} students who already have accounts`);
    }

    // Show bulk password modal
    setBulkPasswordPrefix('student');
    setUseBulkCustomPassword(false);
    setBulkCustomPassword('');
    setShowBulkPasswordModal(true);
  };

  const handleConfirmBulkCreateAccounts = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to create accounts for');
      return;
    }

    // Filter out students who already have accounts
    const studentsWithoutAccounts = selectedStudents.filter(studentId => 
      !studentsAccountStatus.get(studentId)?.hasAccount
    );

    if (studentsWithoutAccounts.length === 0) {
      toast.warning('All selected students already have accounts');
      setSelectedStudents([]);
      return;
    }

    setAccountCreationLoading(true);
    try {
      let passwordData: any = {};
      
      if (bulkPasswordMethod === 'custom') {
        passwordData.password = bulkCustomPassword;
      } else if (bulkPasswordMethod === 'student+reg') {
        passwordData.passwordType = 'name+reg';
      } else {
        // auto method - use default generation
        passwordData.passwordPrefix = bulkPasswordPrefix;
      }
      
      const response = await api.put('/faculty/create-student-account', {
        studentIds: studentsWithoutAccounts,
        ...passwordData
      });
      
      if (response.data.success) {
        setAccountCreationResults(response.data.results);
        toast.success(`Created ${response.data.summary.successful} accounts successfully`);
        if (response.data.summary.failed > 0) {
          toast.warning(`${response.data.summary.failed} accounts failed to create`);
        }
        
        // Download credentials for successful accounts
        const successfulCredentials = response.data.results
          .filter((result: any) => result.success && result.credentials)
          .map((result: any) => result.credentials);
        
        if (successfulCredentials.length > 0) {
          // Store credentials for manual download instead of automatic download
          setLastCreatedCredentials(successfulCredentials[0]); // Store first one for display
        }
        
        setShowAccountModal(true);
        setSelectedStudents([]);
        // Refresh account status
        await fetchAccountStatus(students.map(s => s.id));
      } else {
        toast.error('Failed to create accounts');
      }
    } catch (error: any) {
      console.error('Error creating bulk accounts:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to create accounts for some students');
      } else {
        toast.error('Failed to create accounts');
      }
    } finally {
      setAccountCreationLoading(false);
      setShowBulkPasswordModal(false);
    }
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      // Only select students who don't have accounts and faculty can create accounts for
      const studentsWithoutAccounts = filteredStudents.filter(s => 
        !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)
      );
      setSelectedStudents(studentsWithoutAccounts.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Check if faculty can create account for a specific student
  const canCreateAccountForStudent = (student: any) => {
    if (!facultyPermissions) return true; // Allow if permissions not loaded yet
    
    // Check department permission
    if (facultyPermissions.department?.id !== student.departmentId) {
      if (!facultyPermissions.canAssignCrossDepartment) {
        return false;
      }
    }
    
    // Check year permission
    const assignedYears = facultyPermissions.assignedYears ? JSON.parse(facultyPermissions.assignedYears) : [];
    if (assignedYears.length > 0 && !assignedYears.includes(student.year)) {
      return false;
    }
    
    // Check career path permission
    const facultyCareerPaths = facultyPermissions.careerPaths?.map((cp: any) => cp.name) || [];
    if (facultyCareerPaths.length > 0) {
      const studentCareerPaths = student.careerPaths?.map((cp: any) => cp.careerPath.name) || [];
      const hasMatchingCareerPath = studentCareerPaths.some((cp: string) => 
        facultyCareerPaths.includes(cp)
      );
      if (!hasMatchingCareerPath) {
        return false;
      }
    }
    
    return true;
  };

  // Fetch passwords for all students with accounts
  const fetchStudentPasswords = async () => {
    try {
      const studentsWithAccounts = students.filter(s => studentsAccountStatus.get(s.id)?.hasAccount);
      if (studentsWithAccounts.length === 0) return;

        const response = await api.get(`/faculty/students-passwords?studentIds=${studentsWithAccounts.map(s => s.id).join(',')}`);
        
        if (response.data.success) {
          const passwordMap = new Map<number, string>();
          response.data.results.forEach((result: any) => {
            if (result.password) {
              passwordMap.set(result.studentId, result.password);
            }
          });
          setStudentPasswords(passwordMap);
        }
    } catch (error) {
      console.error('Error fetching student passwords:', error);
    }
  };

  // Download credentials as CSV
  const downloadCredentials = (credentials: any[], type: 'single' | 'bulk' | 'filtered') => {
    if (!credentials || credentials.length === 0) return;

    const headers = ['Register Number', 'Name', 'Email', 'Password', 'Department', 'Year', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...credentials.map(cred => [
        cred.registerNumber,
        `"${cred.name}"`,
        cred.email,
        cred.password,
        `"${cred.department}"`,
        cred.year,
        new Date(cred.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student_credentials_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all filtered students with accounts
  const downloadAllFilteredStudents = async () => {
    try {
      const studentsWithAccounts = filteredStudents.filter(s => studentsAccountStatus.get(s.id)?.hasAccount);
      if (studentsWithAccounts.length === 0) {
        toast.warning('No students with accounts found in current filter');
        return;
      }

      // Fetch passwords for these students
      const response = await api.get(`/faculty/students-passwords?studentIds=${studentsWithAccounts.map(s => s.id).join(',')}`);
      if (response.data.success) {
        const credentials = response.data.results.map((result: any) => ({
          registerNumber: result.registerNumber,
          name: result.name,
          email: result.email,
          password: result.password,
          department: result.department,
          year: result.year,
          createdAt: result.createdAt
        }));
        
        downloadCredentials(credentials, 'filtered');
        toast.success(`Downloaded credentials for ${credentials.length} students`);
      }
    } catch (error) {
      console.error('Error downloading filtered students:', error);
      toast.error('Failed to download student credentials');
    }
  };

  // Toggle password visibility for a student
  const togglePasswordVisibility = async (studentId: number) => {
    const isCurrentlyVisible = showPasswords.get(studentId);
    
    setShowPasswords(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, !newMap.get(studentId));
      return newMap;
    });

    // If we're showing the password and don't have it yet, fetch it
    if (!isCurrentlyVisible && !studentPasswords.get(studentId)) {
        try {
          const response = await api.get(`/faculty/students-passwords?studentIds=${studentId}`);
          
          if (response.data.success && response.data.results.length > 0) {
            const result = response.data.results[0];
            
            if (result.password) {
              setStudentPasswords(prev => {
                const newMap = new Map(prev);
                newMap.set(studentId, result.password);
                return newMap;
              });
            } else {
              setStudentPasswords(prev => {
                const newMap = new Map(prev);
                newMap.set(studentId, 'No password set');
                return newMap;
              });
            }
          } else {
            setStudentPasswords(prev => {
              const newMap = new Map(prev);
              newMap.set(studentId, 'No password found');
              return newMap;
            });
          }
      } catch (error) {
        console.error('Error fetching password:', error);
        setStudentPasswords(prev => {
          const newMap = new Map(prev);
          newMap.set(studentId, 'Error loading password');
          return newMap;
        });
        toast.error('Failed to fetch password');
      }
    }
  };

  const handleAssignCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCareerPathId) return;

    setLoading(true);
    try {
      await api.post(`/student/${selectedStudent.id}/career-path`, { careerPathId: selectedCareerPathId });
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
      await api.delete(`/student/${selectedStudent.id}/career-path`, { data: { careerPathId } });
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

  const fetchStudentCareerPaths = async (studentId: number) => {
    try {
      const response = await api.get(`/student/${studentId}/career-path`);
      setStudentCareerPaths(response.data);
    } catch (error: unknown) {
      console.error('Error fetching career paths:', error);
      toast.error('Failed to fetch career paths');
    }
  };

  const handleOpenCareerPathModal = async (student: Student) => {
    setSelectedStudent(student);
    setShowCareerPathModal(true);
    await fetchStudentCareerPaths(student.id);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleOpenCreateModal = () => {
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
    if (!facultyInfo) return departments;
    
    if (facultyInfo.canAssignCrossDepartment) {
      if (facultyInfo.assignedDepartments) {
        const allowedDeptIds = facultyInfo.assignedDepartments.split(',').map(id => parseInt(id.trim()));
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
            <CardTitle>Student Management</CardTitle>
            <CardDescription>
              Manage students and assign career paths. You can create, edit, and delete students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Faculty Info */}
            {facultyInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Your Access Level</h3>
                <p className="text-sm text-blue-700">
                  Department: {facultyInfo?.department.name}
                  {facultyInfo.canAssignCrossDepartment && (
                    <span className="ml-2 text-green-600">
                      • Cross-Department Access Enabled
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor="filterDepartment">Filter by Department</Label>
                <select
                  id="filterDepartment"
                  className="border rounded h-10 px-3 w-full"
                  value={filterDepartmentId}
                  onChange={(e) => setFilterDepartmentId(e.target.value ? parseInt(e.target.value) : '')}
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
              
              <div className="flex items-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={downloadAllFilteredStudents}
                  disabled={filteredStudents.filter(s => studentsAccountStatus.get(s.id)?.hasAccount).length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📥 Download All Credentials
                </Button>
                <Button onClick={handleOpenCreateModal} className="flex-1">
                  Add New Student
                </Button>
              </div>
            </div>

            {/* Last Created Credentials Display */}
            {lastCreatedCredentials && (
              <Card className="mb-6 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">✅ Account Created Successfully</CardTitle>
                  <CardDescription>
                    Credentials for the newly created account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {lastCreatedCredentials.name}</div>
                    <div><strong>Email:</strong> {lastCreatedCredentials.email}</div>
                    <div><strong>Register Number:</strong> {lastCreatedCredentials.registerNumber}</div>
                    <div><strong>Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{lastCreatedCredentials.password}</code></div>
                    <div><strong>Department:</strong> {lastCreatedCredentials.department}</div>
                    <div><strong>Year:</strong> {lastCreatedCredentials.year}</div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCredentials([lastCreatedCredentials], 'single')}
                    >
                      📥 Download Again
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLastCreatedCredentials(null)}
                    >
                      ✕ Dismiss
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Password Format:</strong> Mixed case prefix + register number + special character + random number
                    <br />
                    <strong>Example:</strong> StUdEnT123@456 (prefix: student, register: 123, special: @, random: 456)
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bulk Actions */}
            {filteredStudents.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Actions</CardTitle>
                  <CardDescription>
                    Select students and perform bulk operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="selectAllStudents"
                          checked={selectedStudents.length === filteredStudents.filter(s => !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)).length}
                          onChange={(e) => handleSelectAllStudents(e.target.checked)}
                          disabled={filteredStudents.filter(s => !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)).length === 0}
                          className="rounded"
                        />
                        <Label htmlFor="selectAllStudents">
                          Select All ({filteredStudents.filter(s => !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)).length} students without accounts)
                        </Label>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedStudents.length} selected
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleBulkCreateAccounts}
                        disabled={selectedStudents.length === 0 || accountCreationLoading || filteredStudents.filter(s => !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)).length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {accountCreationLoading 
                          ? 'Creating...' 
                          : filteredStudents.filter(s => !studentsAccountStatus.get(s.id)?.hasAccount && canCreateAccountForStudent(s)).length === 0
                            ? 'All Students Have Accounts'
                            : `Create ${selectedStudents.length} Accounts`
                        }
                      </Button>
                      <Button
                        variant="outline"
                        onClick={downloadAllFilteredStudents}
                        disabled={filteredStudents.filter(s => studentsAccountStatus.get(s.id)?.hasAccount).length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📥 Download All Credentials
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedStudents([])}
                        disabled={selectedStudents.length === 0}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Students List */}
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                              disabled={studentsAccountStatus.size > 0 && studentsAccountStatus.get(student.id)?.hasAccount || !canCreateAccountForStudent(student)}
                              className="rounded"
                            />
                            <h3 className="font-medium text-lg">{student.name}</h3>
                            <span className="text-sm text-gray-500">#{student.registerNumber}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Year {student.year}
                            </span>
                            <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {student.department.name}
                            </span>
                            {studentsAccountStatus.size > 0 ? (
                              studentsAccountStatus.get(student.id)?.hasAccount ? (
                                <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  ✓ Account Active (Admin)
                                </span>
                              ) : (
                                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  No Account
                                </span>
                              )
                            ) : (
                              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Checking...
                              </span>
                            )}
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

                          {/* Password Display */}
                          {studentsAccountStatus.get(student.id)?.hasAccount && showPasswords.get(student.id) && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <h4 className="text-sm font-medium mb-2 text-blue-800">Account Credentials:</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>Email:</strong> {student.email}</div>
                                <div><strong>Password:</strong> 
                                  <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                                    {studentPasswords.get(student.id) || 'Click 👁️ to load'}
                                  </code>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCareerPathModal(student)}
                          >
                            Manage Career Paths
                          </Button>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAccount(student.id)}
                              disabled={accountCreationLoading || (studentsAccountStatus.size > 0 && studentsAccountStatus.get(student.id)?.hasAccount) || !canCreateAccountForStudent(student)}
                            >
                              {studentsAccountStatus.size > 0 && studentsAccountStatus.get(student.id)?.hasAccount 
                                ? 'Account Exists' 
                                : !canCreateAccountForStudent(student)
                                  ? 'No Permission'
                                  : accountCreationLoading 
                                    ? 'Creating...' 
                                    : 'Create Account'
                              }
                            </Button>
                            {studentsAccountStatus.get(student.id)?.hasAccount && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(student.id)}
                                title="Show/Hide password"
                              >
                                {showPasswords.get(student.id) ? '🙈' : '👁️'}
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(student)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            Delete
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

        {/* Student Modal */}
        {showStudentModal && (
          <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <>
                <>
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </>
              </>
              <CardContent>
                <form onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingStudent ? editingStudent.email : newStudent.email}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, email: e.target.value})
                          : setNewStudent({...newStudent, email: e.target.value})
                        }
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={editingStudent ? editingStudent.name : newStudent.name}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, name: e.target.value})
                          : setNewStudent({...newStudent, name: e.target.value})
                        }
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="border rounded h-10 px-3 w-full"
                        value={editingStudent ? editingStudent.gender : newStudent.gender}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER'})
                          : setNewStudent({...newStudent, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER'})
                        }
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <select
                        id="department"
                        className="border rounded h-10 px-3 w-full"
                        value={editingStudent ? editingStudent.departmentId : newStudent.departmentId}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, departmentId: parseInt(e.target.value)})
                          : setNewStudent({...newStudent, departmentId: e.target.value})
                        }
                        required
                      >
                        <option value="">Select Department</option>
                        {getAvailableDepartments().map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <select
                        id="year"
                        className="border rounded h-10 px-3 w-full"
                        value={editingStudent ? editingStudent.year : newStudent.year}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, year: parseInt(e.target.value)})
                          : setNewStudent({...newStudent, year: e.target.value})
                        }
                        required
                      >
                        <option value="">Select Year</option>
                        {[1, 2, 3, 4].map((year) => (
                          <option key={year} value={year}>
                            Year {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="registerNumber">Register Number *</Label>
                      <Input
                        id="registerNumber"
                        value={editingStudent ? editingStudent.registerNumber : newStudent.registerNumber}
                        onChange={(e) => editingStudent 
                          ? setEditingStudent({...editingStudent, registerNumber: e.target.value})
                          : setNewStudent({...newStudent, registerNumber: e.target.value})
                        }
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-6">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Saving...' : (editingStudent ? 'Update Student' : 'Create Student')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowStudentModal(false);
                        setEditingStudent(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Card>
        )}

        {/* Career Path Assignment Modal */}
        {showCareerPathModal && selectedStudent && (
          <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Assigning...' : 'Assign'}
                      </Button>
                    </form>
                  </div>

                  {/* Current Career Paths */}
                  <div>
                    <h3 className="font-medium mb-3">Current Career Paths</h3>
                    {StudentCareerPaths.length === 0 ? (
                      <p className="text-sm text-gray-500">No career paths assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {StudentCareerPaths.map((scp) => (
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
          </Card>
        )}

        {/* Account Creation Results Modal */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Account Creation Results</CardTitle>
                <CardDescription>
                  Results of bulk account creation process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountCreationResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{result.email}</div>
                          <div className="text-sm text-gray-600">
                            {result.success ? 'Account created successfully' : result.message}
                          </div>
                          {result.success && result.password && (
                            <div className="text-sm text-blue-600 mt-1">
                              Password: {result.password}
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const successfulCredentials = accountCreationResults
                        .filter((result: any) => result.success && result.credentials)
                        .map((result: any) => result.credentials);
                      if (successfulCredentials.length > 0) {
                        downloadCredentials(successfulCredentials, 'bulk');
                      }
                    }}
                    disabled={accountCreationResults.filter((r: any) => r.success).length === 0}
                  >
                    📥 Download Credentials
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAccountModal(false);
                      setAccountCreationResults([]);
                      setSelectedStudents([]);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Password Input Modal */}
        {showPasswordModal && selectedStudentForPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Create Account for {selectedStudentForPassword.name}</CardTitle>
                <CardDescription>
                  Set a password for the student account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Student Email</Label>
                  <Input 
                    id="studentEmail" 
                    value={selectedStudentForPassword.email} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordMethod">Password Generation Method</Label>
                  <select
                    id="passwordMethod"
                    value={passwordMethod}
                    onChange={(e) => setPasswordMethod(e.target.value as 'custom' | 'auto' | 'student+reg')}
                    className="border rounded h-10 px-3 w-full"
                  >
                    <option value="student+reg">Name + Register Number only</option>
                    <option value="auto">Auto-generated (student + register + special + random)</option>
                    <option value="custom">Custom password</option>
                  </select>
                  
                  {passwordMethod === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="customPassword">Custom Password</Label>
                      <Input
                        id="customPassword"
                        type="password"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        placeholder="Enter custom password"
                        required
                      />
                      <div className="text-xs text-gray-600">
                        Enter your own password for this student
                      </div>
                    </div>
                  )}
                  
                  {passwordMethod === 'auto' && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      <strong>Auto-generated password:</strong> student + register number + special character + random number
                      <br />
                      <strong>Example:</strong> StUdEnT123@456 (prefix: student, register: 123, special: @, random: 456)
                    </div>
                  )}
                  
                  {passwordMethod === 'student+reg' && (
                    <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                      <strong>Name + Register password:</strong> student name + register number
                      <br />
                      <strong>Example:</strong> john123 (name: John, register: 123) or sarah456 (name: Sarah, register: 456)
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedStudentForPassword(null);
                      setCustomPassword('');
                      setUseCustomPassword(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmCreateAccount}
                    disabled={accountCreationLoading || (useCustomPassword && !customPassword.trim())}
                  >
                    {accountCreationLoading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bulk Password Input Modal */}
        {showBulkPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Create Accounts for {selectedStudents.length} Students</CardTitle>
                <CardDescription>
                  Set password options for bulk account creation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkPasswordMethod">Password Generation Method</Label>
                  <select
                    id="bulkPasswordMethod"
                    value={bulkPasswordMethod}
                    onChange={(e) => setBulkPasswordMethod(e.target.value as 'custom' | 'auto' | 'student+reg')}
                    className="border rounded h-10 px-3 w-full"
                  >
                    <option value="student+reg">Name + Register Number only</option>
                    <option value="auto">Auto-generated (prefix + register + special + random)</option>
                    <option value="custom">Same password for all students</option>
                  </select>
                  
                  {bulkPasswordMethod === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="bulkCustomPassword">Password for All Students</Label>
                      <Input
                        id="bulkCustomPassword"
                        type="password"
                        value={bulkCustomPassword}
                        onChange={(e) => setBulkCustomPassword(e.target.value)}
                        placeholder="Enter password for all students"
                        required
                      />
                      <div className="text-xs text-gray-600">
                        This password will be used for all selected students
                      </div>
                    </div>
                  )}
                  
                  {bulkPasswordMethod === 'auto' && (
                    <div className="space-y-2">
                      <Label htmlFor="bulkPasswordPrefix">Password Prefix</Label>
                      <Input
                        id="bulkPasswordPrefix"
                        type="text"
                        value={bulkPasswordPrefix}
                        onChange={(e) => setBulkPasswordPrefix(e.target.value)}
                        placeholder="student"
                      />
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        <strong>Auto-generated passwords:</strong> Each student gets unique password: prefix + register + special char + random number
                        <br />
                        <strong>Example:</strong> StUdEnT123@456 (prefix: student, register: 123, special: @, random: 456)
                      </div>
                    </div>
                  )}
                  
                  {bulkPasswordMethod === 'student+reg' && (
                    <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                      <strong>Name + Register passwords:</strong> Each student gets: name + register number
                      <br />
                      <strong>Example:</strong> john123 (name: John, register: 123) or sarah456 (name: Sarah, register: 456)
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkPasswordModal(false);
                      setBulkPasswordPrefix('student');
                      setUseBulkCustomPassword(false);
                      setBulkCustomPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmBulkCreateAccounts}
                    disabled={accountCreationLoading || (useBulkCustomPassword && !bulkCustomPassword.trim())}
                  >
                    {accountCreationLoading ? 'Creating...' : `Create ${selectedStudents.length} Accounts`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
