'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Department {
  id: number;
  name: string;
  college: { name: string };
}

interface Account {
  id: number;
  email: string;
  role: string;
  name: string;
  department: string;
  registerNumber: string;
  year: number | null;
  password: string;
}

export default function AdminProvisionAccountsPage() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showExistingAccounts, setShowExistingAccounts] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | '' | 'faculty'>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/department');
      setDepartments(res.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to load departments', { description: errorMessage });
    }
  };

  useEffect(() => {
    fetchDepartments();
    // Don't automatically fetch accounts - let user choose
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('format', 'json'); // Request JSON instead of CSV
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      if (selectedDepartmentId) {
        params.append('departmentId', String(selectedDepartmentId));
      }
      if (selectedYear) {
        params.append('year', String(selectedYear));
      }

      const endpoint = `/provision/accounts?${params.toString()}`;
      const res = await api.get(endpoint);
      
      setAccounts(res.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to load accounts', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const downloadAccounts = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      if (selectedDepartmentId) {
        params.append('departmentId', String(selectedDepartmentId));
      }
      if (selectedYear) {
        params.append('year', String(selectedYear));
      }

      const endpoint = `/provision/accounts${params.toString() ? '?' + params.toString() : ''}`;
      const res = await api.get(endpoint, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounts-${selectedRole}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV downloaded', { description: `Downloaded filtered accounts` });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to download accounts', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              View and download existing user accounts. You can filter by role, department, and year.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle for showing existing accounts */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showExisting"
                checked={showExistingAccounts}
                onChange={(e) => setShowExistingAccounts(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showExisting" className="text-sm">
                Show existing accounts (optional)
              </Label>
            </div>

            {/* Filters - only show when toggle is on */}
            {showExistingAccounts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">Role</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                >
                  <option value="all">All Roles</option>
                  <option value="">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
              <div>
                <Label className="mb-2 block">Department</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={selectedDepartmentId} 
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-2 block">Year (Students)</Label>
                <select 
                  className="border rounded h-10 px-3 w-full" 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : '')}
                >
                  <option value="">All Years</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              </div>
            )}

            {/* Action Buttons - only show when toggle is on */}
            {showExistingAccounts && (
              <div className="flex gap-2">
                <Button 
                  onClick={fetchAccounts} 
                  disabled={loading}
                  className="flex-1"
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Show Accounts'}
                </Button>
                <Button 
                  onClick={downloadAccounts} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Downloading...' : 'Download CSV'}
                </Button>
              </div>
            )}

            {showExistingAccounts && (
              <div className="text-sm text-gray-600 mt-4">
                <p><strong>Note:</strong> Only accounts that have been created will appear in the results.</p>
                <p>Includes: ID, Email, Role, Name, Department, Register Number (students), Password</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts Table - only show when toggle is on and accounts exist */}
        {showExistingAccounts && accounts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Provisioned Accounts ({accounts.length})</CardTitle>
              <CardDescription>User accounts with their credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Role</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Department</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Register #</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{account.id}</td>
                        <td className="px-4 py-2 text-sm">{account.email}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.role === 'admin' ? 'bg-red-100 text-red-800' :
                            account.role === 'faculty' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {account.role}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">{account.name || '-'}</td>
                        <td className="px-4 py-2 text-sm">{account.department || '-'}</td>
                        <td className="px-4 py-2 text-sm">{account.registerNumber || '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {account.password || 'Not set'}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Default message when toggle is off */}
        {!showExistingAccounts && (
          <Card className="mt-6">
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">👥 Account Management</p>
                <p>Enable the toggle above to view and manage existing user accounts.</p>
                <p className="text-sm mt-2">You can filter by role, department, and year, then download CSV files.</p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
