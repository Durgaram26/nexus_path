'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface AILoadingProps {
  title?: string;
  description?: string;
  showProgress?: boolean;
}

export default function AILoading({ 
  title = "AI is Working", 
  description = "Generating personalized content...",
  showProgress = true 
}: AILoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Analyzing your profile...",
    "Understanding your career path...",
    "Generating personalized questions...",
    "Optimizing difficulty levels...",
    "Finalizing quiz content..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
      
      setCurrentStep((prev) => {
        const stepIndex = Math.floor((prev / 100) * steps.length);
        return Math.min(stepIndex, steps.length - 1);
      });
    }, 800);

    return () => clearInterval(interval);
  }, [ steps.length]);

  return (
    <Card className="w-full max-w-md mx-auto">
        <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
            <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <span>{title}</span>
        </div>
      </div>
      <CardContent className="space-y-6">
        {/* Animated Brain */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Zap className="h-4 w-4 text-yellow-500 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Sparkles className="h-3 w-3 text-purple-500 animate-ping" />
            </div>
          </div>
        </div>

        {/* Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span></span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <p className="text-xs text-blue-600 font-medium">
            {steps[currentStep]}
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>

        {/* Fun Facts */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            💡 Did you know? Our AI analyzes your learning patterns to create the perfect quiz!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

