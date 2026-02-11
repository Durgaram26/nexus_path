'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Faculty {
  id: string;
  email: string;
  name: string;
  departmentId: string;
  department?: { name: string };
}

interface College { id: string; name: string }
interface Department { id: string; name: string; college: College }

interface Student {
  id: string;
  email: string;
  name: string;
  departmentId: string;
  year: number;
}

export default function AdminUserManagementPage() {
  // Single account creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'auto' | 'admin'>('auto');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData: { email: string; password: string; role?: string } = { email, password };
      
      // Only send role if it's explicitly set to admin
      if (userRole === 'admin') {
        requestData.role = 'admin';
      }
      
      const response = await api.post('/users', requestData);
      const createdRole = response.data?.role ?? 'unknown';
      toast.success('User created', { description: `${email} (${createdRole})` });
      setEmail('');
      setPassword('');
      setUserRole('auto'); // Reset to auto
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create user', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (role: 'admin' | 'student' | 'faculty') => {
    try {
      const response = await api.get(`/users?role=${role}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role}-users.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to download CSV', { description: errorMessage });
    }
  };

  // Bulk account creation (based on entities)
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterFacultyDepartmentId, setFilterFacultyDepartmentId] = useState<string>('');

  const [mode, setMode] = useState<'auto' | 'smart' | 'nameReg' | 'nameDept' | 'manual'>('smart');
  const [manualPassword, setManualPassword] = useState('');
  const [downloadCsvAfterCreate, setDownloadCsvAfterCreate] = useState(true);
  const [hideExistingAccounts, setHideExistingAccounts] = useState(false);
  const [existingUserEmails, setExistingUserEmails] = useState<Set<string>>(new Set());


  const fetchExistingUsers = async () => {
    try {
      // Get both faculty and student users
      const [facultyResponse, studentResponse] = await Promise.all([
        api.get('/users?role=faculty&format=json'),
        api.get('/users?role=student&format=json')
      ]);
      
      const facultyEmails: string[] = facultyResponse.data.map((user: any) => user.email).filter((email: any) => typeof email === 'string');
      const studentEmails: string[] = studentResponse.data.map((user: any) => user.email).filter((email: any) => typeof email === 'string');
      
      const allEmails = [...facultyEmails, ...studentEmails];
      const userEmails = new Set<string>(allEmails);
      setExistingUserEmails(userEmails);
    } catch (error: unknown) {
      console.error('Failed to fetch existing users:', error);
      // Don't show error toast for this as it's not critical
    }
  };

  const fetchLists = async () => {
    try {
      const [f, s, d] = await Promise.all([
        api.get('/faculty'),
        api.get('/student'),
        api.get('/department'),
      ]);
      setFaculties(f.data);
      // The student API returns { success: true, students: [...] }
      setStudents(s.data.students || []);
      setDepartments(d.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to load lists', { description: errorMessage });
      // Ensure students is always an array even on error
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchExistingUsers();
  }, []);


  const filteredStudents = (students && Array.isArray(students) ? students : []).filter(s => {
    const matchesFilters = (filterDepartmentId ? s.departmentId === filterDepartmentId : true) &&
      (filterYear ? s.year === filterYear : true);
    
    if (hideExistingAccounts && existingUserEmails.has(s.email)) {
      return false; // Hide already created accounts
    }
    
    return matchesFilters;
  });

  const filteredFaculties = (faculties && Array.isArray(faculties) ? faculties : []).filter(f => {
    const matchesFilters = (filterFacultyDepartmentId ? f.departmentId === filterFacultyDepartmentId : true);
    
    if (hideExistingAccounts && existingUserEmails.has(f.email)) {
      return false; // Hide already created accounts
    }
    
    return matchesFilters;
  });

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleAllFaculties = () => {
    if (selectedFacultyIds.length === filteredFaculties.length) {
      setSelectedFacultyIds([]);
    } else {
      setSelectedFacultyIds(filteredFaculties.map(f => f.id));
    }
  };

  const provisionSelected = async () => {
    setLoading(true);
    try {
      const res = await api.post('/users/bulk', {
        facultyIds: selectedFacultyIds,
        studentIds: selectedStudentIds,
        mode,
        manualPassword: mode === 'manual' ? manualPassword : undefined}, { responseType: 'blob' });

      if (downloadCsvAfterCreate) {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `created-accounts-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Accounts created and CSV downloaded');
      } else {
        toast.success('Accounts created');
      }
      setSelectedFacultyIds([]);
      setSelectedStudentIds([]);
      // Refresh existing users list to update the hide toggle
      fetchExistingUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create accounts', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        {/* Single account creation */}
        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>Admin can create faculty, student, or admin accounts. Passwords are exported only when requested.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-1 md:col-span-5 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="bg-[#EEF6FF] border-transparent placeholder:text-[#64748B] rounded-full h-12 px-4" />
              </div>
              <div className="col-span-1 md:col-span-5 space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="bg-[#EEF6FF] border-transparent placeholder:text-[#64748B] rounded-full h-12 px-4" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2 self-start">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="border border-border rounded-full h-12 px-4 w-full bg-[#EEF6FF]"
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value as 'auto' | 'admin')}
                >
                  <option value="auto">Auto-detect (Faculty/Student)</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="text-xs text-muted-foreground">
                  {userRole === 'auto' 
                    ? 'Role will be determined by existing faculty/student records' 
                    : 'Creates an admin account (no faculty/student record required)'}
                </div>
              </div>
              <div className="col-span-1 md:col-span-12">
                <div className="mt-2">
                  <Button type="submit" disabled={loading} className="w-full rounded-full h-12 bg-[#F59E0B] text-black hover:bg-[#f59a00]">{loading ? 'Creating...' : 'Create User'}</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bulk account creation */}
        <Card>
          <CardContent className="space-y-6">
            <CardHeader>
              <CardTitle>Bulk Account Creation</CardTitle>
              <CardDescription>Create accounts in bulk from existing Faculty/Student records. Choose filters, select individuals or all, and choose how passwords are generated.</CardDescription>
            </CardHeader>

            {/* Toggle for hiding existing accounts */}
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="hideExisting" checked={hideExistingAccounts} onCheckedChange={(v)=>setHideExistingAccounts(Boolean(v))} />
              <Label htmlFor="hideExisting" className="text-sm">
                Hide already created accounts
              </Label>
            </div>
            
            {hideExistingAccounts && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <div className="text-sm text-blue-800">
                  <strong>Filtering enabled:</strong> Only showing faculty and students who don't have user accounts yet.
                  {existingUserEmails.size > 0 && (
                    <span className="ml-1">({existingUserEmails.size} existing accounts hidden)</span>
                  )}
                </div>
              </div>
            )}
            {/* Password Mode Selection */}
            <div>
              <Label className="mb-2 block font-semibold">Password Generation Mode</Label>
              <select className="border border-border rounded-full h-12 px-4 w-full bg-[#EEF6FF]" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
                <option value="smart">⭐ Smart (Best for Both) - Recommended</option>
                <option value="auto">🔒 Random Strong Passwords</option>
                <option value="nameReg">👨‍🎓 Name + Register Number (Students Only)</option>
                <option value="nameDept">👨‍🏫 Name@Department (Faculty Only)</option>
                <option value="manual">🔑 Manual (Same Password for All)</option>
              </select>
              <div className="text-xs text-muted-foreground mt-2 bg-muted/5 p-2 rounded border border-border">
                {mode === 'smart' && (
                  <div>
                    <strong>✨ Smart Mode - Perfect for creating both at once:</strong>
                    <div className="mt-1 space-y-1">
                      <div>• Students get: <code className="bg-white px-1">name+registerNumber</code> (e.g., johnsmith123456)</div>
                      <div>• Faculty get: <code className="bg-white px-1">name@department</code> (e.g., johnsmith@computerscience)</div>
                      <div className="text-green-700 mt-1">✓ Works perfectly for bulk creation of both roles!</div>
                    </div>
                  </div>
                )}
                {mode === 'auto' && (
                  <>
                    <strong>Auto Mode:</strong> All selected users (faculty & students) get random secure passwords
                  </>
                )}
                {mode === 'nameReg' && (
                  <>
                    <strong>Student Mode:</strong> Students get <code className="bg-white px-1">name+registerNumber</code> (e.g., johnsmith123456)
                    {selectedFacultyIds.length > 0 && (
                      <div className="text-orange-700 mt-1">⚠️ Faculty will get random passwords (not name+reg)</div>
                    )}
                  </>
                )}
                {mode === 'nameDept' && (
                  <>
                    <strong>Faculty Mode:</strong> Faculty get <code className="bg-white px-1">name@department</code> (e.g., johnsmith@computerscience)
                    {selectedStudentIds.length > 0 && (
                      <div className="text-orange-700 mt-1">⚠️ Students will get random passwords (not name@dept)</div>
                    )}
                  </>
                )}
                {mode === 'manual' && (
                  <>
                    <strong>Manual Mode:</strong> All selected users (faculty & students) get the same password you enter below
                  </>
                )}
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Faculty by Department</Label>
                <select className="border border-border rounded-full h-12 px-4 w-full bg-[#EEF6FF]" value={filterFacultyDepartmentId} onChange={(e)=>setFilterFacultyDepartmentId(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-2 block">Students by Department</Label>
                <select className="border border-border rounded-full h-12 px-4 w-full bg-[#EEF6FF]" value={filterDepartmentId} onChange={(e)=>setFilterDepartmentId(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year for Students */}
            <div>
              <Label className="mb-2 block">Students by Year</Label>
              <select className="border border-border rounded-full h-12 px-4 w-full bg-[#EEF6FF]" value={filterYear} onChange={(e)=>setFilterYear(e.target.value ? parseInt(e.target.value) : '')}>
                <option value="">All Years</option>
                {[1,2,3,4,5].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            {mode === 'manual' && (
              <div>
                <Label htmlFor="manualPassword" className="mb-2 block">Manual Password</Label>
                <Input id="manualPassword" type="text" value={manualPassword} onChange={(e)=>setManualPassword(e.target.value)} placeholder="Enter password to assign" />
              </div>
            )}

            {/* Faculty list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Select Faculty ({filteredFaculties.length})</h3>
                  <Button variant="ghost" size="sm" onClick={toggleAllFaculties} disabled={filteredFaculties.length === 0} className="ml-auto">
                  {selectedFacultyIds.length === filteredFaculties.length && filteredFaculties.length > 0 ? 'Unselect All' : 'Select All (Filtered)'}
                </Button>
              </div>
              {filteredFaculties.length === 0 ? (
                <div className="text-muted-foreground">No faculty members match the current filters.</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredFaculties.map(faculty => (
                    <div key={faculty.id} className="w-full">
                      <div className="w-full bg-white border border-border rounded-lg px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`faculty-${faculty.id}`}
                            checked={selectedFacultyIds.includes(faculty.id)}
                            onCheckedChange={() => setSelectedFacultyIds(prev => prev.includes(faculty.id) ? prev.filter(id => id !== faculty.id) : [...prev, faculty.id])}
                          />
                          <div>
                            <div className="font-medium">{faculty.name}</div>
                            <div className="text-xs text-muted-foreground">{faculty.email}</div>
                          </div>
                        </div>
                        <div className="text-[12px] text-muted-foreground">{faculty?.department?.name || 'No Department'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Students with Select All */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Select Students ({filteredStudents.length})</h3>
                <div>
                  <Button variant="ghost" size="sm" onClick={toggleAllStudents} disabled={filteredStudents.length === 0} className="text-sm">
                    {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? 'Unselect All' : 'Select All (Filtered)'}
                  </Button>
                </div>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="text-muted-foreground">No students match the current filters.</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="w-full">
                      <div className="w-full bg-white border border-border rounded-lg px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={() => setSelectedStudentIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id])}
                          />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email} • Year {student.year}</div>
                          </div>
                        </div>
                        <div className="text-[12px] text-muted-foreground">{departments.find(d => d.id === student.departmentId)?.name || 'Unknown Department'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary before creation */}
            {(selectedFacultyIds.length > 0 || selectedStudentIds.length > 0) && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-semibold text-green-900 mb-2">📋 Creation Summary</h4>
                <div className="text-sm text-green-800 space-y-1">
                  {selectedFacultyIds.length > 0 && (
                    <div>
                      ✓ <strong>{selectedFacultyIds.length} Faculty</strong> account{selectedFacultyIds.length > 1 ? 's' : ''} will be created
                      {mode === 'smart' && ' with name@department passwords'}
                      {mode === 'nameDept' && ' with name@department passwords'}
                      {mode === 'nameReg' && ' with random passwords'}
                      {mode === 'auto' && ' with random passwords'}
                      {mode === 'manual' && ' with your manual password'}
                    </div>
                  )}
                  {selectedStudentIds.length > 0 && (
                    <div>
                      ✓ <strong>{selectedStudentIds.length} Student</strong> account{selectedStudentIds.length > 1 ? 's' : ''} will be created
                      {mode === 'smart' && ' with name+registerNumber passwords'}
                      {mode === 'nameReg' && ' with name+registerNumber passwords'}
                      {mode === 'nameDept' && ' with random passwords'}
                      {mode === 'auto' && ' with random passwords'}
                      {mode === 'manual' && ' with your manual password'}
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-green-300">
                    Total: <strong>{selectedFacultyIds.length + selectedStudentIds.length}</strong> accounts
                  </div>
                </div>
              </div>
            )}

            {/* Download CSV toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox id="dlcsv" checked={downloadCsvAfterCreate} onCheckedChange={(v)=>setDownloadCsvAfterCreate(Boolean(v))} />
              <Label htmlFor="dlcsv">Download CSV after creation</Label>
            </div>

            <Button 
              onClick={provisionSelected} 
              disabled={loading || (selectedFacultyIds.length === 0 && selectedStudentIds.length === 0) || (mode==='manual' && manualPassword.trim()==='')}
              className="w-full"
            >
              {loading ? 'Creating...' : `Create ${selectedFacultyIds.length + selectedStudentIds.length} Account${selectedFacultyIds.length + selectedStudentIds.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>

    </div>
  );
}
