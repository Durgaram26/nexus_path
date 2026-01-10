'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/src/lib/auth';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // const { toast } = useToast(); // Removed useToast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with:', { email, password: '***' });
      console.log('API base URL:', api.defaults.baseURL);
      console.log('API withCredentials:', api.defaults.withCredentials);
      console.log('Current URL:', window.location.href);
      
      const response = await api.post('/auth', { email, password });
      console.log('Login response:', response.data);
      
      setAuthToken(response.data.access_token);
      setErrorMessage(''); // Clear error on success
      toast.success("Login Successful", {
        description: "You have been successfully logged in.",
        position: 'top-center'
      });
      router.push('/'); // Redirect to main page which will handle role-based routing
    } catch (error: unknown) {
      let displayMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";
      
      // Check for specific API error responses
      if ((error as any)?.response?.data?.error?.message) {
        displayMessage = (error as any).response.data.error.message;
        const errorCode = (error as any)?.response?.data?.error?.code;
        
        // Customize title based on error type
        if (errorCode === 'INVALID_PASSWORD') {
          errorTitle = "Incorrect Password";
        } else if (errorCode === 'USER_NOT_FOUND') {
          errorTitle = "Account Not Found";
        }
      } else if ((error as any)?.response?.status === 401) {
        displayMessage = "Invalid email or password. Please check and try again.";
      } else if ((error as any)?.code === 'NETWORK_ERROR') {
        displayMessage = "Network error - please check your connection.";
        errorTitle = "Connection Error";
      } else if ((error as any)?.code === 'ECONNREFUSED') {
        displayMessage = "Cannot connect to server - please try again later.";
        errorTitle = "Server Unavailable";
      } else if ((error as any)?.message) {
        displayMessage = (error as any).message;
      }
      
      // Set error state to display on page
      setErrorMessage(displayMessage);
      
      // Show toast notification as popup
      toast.error(errorTitle, {
        description: displayMessage,
        duration: 5000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-center" />
      <div className="w-[350px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Profectus</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Learning & Career Path Platform</p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-semibold text-sm">{errorMessage}</p>
                  </div>
                )}
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-between p-0 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
