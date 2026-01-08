'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/src/lib/auth';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
      toast.success("Login Successful", {
        description: "You have been successfully logged in."});
      router.push('/'); // Redirect to main page which will handle role-based routing
    } catch (error: unknown) {
      console.error('Login details:', {
        error: error,
        message: (error as any)?.message,
        code: (error as any)?.code,
        name: (error as any)?.name,
        stack: (error as any)?.stack,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        config: {
          url: (error as any)?.config?.url,
          baseURL: (error as any)?.config?.baseURL,
          method: (error as any)?.config?.method
        }
      });
      
      // More detailed handling
      let errorMessage = "An unexpected error occurred.";
      
      if ((error as any)?.response?.data?.error?.message) {
        errorMessage = (error as any).response.data.error.message;
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message;
      } else if ((error as any)?.code === 'NETWORK_ERROR') {
        errorMessage = "Network error - please check your connection.";
      } else if ((error as any)?.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server - please try again.";
      }
      
      toast.error("Login Failed", {
        description: errorMessage});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
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
  );
}
