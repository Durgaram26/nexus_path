'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { toast } from 'sonner';

export default function StudentSettingsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  // Auth Helper
  const getAuthPayload = () => {
    if (typeof window === 'undefined') return null;

    let token = localStorage.getItem('access_token');

    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
      }
    }

    if (!token) {
      localStorage.removeItem('access_token');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('access_token');
        return null;
      }
      return payload;
    } catch (error) {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authPayload = getAuthPayload();
      setIsAuth(!!authPayload);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuth) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {/* Theme Customization - NEW SECTION */}
        <ThemeSwitcher />

        {/* Profile Settings */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter your first name" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter your last name" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter your phone number" className="mt-1.5" />
            </div>
            <Button className="mt-2" onClick={() => toast.success('Profile updated successfully!')}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/40">
              <div>
                <Label htmlFor="email-notifications" className="text-base font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/40">
              <div>
                <Label htmlFor="push-notifications" className="text-base font-semibold">Push Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive push notifications in browser</p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/40">
              <div>
                <Label htmlFor="sms-notifications" className="text-base font-semibold">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive notifications via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-card border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy settings and account security
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/40">
              <div>
                <Label htmlFor="profile-visibility" className="text-base font-semibold">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">Make your profile visible to other students</p>
              </div>
              <Switch id="profile-visibility" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/40">
              <div>
                <Label htmlFor="activity-tracking" className="text-base font-semibold">Activity Tracking</Label>
                <p className="text-sm text-muted-foreground mt-1">Allow tracking of your learning activities</p>
              </div>
              <Switch id="activity-tracking" defaultChecked />
            </div>
            <Button variant="outline" className="mt-2">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
