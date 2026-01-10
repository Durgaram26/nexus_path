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
  description: string | null;
  collegeId: string;
  college: College;
}

export default function AdminDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [newDepartmentCollegeId, setNewDepartmentCollegeId] = useState<string>('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/college');
      setColleges(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch colleges', { description: errorMessage });
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/department');
      setDepartments(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch departments', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/department', { name: newDepartmentName, description: newDepartmentDescription, collegeId: newDepartmentCollegeId });
      toast.success('Department created', { description: newDepartmentName });
      setNewDepartmentName('');
      setNewDepartmentDescription('');
      setNewDepartmentCollegeId('');
      fetchDepartments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create department', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    setLoading(true);
    try {
      await api.put('/department', { 
        id: editingDepartment.id, 
        name: editingDepartment.name, 
        description: editingDepartment.description, 
        collegeId: editingDepartment.collegeId 
      });
      toast.success('Department updated', { description: editingDepartment.name });
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update department', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setLoading(true);
    try {
      await api.delete('/department', { data: { id } });
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete department', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <Card className="mb-6">
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{editingDepartment ? 'Edit Department' : 'Create Department'}</h2>
              <p className="text-gray-600">{editingDepartment ? 'Update an existing department.' : 'Add a new department to a college.'}</p>
            </div>
            <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  type="text"
                  value={editingDepartment ? editingDepartment.name : newDepartmentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (editingDepartment ? setEditingDepartment({ ...editingDepartment, name: e.target.value }) : setNewDepartmentName(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentDescription">Description (Optional)</Label>
                <Input
                  id="departmentDescription"
                  type="text"
                  value={editingDepartment ? (editingDepartment.description || '') : newDepartmentDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (editingDepartment ? setEditingDepartment({ ...editingDepartment, description: e.target.value }) : setNewDepartmentDescription(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                {colleges.length === 0 ? (
                  <div className="text-red-500 text-sm">
                    No colleges available. Please create a college first at <a href="/admin/college" className="underline">/admin/college</a>.
                  </div>
                ) : (
                  <select
                    id="college"
                    className="border rounded h-10 px-3 w-full"
                    value={editingDepartment ? editingDepartment.collegeId : newDepartmentCollegeId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (editingDepartment ? setEditingDepartment({ ...editingDepartment, collegeId: e.target.value }) : setNewDepartmentCollegeId(e.target.value))}
                    required
                  >
                    <option value="">Select a College</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Button type="submit" disabled={loading || colleges.length === 0} className="w-full">
                {loading ? (editingDepartment ? 'Updating...' : 'Creating...') : (editingDepartment ? 'Update Department' : 'Create Department')}
              </Button>
              {editingDepartment && (
                <Button variant="outline" onClick={() => setEditingDepartment(null)} className="w-full mt-2">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Existing Departments</h2>
              <p className="text-gray-600">Manage your departments, grouped by college.</p>
            </div>
            {loading && departments.length === 0 ? (
              <div>Loading departments...</div>
            ) : departments.length === 0 ? (
              <div>No departments found.</div>
            ) : (
              <ul className="space-y-3">
                {colleges.map(college => {
                  const departmentsInCollege = departments.filter(dept => dept.collegeId === college.id);
                  if (departmentsInCollege.length === 0) return null;
                  return (
                    <div key={college.id} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{college.name}</h3>
                      {departmentsInCollege.map((department) => (
                        <li key={department.id} className="flex items-center justify-between p-3 border rounded-md mb-2">
                          <span>{department.name} ({department.description || 'No description'})</span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingDepartment(department)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDepartment(department.id)}>
                              Delete
                            </Button>
                          </div>
                        </li>
                      ))}
                    </div>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
