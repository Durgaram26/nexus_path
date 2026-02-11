'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Clock,
  Map,
  Target,
  CheckCircle,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

interface RoadmapCardProps {
  roadmap: {
    id: number;
    title: string;
    description: string;
    totalDuration: string;
    year: number;
    careerPath: string;
    department: string;
    studentLevel: string;
    milestones: string;
    learningPath: string;
    careerOutcomes: string;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    createdByUser: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  progress?: number;
}

const safeJsonParse = (data: unknown, fallback: unknown = []) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) return Object.values(data);
  return fallback;
};

const extractText = (item: unknown): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as any;
    return obj.title || obj.description || obj.name || obj.text || String(item);
  }
  return String(item || '');
};

export default function RoadmapCard({ roadmap, progress = 0 }: RoadmapCardProps) {
  const router = useRouter();
  const milestones = safeJsonParse(roadmap.milestones, []) as any[];

  // Calculate phases based on progress
  const currentWeek = Math.floor((progress / 100) * 4) + 1;

  return (
    <Card className="glass border-border/60 overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
                {roadmap.careerPath}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                {roadmap.studentLevel}
              </Badge>
            </div>

            <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {roadmap.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {roadmap.description}
            </p>
          </div>

          <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 transform group-hover:rotate-12 ring-1 ring-border shadow-sm">
            <Map className="w-6 h-6 text-foreground/70 group-hover:text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        {/* Progress Visual */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-foreground">Progress</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Start</span>
            <span>Completion</span>
          </div>
        </div>

        {/* Info Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center gap-3">
            <div className="p-2 rounded-md bg-white shadow-sm ring-1 ring-border/50">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Duration</p>
              <p className="text-sm font-bold text-foreground">{roadmap.totalDuration}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center gap-3">
            <div className="p-2 rounded-md bg-white shadow-sm ring-1 ring-border/50">
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Milestones</p>
              <p className="text-sm font-bold text-foreground">{milestones.length} Steps</p>
            </div>
          </div>
        </div>

        {/* Milestones Preview */}
        {milestones.length > 0 && (
          <div className="relative pl-4 space-y-4 border-l-2 border-border/60 ml-1">
            {milestones.slice(0, 2).map((milestone: any, i: number) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-white border-muted-foreground'}`} />
                <p className="text-sm text-foreground font-medium line-clamp-1">{extractText(milestone)}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 opacity-80">
                  Milestone {i + 1}
                </p>
              </div>
            ))}
            {milestones.length > 2 && (
              <div className="relative">
                <div className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-secondary border-2 border-muted-foreground/30" />
                <p className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                  +{milestones.length - 2} more milestones...
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-semibold h-11 rounded-xl group-hover:scale-[1.02] transition-all"
          onClick={() => router.push(`/student/roadmap-details/${roadmap.id}`)}
        >
          Continue Learning
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
