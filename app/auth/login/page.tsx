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
import { BookOpen, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth', { email, password });

      setAuthToken(response.data.access_token);
      setErrorMessage('');
      toast.success("Login Successful", {
        description: "You have been successfully logged in.",
        position: 'top-center'
      });
      router.push('/');
    } catch (error: unknown) {
      let displayMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";

      if ((error as any)?.response?.data?.error?.message) {
        displayMessage = (error as any).response.data.error.message;
        const errorCode = (error as any)?.response?.data?.error?.code;

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

      setErrorMessage(displayMessage);

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
    <div className="flex min-h-screen">
      <Toaster position="top-center" />

      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4F46E5] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-300/8 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <BookOpen className="w-6 h-6 text-indigo-200" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Profectus</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Shape Your Career<br />
            With Guided Learning
          </h1>
          <p className="text-indigo-200/80 text-lg leading-relaxed max-w-md">
            A comprehensive learning management platform designed to help students navigate their career paths,
            track progress, and achieve academic excellence.
          </p>

          <div className="mt-16 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white/90">Personalized Learning Roadmaps</p>
                <p className="text-sm text-indigo-200/60 mt-1">AI-powered career path recommendations tailored to your goals</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white/90">Progress Tracking & Analytics</p>
                <p className="text-sm text-indigo-200/60 mt-1">Real-time insights into your academic performance</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white/90">Industry Mentor Connections</p>
                <p className="text-sm text-indigo-200/60 mt-1">Connect with professionals for career guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">Profectus</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Welcome back</h2>
            <p className="text-[#64748B] mt-2 text-[15px]">Sign in to continue to your dashboard</p>
          </div>

          <Card className="border-[#E2E8F0] shadow-sm bg-white">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {errorMessage && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-lg">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#334155] font-medium text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 transition-all duration-200 text-[#0F172A] placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#334155] font-medium text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-11 border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#4F46E5] focus:ring-[#4F46E5]/20 transition-all duration-200 text-[#0F172A] placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium transition-all duration-200 cursor-pointer group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-[13px] text-[#94A3B8] mt-8">
            Profectus Learning Management System
          </p>
        </div>
      </div>
    </div>
  );
}
