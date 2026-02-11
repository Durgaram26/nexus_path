'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { themes, getTheme, setTheme } from '@/lib/theme-config';
import { User, Palette, Bell, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<string>('indigo');
  const [adminData, setAdminData] = useState({
    email: user?.email || '',
    name: (user?.email || 'admin').split('@')[0],
    phone: '',
    department: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    try {
      const t = getTheme();
      setCurrentTheme(t);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setCurrentTheme(themeId);
    toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}`);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // In a real implementation, you'd call an API endpoint to update the admin profile
      // For now, we'll just show a success toast
      toast.success('Profile updated successfully', {
        description: `Updated ${adminData.email}`
      });
      setIsEditingProfile(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to update profile', { description: errorMessage });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSavingPassword(true);
    try {
      // In a real implementation, you'd call an API endpoint to change the password
      // For now, we'll just show a success toast
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to change password', { description: errorMessage });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your admin profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-semibold text-foreground">{adminData.email}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-foreground">{adminData.name || 'Not set'}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                  <p className="text-sm font-semibold text-foreground">{adminData.phone || 'Not set'}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Department</p>
                  <p className="text-sm font-semibold text-foreground">{adminData.department || 'Not assigned'}</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsEditingProfile(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input
                    id="adminName"
                    type="text"
                    value={adminData.name}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="bg-[#EEF6FF] rounded-full h-12 px-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number</Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    value={adminData.phone}
                    onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="bg-[#EEF6FF] rounded-full h-12 px-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminDepartment">Department (Optional)</Label>
                <Input
                  id="adminDepartment"
                  type="text"
                  value={adminData.department}
                  onChange={(e) => setAdminData({ ...adminData, department: e.target.value })}
                  placeholder="Enter department"
                  className="bg-[#EEF6FF] rounded-full h-12 px-4"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="rounded-full h-12 bg-[#F59E0B] text-black hover:bg-[#f59a00]"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-full h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Choose your preferred color theme for the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Available Themes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      currentTheme === theme.id
                        ? 'border-primary bg-primary/5 ring-2 ring-offset-2 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div
                      className={`w-full h-12 rounded-lg mb-3 ${theme.preview}`}
                    />
                    <p className="text-sm font-semibold text-foreground text-left">{theme.name}</p>
                    <p className="text-xs text-muted-foreground text-left mt-1">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>✓ Theme applied:</strong> Your selected theme is now active across the entire platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Change your password to keep your account secure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button 
              onClick={() => setIsChangingPassword(true)}
              variant="outline"
            >
              Change Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-[#EEF6FF] rounded-full h-12 px-4"
                  required
                />
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-[#EEF6FF] rounded-full h-12 px-4"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isSavingPassword}
                  className="rounded-full h-12 bg-[#F59E0B] text-black hover:bg-[#f59a00]"
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded-full h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Notifications Settings (Placeholder) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">System Alerts</p>
                <p className="text-sm text-muted-foreground">Critical system notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
              <div>
                <p className="font-semibold text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Platform usage reports</p>
              </div>
              <input type="checkbox" className="w-5 h-5 cursor-pointer" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
