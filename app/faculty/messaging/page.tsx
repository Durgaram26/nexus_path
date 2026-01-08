'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { MessageComposer } from '@/components/faculty/MessageComposer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  TrendingUp 
} from 'lucide-react';

// Mock auth check - replace with your actual auth implementation
const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
};

interface Faculty {
  id: number;
  name: string;
  email: string;
  department: {
    name: string;
  };
}

export default function FacultyMessagingPage() {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await api.get('/auth/me');
        
        if (response.status === 200) {
          // The API returns faculty data directly, not nested under 'faculty'
          setFaculty(response.data);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Faculty not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Faculty Messaging
              </h1>
              <p className="text-gray-600">
                Send messages to individual students or broadcast to all students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {faculty?.department?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'compose' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('compose')}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Compose Message
          </Button>
          <Button
            variant={activeTab === 'sent' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sent')}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Sent Messages
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'compose' && (
          <MessageComposer 
            facultyId={faculty.id} 
            onMessageSent={() => {
              // Refresh sent messages or show success
              console.log('Message sent successfully');
            }}
          />
        )}

        {activeTab === 'sent' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Sent Messages
                </CardTitle>
                <CardDescription>
                  View and manage your sent messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages sent yet</h3>
                  <p className="text-gray-500">
                    Start by composing your first message to students
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Messages sent this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students Reached</CardTitle>
                <div className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Unique students contacted
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">
                  Student engagement rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}