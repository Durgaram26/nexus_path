'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  Users,
  Target,
  FileText,
  Code,
  ClipboardList
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  isMandatory: boolean;
  submissionType: 'file' | 'text' | 'code' | 'quiz';
}

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'beginner',
    category: '',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    courseType: 'online' as 'online' | 'offline' | 'hybrid',
    location: '',
    meetingLink: '',
    isMandatory: false
  });

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: '',
      description: '',
      dueDate: '',
      maxPoints: 100,
      isMandatory: false,
      submissionType: 'file'
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const updateAssignment = (id: string, field: string, value: any) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === id 
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Handle the API call with a more robust approach
    const makeApiCall = async () => {
      return new Promise((resolve) => {
        console.log('Attempting to create course');
        
        const coursePayload = {
          ...courseData,
          assignments: assignments.map(assignment => ({
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints,
            isMandatory: assignment.isMandatory,
            submissionType: assignment.submissionType
          }))
        };

        api.post('/faculty/courses', coursePayload)
          .then((response) => {
            console.log('API response received:', response);
            resolve({ success: true, data: response });
          })
          .catch((error: any) => {
            console.log('API call failed:', error);
            console.log('Error type:', typeof error);
            console.log('Error response:', error.response);
            console.log('Error status:', error.response?.status);
            console.log('Error code:', error.code);
            resolve({ success: false, error });
          });
      });
    };

    try {
      const result: any = await makeApiCall();
      
      if (result.success && result.data.data.success) {
        toast.success('Course created successfully!');
        router.push('/faculty/course-management');
      } else if (!result.success) {
        // Handle API errors
        const error = result.error;
        if (error.response?.status === 404) {
          console.warn('API endpoint not implemented yet. Using preview mode.');
          toast.info('Course management API is not yet implemented. This is a preview of the interface.');
          // Still navigate back to show the interface
          router.push('/faculty/course-management');
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          console.warn('Network error - API might not be available');
          toast.info('Course management API is not yet implemented. This is a preview of the interface.');
          router.push('/faculty/course-management');
        } else if (error.response?.status >= 500) {
          console.warn('Server error:', error.response?.status);
          toast.error('Server error. Please try again later.');
        } else {
          console.warn('Error details:', error.response?.data);
          toast.error('Failed to create course');
        }
      } else {
        throw new Error('Failed to create course');
      }
    } catch (error: any) {
      console.warn('Unexpected error in handleSubmit:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-2">Set up a new course with assignments and requirements</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Advanced Machine Learning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor (Optional)</Label>
                <Input
                  id="instructor"
                  value={courseData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  placeholder="e.g., Dr. Sarah Johnson (leave blank if TBD)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the course content, objectives, and what students will learn..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={courseData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 12 weeks"
                  required
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <select
                  id="level"
                  value={courseData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="border rounded h-10 px-3 w-full bg-white"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={courseData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxStudents">Maximum Students *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={courseData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={courseData.isMandatory}
                    onChange={(e) => handleInputChange('isMandatory', e.target.checked)}
                    className="rounded"
                  />
                  <Target className="w-4 h-4" />
                  Mandatory Course
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Type and Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Course Type & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Course Type *</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="courseType"
                    value="online"
                    checked={courseData.courseType === 'online'}
                    onChange={(e) => handleInputChange('courseType', e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Online</div>
                    <div className="text-sm text-gray-500">Virtual classes</div>
                  </div>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="courseType"
                    value="offline"
                    checked={courseData.courseType === 'offline'}
                    onChange={(e) => handleInputChange('courseType', e.target.value)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">Offline</div>
                    <div className="text-sm text-gray-500">Physical classes</div>
                  </div>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="courseType"
                    value="hybrid"
                    checked={courseData.courseType === 'hybrid'}
                    onChange={(e) => handleInputChange('courseType', e.target.value)}
                    className="text-purple-600"
                  />
                  <div>
                    <div className="font-medium">Hybrid</div>
                    <div className="text-sm text-gray-500">Both online & offline</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={courseData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={courseData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Course Type specific fields */}
            {courseData.courseType === 'offline' && (
              <div>
                <Label htmlFor="location">Physical Location *</Label>
                <Input
                  id="location"
                  value={courseData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Room 201, Computer Science Building"
                  required
                />
              </div>
            )}

            {courseData.courseType === 'online' && (
              <div>
                <Label htmlFor="meetingLink">Meeting Link *</Label>
                <Input
                  id="meetingLink"
                  value={courseData.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                  required
                />
              </div>
            )}

            {courseData.courseType === 'hybrid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Physical Location</Label>
                  <Input
                    id="location"
                    value={courseData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Room 201, Computer Science Building"
                  />
                </div>
                <div>
                  <Label htmlFor="meetingLink">Online Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={courseData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    placeholder="e.g., https://zoom.us/j/123456789"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Course Assignments (Optional)
              </CardTitle>
              <Button
                type="button"
                onClick={addAssignment}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Assignment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No assignments added yet. Assignments are optional - you can add them later or skip this section entirely.</p>
                <p className="text-sm mt-2">Click "Add Assignment" to create your first assignment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Assignment {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`assignment-title-${assignment.id}`}>Assignment Title *</Label>
                        <Input
                          id={`assignment-title-${assignment.id}`}
                          value={assignment.title}
                          onChange={(e) => updateAssignment(assignment.id, 'title', e.target.value)}
                          placeholder="e.g., Neural Network Implementation"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`assignment-due-${assignment.id}`}>Due Date *</Label>
                        <Input
                          id={`assignment-due-${assignment.id}`}
                          type="date"
                          value={assignment.dueDate}
                          onChange={(e) => updateAssignment(assignment.id, 'dueDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`assignment-desc-${assignment.id}`}>Description *</Label>
                      <Textarea
                        id={`assignment-desc-${assignment.id}`}
                        value={assignment.description}
                        onChange={(e) => updateAssignment(assignment.id, 'description', e.target.value)}
                        placeholder="Describe the assignment requirements and expectations..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`assignment-points-${assignment.id}`}>Max Points *</Label>
                        <Input
                          id={`assignment-points-${assignment.id}`}
                          type="number"
                          value={assignment.maxPoints}
                          onChange={(e) => updateAssignment(assignment.id, 'maxPoints', parseInt(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`assignment-type-${assignment.id}`}>Submission Type *</Label>
                        <select
                          id={`assignment-type-${assignment.id}`}
                          value={assignment.submissionType}
                          onChange={(e) => updateAssignment(assignment.id, 'submissionType', e.target.value)}
                          className="border rounded h-10 px-3 w-full bg-white"
                          required
                        >
                          <option value="file">File Upload</option>
                          <option value="text">Text Submission</option>
                          <option value="code">Code Submission</option>
                          <option value="quiz">Quiz</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={assignment.isMandatory}
                            onChange={(e) => updateAssignment(assignment.id, 'isMandatory', e.target.checked)}
                            className="rounded"
                          />
                          <Target className="w-4 h-4" />
                          Mandatory
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Creating Course...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
