'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Code2,
  Newspaper,
  FileText,
  Video,
  ExternalLink,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LearningResourcesSectionProps {
  studentId: string;
  departmentId: string;
}

export default function LearningResourcesSection({
  studentId,
  departmentId
}: LearningResourcesSectionProps) {
  const router = useRouter();
  const [resourcesByCategory, setResourcesByCategory] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLearningResources();
  }, []);

  const loadLearningResources = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await api.get('/student/learning-resources', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setResourcesByCategory(response.data.resourcesByCategory || {});
      }
    } catch (error) {
      console.error('Error loading learning resources:', error);
      setError('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5 text-primary";
    switch (category.toLowerCase()) {
      case 'programming': return <Code2 className={iconClass} />;
      case 'career development': return <Target className={iconClass} />;
      case 'documentation': return <FileText className={iconClass} />;
      case 'industry news': return <Newspaper className={iconClass} />;
      case 'video': return <Video className={iconClass} />;
      default: return <BookOpen className={iconClass} />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse glass border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="h-6 w-32 bg-secondary rounded" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-12 bg-secondary/50 rounded-lg" />
                <div className="h-12 bg-secondary/50 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || Object.keys(resourcesByCategory).length === 0) {
    return (
      <Card className="border-dashed border-2 border-border bg-secondary/20">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Resources Found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Resources tailored to your roadmap will appear here.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push('/student/roadmaps')}>
            Browse Roadmaps
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.entries(resourcesByCategory).slice(0, 3).map(([category, resources]) => (
        <Card key={category} className="glass border-border/60 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3 border-b border-border/40 pt-4 px-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                {getCategoryIcon(category)}
              </div>
              <div>
                <h3 className="font-bold text-foreground capitalize text-base">{category}</h3>
                <p className="text-xs text-muted-foreground">Curated for your path</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-5 pb-5">
            <div className="space-y-3">
              {resources.slice(0, 3).map((resource) => (
                <div
                  key={resource.id}
                  className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/60"
                  onClick={() => handleResourceClick(resource.url)}
                >
                  <div className="flex-1 min-w-0 z-10">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate pr-4">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 group-hover:text-foreground/80 transition-colors">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-normal bg-secondary text-muted-foreground border-border/50">
                        {resource.difficulty}
                      </Badge>
                      {resource.isFromRoadmap && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                          <Sparkles className="w-3 h-3" />
                          Roadmap
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-full bg-white shadow-sm ring-1 ring-border/50 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              ))}
            </div>
            {resources.length > 3 && (
              <Button variant="ghost" className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground h-9 border border-border/30 hover:bg-secondary/50">
                View {resources.length - 3} more <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
