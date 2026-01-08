'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
}

export default function AdminCareerPathsPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [newCareerPathName, setNewCareerPathName] = useState('');
  const [newCareerPathDescription, setNewCareerPathDescription] = useState('');
  const [editingCareerPath, setEditingCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCareerPaths = async () => {
    setLoading(true);
    try {
      const response = await api.get('/career-path');
      setCareerPaths(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch career paths', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const handleCreateCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/career-path', { name: newCareerPathName, description: newCareerPathDescription });
      toast.success('Career path created', { description: newCareerPathName });
      setNewCareerPathName('');
      setNewCareerPathDescription('');
      fetchCareerPaths();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCareerPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCareerPath) return;
    setLoading(true);
    try {
      await api.put('/career-path', { 
        id: editingCareerPath.id, 
        name: editingCareerPath.name, 
        description: editingCareerPath.description 
      });
      toast.success('Career path updated', { description: editingCareerPath.name });
      setEditingCareerPath(null);
      fetchCareerPaths();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCareerPath = async (id: number) => {
    setLoading(true);
    try {
      await api.delete('/career-path', { data: { id } });
      toast.success('Career path deleted');
      fetchCareerPaths();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete career path', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <Card className="mb-6">
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{editingCareerPath ? 'Edit Career Path' : 'Create Career Path'}</h2>
              <p className="text-gray-600">{editingCareerPath ? 'Update an existing career path.' : 'Add a new career path to the system.'}</p>
            </div>
            <form onSubmit={editingCareerPath ? handleUpdateCareerPath : handleCreateCareerPath} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careerPathName">Career Path Name</Label>
                <Input
                  id="careerPathName"
                  type="text"
                  value={editingCareerPath ? editingCareerPath.name : newCareerPathName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (editingCareerPath ? setEditingCareerPath({ ...editingCareerPath, name: e.target.value }) : setNewCareerPathName(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="careerPathDescription">Description (Optional)</Label>
                <Input
                  id="careerPathDescription"
                  type="text"
                  value={editingCareerPath ? (editingCareerPath.description || '') : newCareerPathDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (editingCareerPath ? setEditingCareerPath({ ...editingCareerPath, description: e.target.value }) : setNewCareerPathDescription(e.target.value))}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (editingCareerPath ? 'Updating...' : 'Creating...') : (editingCareerPath ? 'Update Career Path' : 'Create Career Path')}
              </Button>
              {editingCareerPath && (
                <Button variant="outline" onClick={() => setEditingCareerPath(null)} className="w-full mt-2">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Existing Career Paths</h2>
              <p className="text-gray-600">Manage your career paths.</p>
            </div>
            {loading && careerPaths.length === 0 ? (
              <div>Loading career paths...</div>
            ) : careerPaths.length === 0 ? (
              <div>No career paths found.</div>
            ) : (
              <ul className="space-y-3">
                {careerPaths.map((careerPath) => (
                  <li key={careerPath.id} className="flex items-center justify-between p-3 border rounded-md">
                    <span>{careerPath.name} ({careerPath.description || 'No description'})</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCareerPath(careerPath)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCareerPath(careerPath.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
