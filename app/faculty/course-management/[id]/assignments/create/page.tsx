'use client';

import { useState, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Save,
  ArrowLeft,
  FileText,
  Calendar,
  Target
} from 'lucide-react';

export default function CreateAssignment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    isMandatory: false,
    submissionType: 'file' as 'file' | 'text' | 'code' | 'quiz'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter assignment title');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/faculty/courses/${resolvedParams.id}/assignments`, formData);
      
      if (response.data.success) {
        toast.success('Assignment created successfully');
        router.push(`/faculty/course-management/${resolvedParams.id}/assignments`);
      } else {
        toast.error(response.data.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create assignment';
      toast.error('Error', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Assignment</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new assignment to your course</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Assignment Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter assignment description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="dueDate" className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {/* Max Points */}
              <div>
                <Label htmlFor="maxPoints" className="text-base font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Maximum Points
                </Label>
                <Input
                  id="maxPoints"
                  type="number"
                  placeholder="100"
                  value={formData.maxPoints}
                  onChange={(e) => handleInputChange('maxPoints', parseInt(e.target.value) || 0)}
                  className="mt-2"
                  min="0"
                />
              </div>

              {/* Submission Type */}
              <div>
                <Label htmlFor="submissionType" className="text-base font-semibold">
                  Submission Type
                </Label>
                <select
                  id="submissionType"
                  value={formData.submissionType}
                  onChange={(e) => handleInputChange('submissionType', e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="file">File Submission</option>
                  <option value="text">Text Submission</option>
                  <option value="code">Code Submission</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              {/* Mandatory */}
              <div className="flex items-center gap-3">
                <input
                  id="isMandatory"
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(e) => handleInputChange('isMandatory', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isMandatory" className="text-base font-semibold cursor-pointer">
                  Mark as Mandatory
                </Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Assignment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
