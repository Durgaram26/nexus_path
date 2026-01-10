import { useState, useCallback } from 'react';
import { aiApi } from '@/lib/api';
import axios from 'axios';

interface UseAIGenerationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  timeout?: number;
}

interface GenerationError {
  message: string;
  errorType?: string;
  retryAfter?: string;
  resetTime?: string;
  statusCode?: number;
}

export function useAIGeneration(options: UseAIGenerationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GenerationError | null>(null);
  const [progress, setProgress] = useState(0);

  const generateRoadmap = useCallback(
    async (payload: any) => {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Use aiApi with extended timeout for roadmap generation
        const response = await aiApi.post('/learning/roadmap', payload);
        
        setProgress(100);
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        let errorObj: GenerationError = {
          message: 'An error occurred during AI generation',
          statusCode: err.response?.status
        };

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 429) {
            // Rate limit or quota exceeded
            const data = err.response.data;
            errorObj = {
              message: data.error || 'Rate limit exceeded',
              errorType: data.errorType,
              retryAfter: data.retryAfter,
              resetTime: data.resetTime,
              statusCode: 429
            };

            if (data.errorType === 'QUOTA_EXCEEDED') {
              errorObj.message = `Daily quota exceeded. Resets at ${new Date(data.resetTime).toLocaleTimeString()}`;
            } else if (data.errorType === 'RATE_LIMIT') {
              const retrySeconds = Math.ceil(
                (new Date(data.retryAfter).getTime() - Date.now()) / 1000
              );
              errorObj.message = `Rate limited. Please retry in ${retrySeconds} seconds.`;
            }
          } else if (err.response?.status === 504) {
            errorObj = {
              message: err.response.data.error || 'Request timed out. Please try a simpler roadmap.',
              errorType: 'TIMEOUT',
              statusCode: 504
            };
          } else if (err.response?.status === 401) {
            errorObj.message = 'Authentication failed. Please log in again.';
          } else if (err.response?.status === 403) {
            errorObj.message = 'You do not have permission to perform this action.';
          } else if (err.message?.includes('timeout')) {
            errorObj = {
              message: 'Request timed out. The generation is taking too long. Please try again with a simpler request.',
              errorType: 'TIMEOUT',
              statusCode: 504
            };
          } else {
            errorObj.message = err.response?.data?.details || err.message || 'Generation failed';
          }
        } else {
          errorObj.message = err.message || 'An unknown error occurred';
        }

        setError(errorObj);
        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const generateQuiz = useCallback(
    async (payload: any) => {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      try {
        const response = await aiApi.post('/student/roadmap-quiz', payload);
        
        setProgress(100);
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        let errorObj: GenerationError = {
          message: 'Quiz generation failed',
          statusCode: err.response?.status
        };

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 429) {
            const data = err.response.data;
            errorObj = {
              message: data.error || 'Rate limit exceeded',
              errorType: data.errorType,
              retryAfter: data.retryAfter,
              resetTime: data.resetTime,
              statusCode: 429
            };
          } else if (err.message?.includes('timeout')) {
            errorObj = {
              message: 'Quiz generation timed out. Please try again.',
              errorType: 'TIMEOUT',
              statusCode: 504
            };
          } else {
            errorObj.message = err.response?.data?.details || err.message;
          }
        }

        setError(errorObj);
        options.onError?.(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    generateRoadmap,
    generateQuiz,
    isLoading,
    error,
    progress,
    clearError: () => setError(null)
  };
}
