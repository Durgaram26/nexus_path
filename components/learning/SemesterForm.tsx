'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Calendar,
  BookOpen,
  Code,
  Trophy,
  Briefcase,
  Users,
  Target,
  FileText,
  Brain,
  Wrench,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Clock,
  Link as LinkIcon
} from 'lucide-react';

interface SemesterActivity {
  id: string;
  title: string;
  description: string;
  timeline: string;
  tool?: string;
  link?: string;
  outcome: string;
  category: 'technical-skills' | 'core-engineering' | 'online-courses' | 'workshops' | 'competitions' | 'internships' | 'mini-projects' | 'alumni-interaction' | 'assessment' | 'profile-building';
}

interface Semester {
  id: string;
  number: number;
  title: string;
  description: string;
  activities: SemesterActivity[];
  isExpanded: boolean;
}

interface SemesterFormProps {
  semester: Semester;
  onUpdate: (semester: Semester) => void;
  onDelete: (semesterId: string) => void;
  onAddActivity: (semesterId: string, category: SemesterActivity['category']) => void;
  onUpdateActivity: (semesterId: string, activityId: string, updates: Partial<SemesterActivity>) => void;
  onDeleteActivity: (semesterId: string, activityId: string) => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

const categoryIcons = {
  'technical-skills': Brain,
  'core-engineering': Wrench,
  'online-courses': BookOpen,
  'workshops': GraduationCap,
  'competitions': Trophy,
  'internships': Briefcase,
  'mini-projects': Code,
  'alumni-interaction': Users,
  'assessment': Target,
  'profile-building': FileText
};

const categoryLabels = {
  'technical-skills': 'Technical Skills',
  'core-engineering': 'Core Engineering Skills',
  'online-courses': 'Online Courses',
  'workshops': 'Workshops / Bootcamps',
  'competitions': 'Competitions / Challenges',
  'internships': 'Internships',
  'mini-projects': 'Mini Projects',
  'alumni-interaction': 'Alumni Interaction',
  'assessment': 'Core Skill Assessment',
  'profile-building': 'Profile Building Activities'
};

const categoryColors = {
  'technical-skills': 'bg-blue-50 border-blue-200 text-blue-800',
  'core-engineering': 'bg-green-50 border-green-200 text-green-800',
  'online-courses': 'bg-purple-50 border-purple-200 text-purple-800',
  'workshops': 'bg-orange-50 border-orange-200 text-orange-800',
  'competitions': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'internships': 'bg-indigo-50 border-indigo-200 text-indigo-800',
  'mini-projects': 'bg-pink-50 border-pink-200 text-pink-800',
  'alumni-interaction': 'bg-teal-50 border-teal-200 text-teal-800',
  'assessment': 'bg-red-50 border-red-200 text-red-800',
  'profile-building': 'bg-gray-50 border-gray-200 text-gray-800'
};

export default function SemesterForm({
  semester,
  onUpdate,
  onDelete,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  isEditing = false,
  onToggleEdit
}: SemesterFormProps) {
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: semester.title,
    description: semester.description
  });

  const handleSave = () => {
    onUpdate({ ...semester, ...formData });
    onToggleEdit?.();
  };

  const handleCancel = () => {
    setFormData({
      title: semester.title,
      description: semester.description
    });
    onToggleEdit?.();
  };

  const toggleExpansion = () => {
    onUpdate({ ...semester, isExpanded: !semester.isExpanded });
  };

  const getActivityCount = (category: string) => {
    return semester.activities.filter(a => a.category === category).length;
  };

  const getActivitiesByCategory = (category: string) => {
    return semester.activities.filter(a => a.category === category);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4">
        {/* Semester Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleExpansion}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {semester.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Semester title"
                    className="text-lg font-semibold"
                  />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Semester description"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">{semester.title}</h3>
                  <p className="text-sm text-gray-600">{semester.description || 'No description'}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {semester.activities.length} activities
            </Badge>
            {isEditing ? (
              <div className="flex gap-1">
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleEdit}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(semester.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {semester.isExpanded && (
          <div className="space-y-6">
            {/* Activity Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
                const activities = getActivitiesByCategory(key);
                const colorClass = categoryColors[key as keyof typeof categoryColors];
                
                return (
                  <div key={key} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{label}</span>
                      <Badge variant="outline" className="text-xs">
                        {activities.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {activities.map((activity) => (
                        <div key={activity.id} className="bg-white p-2 rounded border text-xs">
                          <div className="font-medium truncate">{activity.title || 'Untitled'}</div>
                          <div className="text-gray-500 truncate flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.timeline || 'No timeline'}
                          </div>
                          {activity.tool && (
                            <div className="text-gray-500 truncate flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              {activity.tool}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => onAddActivity(semester.id, key as SemesterActivity['category'])}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add {label}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Activities List */}
            {semester.activities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">All Activities</h4>
                <div className="space-y-2">
                  {semester.activities.map((activity) => {
                    const IconComponent = categoryIcons[activity.category];
                    const colorClass = categoryColors[activity.category];
                    
                    return (
                      <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                        {editingActivity === activity.id ? (
                          <ActivityEditor
                            activity={activity}
                            onSave={(updates) => {
                              onUpdateActivity(semester.id, activity.id, updates);
                              setEditingActivity(null);
                            }}
                            onCancel={() => setEditingActivity(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <IconComponent className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{activity.title || 'Untitled Activity'}</span>
                                <Badge variant="outline" className={`text-xs ${colorClass}`}>
                                  {categoryLabels[activity.category]}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-1">
                                {activity.description || 'No description'}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {activity.timeline && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.timeline}
                                  </div>
                                )}
                                {activity.tool && (
                                  <div className="flex items-center gap-1">
                                    <Wrench className="w-3 h-3" />
                                    {activity.tool}
                                  </div>
                                )}
                                {activity.link && (
                                  <div className="flex items-center gap-1">
                                    <LinkIcon className="w-3 h-3" />
                                    <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      Link
                                    </a>
                                  </div>
                                )}
                              </div>
                              {activity.outcome && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <strong>Outcome:</strong> {activity.outcome}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingActivity(activity.id)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDeleteActivity(semester.id, activity.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Activity Editor Component
interface ActivityEditorProps {
  activity: SemesterActivity;
  onSave: (updates: Partial<SemesterActivity>) => void;
  onCancel: () => void;
}

function ActivityEditor({ activity, onSave, onCancel }: ActivityEditorProps) {
  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description,
    timeline: activity.timeline,
    tool: activity.tool || '',
    link: activity.link || '',
    outcome: activity.outcome
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Activity title"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the activity..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Timeline</Label>
          <Input
            value={formData.timeline}
            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
            placeholder="e.g., 2 weeks"
          />
        </div>
        <div>
          <Label>Tool/Platform</Label>
          <Input
            value={formData.tool}
            onChange={(e) => setFormData(prev => ({ ...prev, tool: e.target.value }))}
            placeholder="e.g., Coursera, GitHub"
          />
        </div>
      </div>
      <div>
        <Label>Link (Optional)</Label>
        <Input
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Expected Outcome</Label>
        <Textarea
          value={formData.outcome}
          onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
          placeholder="What will students achieve?"
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
