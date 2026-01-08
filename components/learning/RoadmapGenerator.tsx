'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

interface RoadmapGeneratorProps {
  onRoadmapGenerated: (roadmap: any) => void;
  onClose: () => void;
}

interface CareerPath {
  id: number;
  name: string;
  description: string | null;
}

interface Department {
  id: number;
  name: string;
}

interface GeneratedRoadmap {
  id: number;
  title: string;
  description: string;
  totalDuration: string;
  year: number;
  careerPath: string;
  department: string;
  studentLevel: string;
  milestones: any[];
  learningPath: string;
  careerOutcomes: string[];
  createdAt: string;
  createdBy: any;
}

export default function RoadmapGenerator({ onRoadmapGenerated, onClose }: RoadmapGeneratorProps) {
  const [formData, setFormData] = useState({
    year: '',
    careerPath: '',
    department: '',
    studentLevel: 'beginner'
  });
  const [availableCareerPaths, setAvailableCareerPaths] = useState<CareerPath[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch career paths
        const careerResponse = await api.get('/career-path');
        setAvailableCareerPaths(careerResponse.data || []);
        
        // Fetch departments
        const departmentResponse = await api.get('/department');
        setAvailableDepartments(departmentResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.careerPath || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/learning/roadmap', formData);
      
      if (response.data.success) {
        toast.success('Roadmap generated successfully!');
        onRoadmapGenerated(response.data.roadmap);
        onClose();
      } else {
        toast.error('Failed to generate roadmap');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap', {
        description: error.response?.data?.error || 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Generate AI-Powered Learning Roadmap
            </CardTitle>
            <CardDescription>
              Create a personalized learning roadmap using Gemini AI based on year and assigned career path
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Academic Year *</Label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="border rounded h-10 px-3 w-full bg-white mt-1"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="studentLevel">Student Level</Label>
                  <select
                    id="studentLevel"
                    name="studentLevel"
                    value={formData.studentLevel}
                    onChange={handleInputChange}
                    className="border rounded h-10 px-3 w-full bg-white mt-1"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="careerPath">Career Path *</Label>
                <select
                  id="careerPath"
                  name="careerPath"
                  value={formData.careerPath}
                  onChange={handleInputChange}
                  className="border rounded h-10 px-3 w-full bg-white mt-1"
                  required
                  disabled={loading}
                >
                  <option value="">Select Career Path</option>
                  {availableCareerPaths.map((careerPath) => (
                    <option key={careerPath.id} value={careerPath.name}>
                      {careerPath.name}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="text-sm text-gray-500 mt-1">Loading career paths...</p>
                )}
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="border rounded h-10 px-3 w-full bg-white mt-1"
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  {availableDepartments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="text-sm text-gray-500 mt-1">Loading departments...</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What will be generated:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Comprehensive learning milestones</li>
                  <li>• Progressive skill development path</li>
                  <li>• Industry-relevant projects and resources</li>
                  <li>• Career outcomes and opportunities</li>
                  <li>• Time-based learning schedule</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generating Roadmap...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Generate Roadmap
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
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
