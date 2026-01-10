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

export default function AdminCollegePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/college');
      setColleges(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to fetch colleges', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/college', { name: newCollegeName });
      toast.success('College created', { description: newCollegeName });
      setNewCollegeName('');
      fetchColleges();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create college', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    setLoading(true);
    try {
      await api.put('/college', { id: editingCollege.id, name: editingCollege.name });
      toast.success('College updated', { description: editingCollege.name });
      setEditingCollege(null);
      fetchColleges();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update college', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    setLoading(true);
    try {
      await api.delete('/college', { data: { id } });
      toast.success('College deleted');
      fetchColleges();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to delete college', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <Card className="mb-6">
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{editingCollege ? 'Edit College' : 'Create College'}</h2>
              <p className="text-gray-600">{editingCollege ? 'Update an existing college.' : 'Add a new college to the system.'}</p>
            </div>
            <form onSubmit={editingCollege ? handleUpdateCollege : handleCreateCollege} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  type="text"
                  value={editingCollege ? editingCollege.name : newCollegeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => (editingCollege ? setEditingCollege({ ...editingCollege, name: e.target.value }) : setNewCollegeName(e.target.value))}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (editingCollege ? 'Updating...' : 'Creating...') : (editingCollege ? 'Update College' : 'Create College')}
              </Button>
              {editingCollege && (
                <Button variant="outline" onClick={() => setEditingCollege(null)} className="w-full mt-2">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Existing Colleges</h2>
              <p className="text-gray-600">Manage your colleges.</p>
            </div>
            {loading && colleges.length === 0 ? (
              <div>Loading colleges...</div>
            ) : colleges.length === 0 ? (
              <div>No colleges found.</div>
            ) : (
              <ul className="space-y-3">
                {colleges.map((college) => (
                  <li key={college.id} className="flex items-center justify-between p-3 border rounded-md">
                    <span>{college.name}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCollege(college)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteCollege(college.id)}>
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
