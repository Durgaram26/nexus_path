'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Target, CheckCircle, Clock, Brain, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function StudentLearningPlanPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savedSuggestions, setSavedSuggestions] = useState<any[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  // Debug: Monitor aiSuggestions changes
  useEffect(() => {
    console.log('aiSuggestions state changed:', aiSuggestions);
  }, [aiSuggestions]);

  // Helper function to extract current skills from roadmaps
  const extractCurrentSkills = (roadmaps: any[]) => {
    const skills = new Set<string>();
    console.log('Extracting skills from roadmaps:', roadmaps);
    
    roadmaps.forEach((roadmap, roadmapIndex) => {
      console.log(`Processing roadmap ${roadmapIndex}:`, roadmap.title);
      
      if (roadmap.milestones) {
        let milestones;
        try {
          milestones = typeof roadmap.milestones === 'string' 
            ? JSON.parse(roadmap.milestones) 
            : roadmap.milestones;
        } catch (error) {
          console.error('Error parsing milestones:', error);
          return;
        }
        
        milestones.forEach((milestone: any, milestoneIndex: number) => {
          console.log(`Processing milestone ${milestoneIndex}:`, milestone.title);
          
          if (milestone.activities) {
            let activities;
            try {
              activities = typeof milestone.activities === 'string'
                ? JSON.parse(milestone.activities)
                : milestone.activities;
            } catch (error) {
              console.error('Error parsing activities:', error);
              return;
            }
            
            activities.forEach((activity: any, activityIndex: number) => {
              console.log(`Processing activity ${activityIndex}:`, activity.title);
              
              if (activity.skills) {
                console.log('Activity skills (raw):', activity.skills, 'Type:', typeof activity.skills);
                
                let activitySkills;
                if (typeof activity.skills === 'string') {
                  try {
                    // Try to parse as JSON first
                    activitySkills = JSON.parse(activity.skills);
                    console.log('Parsed as JSON:', activitySkills);
                  } catch (error) {
                    console.log('JSON parse failed, treating as comma-separated string');
                    // If JSON parsing fails, treat as comma-separated string
                    activitySkills = activity.skills.split(',').map((s: string) => s.trim());
                    console.log('Split result:', activitySkills);
                  }
                } else {
                  activitySkills = activity.skills;
                }
                
                if (Array.isArray(activitySkills)) {
                  activitySkills.forEach((skill: string) => {
                    console.log('Adding skill:', skill);
                    skills.add(skill);
                  });
                } else {
                  console.log('Adding single skill:', activitySkills);
                  skills.add(activitySkills);
                }
              }
              if (activity.tool) {
                console.log('Adding tool:', activity.tool);
                skills.add(activity.tool);
              }
            });
          }
        });
      }
    });
    
    const skillsArray = Array.from(skills);
    console.log('Final extracted skills:', skillsArray);
    return skillsArray;
  };

  // Helper function to extract career goals from roadmaps
  const extractCareerGoals = (roadmaps: any[]) => {
    const goals = new Set<string>();
    roadmaps.forEach(roadmap => {
      if (roadmap.careerOutcomes) {
        const outcomes = typeof roadmap.careerOutcomes === 'string'
          ? JSON.parse(roadmap.careerOutcomes)
          : roadmap.careerOutcomes;
        outcomes.forEach((outcome: string) => goals.add(outcome));
      }
    });
    return Array.from(goals);
  };

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

  useEffect(() => {
    if (isAuth) {
      fetchLearningData();
      loadSavedSuggestions();
    }
  }, [isAuth]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned roadmaps
      const response = await api.get('/student/assigned-roadmaps');
      if (response.data.success && response.data.roadmaps) {
        setRoadmaps(response.data.roadmaps);
        
        // Calculate overall progress
        let totalProgress = 0;
        let roadmapCount = 0;
        
        response.data.roadmaps.forEach((roadmap: any) => {
          if (roadmap.progress !== undefined) {
            totalProgress += roadmap.progress;
            roadmapCount++;
          }
        });
        
        if (roadmapCount > 0) {
          setProgress(Math.round(totalProgress / roadmapCount));
        }
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    try {
      setLoadingAi(true);
      console.log('🤖 AI is analyzing your profile and generating personalized suggestions...');
      
      // Add realistic delay to simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
      
      console.log('🔍 Analyzing your interests and skill level...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds delay
      
      console.log('💡 Generating personalized roadmap suggestions...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
      
      // Call AI API to generate personalized suggestions based on current roadmap
      const response = await api.post('/ai/generate-roadmap-suggestions', {
        skillType: 'technical-skills',
        currentLevel: 'intermediate',
        interests: ['programming', 'data-science', 'cloud-computing'],
        currentRoadmaps: roadmaps,
        studentProfile: {
          academicYear: '3rd Year', // You can get this from user profile
          department: 'Computer Science', // You can get this from user profile
          currentSkills: extractCurrentSkills(roadmaps),
          careerGoals: extractCareerGoals(roadmaps)
        }
      });
      
      console.log('✅ AI suggestions generated successfully!');
      console.log('AI API response:', response.data);
      
      if (response.data.success) {
        // Add a final delay before showing results
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Setting AI suggestions:', response.data.suggestions);
        setAiSuggestions(response.data.suggestions);
        console.log('🎉 AI suggestions loaded:', response.data.suggestions);
        console.log('Current aiSuggestions state:', aiSuggestions);
      }
    } catch (error: any) {
      console.error('❌ Error generating AI suggestions:', error);
      console.log('🔄 Using intelligent fallback suggestions...');
      console.log('Error details:', error.response?.data || error.message);
      
      // Add delay even for fallback to maintain realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fallback: show some sample suggestions
      const fallbackSuggestions = [
        {
          title: "Python for Data Science",
          description: "Master Python programming for data analysis and machine learning",
          duration: "3 months",
          difficulty: "Intermediate",
          skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn"]
        },
        {
          title: "Full Stack Web Development",
          description: "Build complete web applications with modern technologies",
          duration: "4 months", 
          difficulty: "Beginner",
          skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]
        },
        {
          title: "Cloud Computing with AWS",
          description: "Learn cloud infrastructure and deployment strategies",
          duration: "2 months",
          difficulty: "Intermediate", 
          skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Infrastructure"]
        }
      ];
      console.log('Setting fallback suggestions:', fallbackSuggestions);
      setAiSuggestions(fallbackSuggestions);
      console.log('✅ Fallback suggestions set:', fallbackSuggestions);
      
      // Force a re-render by logging the state after a small delay
      setTimeout(() => {
        console.log('Current aiSuggestions state after fallback (delayed):', aiSuggestions);
      }, 100);
    } finally {
      setLoadingAi(false);
    }
  };

  const loadSavedSuggestions = async () => {
    try {
      const response = await api.get('/student/saved-suggestions');
      if (response.data.success) {
        setSavedSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error loading saved suggestions:', error);
      console.log('API failed, using localStorage fallback');
      // Load from localStorage as fallback
      try {
        const saved = localStorage.getItem('savedSuggestions');
        if (saved) {
          const parsedSaved = JSON.parse(saved);
          setSavedSuggestions(parsedSaved);
          console.log('Loaded from localStorage:', parsedSaved);
        } else {
          console.log('No saved suggestions in localStorage');
          setSavedSuggestions([]);
        }
      } catch (localError) {
        console.error('Error parsing localStorage data:', localError);
        setSavedSuggestions([]);
      }
    }
  };

  const saveSuggestion = async (suggestion: any, index: number) => {
    try {
      setSaving(index);
      
      // Try to save to backend first
      try {
        console.log('Attempting to save to backend...');
        const response = await api.post('/student/save-suggestion', {
          title: suggestion.title,
          description: suggestion.description,
          duration: suggestion.duration,
          difficulty: suggestion.difficulty,
          skills: suggestion.skills,
          savedAt: new Date().toISOString()
        });
        
        if (response.data.success) {
          console.log('Saved to backend successfully');
          setSavedSuggestions(prev => [...prev, { ...suggestion, id: response.data.id }]);
        }
      } catch (apiError: any) {
        console.error('Backend save failed:', apiError);
        console.log('API Error details:', apiError.response?.data || apiError.message);
        console.log('Falling back to localStorage...');
        // Fallback: save to localStorage
        const saved = JSON.parse(localStorage.getItem('savedSuggestions') || '[]');
        const newSuggestion = { 
          ...suggestion, 
          id: Date.now(),
          savedAt: new Date().toISOString()
        };
        saved.push(newSuggestion);
        localStorage.setItem('savedSuggestions', JSON.stringify(saved));
        setSavedSuggestions(prev => [...prev, newSuggestion]);
        console.log('Saved to localStorage:', newSuggestion);
      }
    } catch (error) {
      console.error('Error saving suggestion:', error);
    } finally {
      setSaving(null);
    }
  };

  const removeSavedSuggestion = async (suggestionId: number) => {
    try {
      // Try to remove from backend first
      try {
        console.log('Attempting to remove from backend...');
        await api.delete(`/student/saved-suggestions/${suggestionId}`);
        console.log('Removed from backend successfully');
      } catch (apiError) {
        console.error('Backend remove failed:', apiError);
        console.log('Falling back to localStorage...');
        // Fallback: remove from localStorage
        const saved = JSON.parse(localStorage.getItem('savedSuggestions') || '[]');
        const filtered = saved.filter((s: any) => s.id !== suggestionId);
        localStorage.setItem('savedSuggestions', JSON.stringify(filtered));
        console.log('Removed from localStorage');
      }
      
      setSavedSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error removing suggestion:', error);
    }
  };

  const isSuggestionSaved = (suggestion: any) => {
    return savedSuggestions.some(saved => 
      saved.title === suggestion.title && saved.description === suggestion.description
    );
  };

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Plan</h1>
        <p className="text-gray-600">Track your personalized learning journey and progress</p>
      </div>

      {/* Learning Plan Content */}
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Progress Overview
            </CardTitle>
            <CardDescription>
              Your overall learning progress across all assigned roadmaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{roadmaps.length}</div>
                    <div className="text-sm text-gray-600">Active Roadmaps</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {roadmaps.reduce((acc, roadmap) => acc + (roadmap.completedMilestones || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Completed Milestones</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {roadmaps.reduce((acc, roadmap) => acc + (roadmap.inProgressMilestones || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Learning Paths */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : roadmaps.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Paths</h3>
                  <p className="text-gray-600">You don't have any assigned roadmaps yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roadmaps.map((roadmap, index) => (
                    <div key={roadmap.id || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{roadmap.title}</h3>
                        <span className="text-sm text-gray-500">{roadmap.progress || 0}%</span>
                      </div>
                      <Progress value={roadmap.progress || 0} className="h-2 mb-2" />
                      <p className="text-sm text-gray-600">
                        {roadmap.nextMilestone || 'Continue with your learning path'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {roadmaps.length === 0 ? (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">No upcoming milestones</p>
                    </div>
                  ) : (
                    roadmaps.slice(0, 3).map((roadmap, index) => (
                      <div key={roadmap.id || index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{roadmap.title}</p>
                          <p className="text-xs text-gray-600">
                            {roadmap.nextMilestone || 'Continue learning'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Roadmaps</h3>
              <p className="text-sm text-gray-600 mb-4">Explore your assigned learning roadmaps</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/student/roadmaps')}>
                View Roadmaps
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Career Paths</h3>
              <p className="text-sm text-gray-600 mb-4">View your assigned career paths</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/student/career-paths')}>
                View Career Paths
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Daily Quiz</h3>
              <p className="text-sm text-gray-600 mb-4">Take today's AI-generated quiz to improve your skills</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/student/daily-quiz')}>
                Take AI Quiz
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Practice Questions</h3>
              <p className="text-sm text-gray-600 mb-4">AI-generated practice questions based on your learning plan</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/student/code-test')}>
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Technical Skill Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Technical Skill Roadmap Suggestions
            </CardTitle>
            <CardDescription>
              Get personalized technical skill roadmap suggestions and AI-generated practice questions powered by Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Get AI-generated roadmap suggestions and practice questions based on your current skills and interests
                </p>
                <Button 
                  onClick={generateAISuggestions}
                  disabled={loadingAi}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {loadingAi ? 'Generating...' : 'Generate Suggestions'}
                </Button>
              </div>
              
              {loadingAi && (
                <div className="text-center py-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse text-blue-600 text-2xl">🤖</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">AI is analyzing your profile...</p>
                    <p className="text-sm text-gray-500">Generating personalized suggestions</p>
                    <div className="flex justify-center space-x-1 mt-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              
              {aiSuggestions.length > 0 && !loadingAi && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {suggestion.difficulty}
                          </span>
                          {isSuggestionSaved(suggestion) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const savedSuggestion = savedSuggestions.find(s => 
                                  s.title === suggestion.title && s.description === suggestion.description
                                );
                                if (savedSuggestion) {
                                  removeSavedSuggestion(savedSuggestion.id);
                                }
                              }}
                              className="text-xs"
                            >
                              ✓ Saved
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => saveSuggestion(suggestion, index)}
                              disabled={saving === index}
                              className="text-xs"
                            >
                              {saving === index ? 'Saving...' : 'Save'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      
                      {/* Personalized Note */}
                      {suggestion.personalizedNote && (
                        <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-xs text-blue-800 font-medium">
                            🎯 {suggestion.personalizedNote}
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{suggestion.duration}</span>
                        </div>
                        
                        {/* Prerequisites */}
                        {suggestion.prerequisites && suggestion.prerequisites.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Prerequisites:</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.prerequisites.map((prereq: any, prereqIndex: number) => (
                                <span 
                                  key={prereqIndex}
                                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                                >
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Skills */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Skills You'll Learn:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.skills.map((skill: any, skillIndex: number) => (
                              <span 
                                key={skillIndex}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Career Outcomes */}
                        {suggestion.careerOutcomes && suggestion.careerOutcomes.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Career Outcomes:</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.careerOutcomes.map((outcome: any, outcomeIndex: number) => (
                                <span 
                                  key={outcomeIndex}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                >
                                  {outcome}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {aiSuggestions.length === 0 && !loadingAi && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Suggestions</h3>
                  <p className="text-gray-600 mb-4">Click "Generate Suggestions" to get personalized technical skill roadmaps</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saved Suggestions */}
        {savedSuggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Saved Technical Skill Roadmaps
              </CardTitle>
              <CardDescription>
                Your saved AI-generated technical skill roadmap suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSuggestions.map((suggestion, index) => (
                  <div key={suggestion.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {suggestion.difficulty}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSavedSuggestion(suggestion.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{suggestion.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Saved: {new Date(suggestion.savedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.skills.map((skill: any, skillIndex: number) => (
                          <span 
                            key={skillIndex}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
