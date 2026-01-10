interface RoadmapRequest {
  year: number;
  careerPath: string;
  department: string;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// Custom error for rate limiting
export class RateLimitError extends Error {
  public retryAfter: Date;
  
  constructor(message: string, retryAfter: Date) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Custom error for quota exceeded
export class QuotaExceededError extends Error {
  public resetTime: Date;
  
  constructor(message: string, resetTime: Date) {
    super(message);
    this.name = 'QuotaExceededError';
    this.resetTime = resetTime;
  }
}

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2 weeks", "1 month"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  resources: {
    type: 'article' | 'book' | 'course' | 'project';
    title: string;
    url?: string;
    description: string;
  }[];
  prerequisites?: string[];
}

interface GeneratedRoadmap {
  title: string;
  description: string;
  totalDuration: string;
  milestones: RoadmapMilestone[];
  learningPath: string;
  careerOutcomes: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  careerPath: string;
  points: number;
}

interface QuestionGenerationRequest {
  careerPath: string;
  currentWeek: number;
  studentYear: number;
  department: string;
  count?: number; // Optional count parameter, defaults to 20
}

interface LearningResource {
  title: string;
  description: string;
  url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LearningResourceRequest {
  careerPath: string;
  studentYear: number;
  department: string;
}

// Request queue manager for free tier rate limiting
class RequestQueueManager {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minDelayBetweenRequests = 6000; // 6 seconds minimum between requests (10 req/min limit)
  private dailyRequestCount = 0;
  private dailyLimitResetTime = Date.now();
  private dailyLimit = 20; // Free tier limit

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      // Check daily limit (reset every 24 hours)
      if (Date.now() - this.dailyLimitResetTime > 24 * 60 * 60 * 1000) {
        this.dailyRequestCount = 0;
        this.dailyLimitResetTime = Date.now();
      }

      if (this.dailyRequestCount >= this.dailyLimit) {
        const minutesUntilReset = Math.round((24 * 60 * 60 * 1000 - (Date.now() - this.dailyLimitResetTime)) / 60000);
        const resetTime = new Date(this.dailyLimitResetTime + 24 * 60 * 60 * 1000);
        const errorMsg = `Daily request limit reached (${this.dailyLimit}/day). Next reset in ${minutesUntilReset} minutes.`;
        
        console.warn(errorMsg);
        
        // Reject pending task with QuotaExceededError
        const task = this.queue.shift();
        if (task) {
          try {
            // Reject with error that indicates this is a quota issue
            throw new QuotaExceededError(errorMsg, resetTime);
          } catch (error) {
            console.error('Task failed due to daily limit:', error);
          }
        }
        this.isProcessing = false;
        return;
      }

      // Enforce minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelayBetweenRequests) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minDelayBetweenRequests - timeSinceLastRequest)
        );
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        this.dailyRequestCount++;
        await task();
      }
    }

    this.isProcessing = false;
  }
}

class GeminiAIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private requestQueue: RequestQueueManager;
  private responseCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.apiKey = process.env.llm_api_key || "";
    this.model = process.env.llm_model || "";
    this.apiUrl = process.env.llm_api_url || "";
    this.requestQueue = new RequestQueueManager();
    
    if (!this.apiKey) {
      throw new Error('Missing required environment variable: llm_api_key');
    }
    if (!this.model) {
      throw new Error('Missing required environment variable: llm_model');
    }
    if (!this.apiUrl) {
      throw new Error('Missing required environment variable: llm_api_url');
    }
  }

  private getCacheKey(request: RoadmapRequest): string {
    return `roadmap_${request.year}_${request.careerPath}_${request.department}_${request.studentLevel || 'beginner'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheExpiry;
  }

  async generateRoadmap(request: RoadmapRequest): Promise<GeneratedRoadmap> {
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = this.responseCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`Using cached roadmap for ${request.careerPath}`);
      return cached.data;
    }

    // Use request queue to respect rate limits
    return this.requestQueue.enqueue(async () => {
      const prompt = this.buildRoadmapPrompt(request);
      const maxRetries = 3; // Reduced from 5 to 3
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.5, // Reduced for more consistent output
                topK: 20, // Reduced from 40
                topP: 0.9, // Reduced from 0.95
                maxOutputTokens: 4096 // Reduced from 8192 to save tokens
              }
            })
          });

          // Handle rate limiting with extended backoff
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            
            if (attempt < maxRetries - 1) {
              // Extended delays: 15s, 30s, 60s
              const baseDelay = retryAfter 
                ? parseInt(retryAfter) * 1000 
                : (attempt === 0 ? 15000 : attempt === 1 ? 30000 : 60000);
              const jitter = Math.random() * 5000; // Add up to 5 seconds of random delay
              const delayMs = baseDelay + jitter;
              
              console.log(`⏳ Rate limited (429). Retrying in ${Math.round(delayMs / 1000)}s... (Attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            } else {
              const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : 60;
              const retryAfterDate = new Date(Date.now() + retryAfterSeconds * 1000);
              throw new RateLimitError(
                `API rate limit exceeded (429). Please try again in ${retryAfterSeconds} seconds.`,
                retryAfterDate
              );
            }
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error response:', errorText);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!generatedText) {
            throw new Error('No content generated from Gemini API');
          }

          const roadmap = this.parseRoadmapResponse(generatedText, request);
          
          // Cache the successful response
          this.responseCache.set(cacheKey, {
            data: roadmap,
            timestamp: Date.now()
          });

          return roadmap;
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on non-retryable errors
          if (error instanceof Error && (error.message.includes('Missing required fields') || error.message.includes('Parse error'))) {
            throw error;
          }
          
          if (attempt === maxRetries - 1) {
            console.error('Error generating roadmap (all retries exhausted):', error);
            throw lastError;
          }
        }
      }

      throw lastError || new Error('Failed to generate roadmap: Unknown error');
    });
  }

  private buildRoadmapPrompt(request: RoadmapRequest): string {
    return `Create a structured learning roadmap for a Year ${request.year} student in ${request.careerPath} (${request.department} dept).

REQUIREMENTS:
- 6-8 milestones (not 8-12)
- Progressive difficulty
- Include 3-4 resources per milestone
- Mix of courses, projects, documentation
- Realistic timeframes

RESPONSE FORMAT (valid JSON only, no extra text):
{
  "title": "${request.careerPath} Roadmap - Year ${request.year}",
  "description": "Learning path for ${request.careerPath} students",
  "totalDuration": "4-6 months",
  "learningPath": "Progressive skill building",
  "careerOutcomes": ["Skill 1", "Skill 2", "Skill 3"],
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone Title",
      "description": "What students learn",
      "duration": "2 weeks",
      "difficulty": "beginner",
      "skills": ["skill1", "skill2"],
      "resources": [
        {
          "type": "course",
          "title": "Course Name",
          "url": "https://example.com",
          "description": "Brief description"
        }
      ],
      "prerequisites": []
    }
  ]
}`;
  }

  private parseRoadmapResponse(text: string, request: RoadmapRequest): GeneratedRoadmap {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const roadmap = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!roadmap.title || !roadmap.milestones || !Array.isArray(roadmap.milestones)) {
        throw new Error('Invalid roadmap structure');
      }

      return roadmap;
    } catch (error) {
      console.error('Error parsing roadmap response:', error);
      // Return a fallback roadmap if parsing fails
      return this.createFallbackRoadmap(request);
    }
  }

  private createFallbackRoadmap(request: RoadmapRequest): GeneratedRoadmap {
    return {
      title: `${request.careerPath} Learning Roadmap for Year ${request.year} Students`,
      description: `A comprehensive learning path for ${request.year} year students in ${request.department} department pursuing ${request.careerPath}`,
      totalDuration: "6 months",
      learningPath: "Structured learning with hands-on projects and real-world applications",
      careerOutcomes: [
        "Industry-ready skills in your chosen field",
        "Portfolio of practical projects",
        "Understanding of current industry trends"
      ],
      milestones: [
        {
          id: "milestone-1",
          title: "Foundation Concepts",
          description: "Learn the fundamental concepts and principles",
          duration: "2 weeks",
          difficulty: "beginner",
          skills: ["Basic concepts", "Fundamentals"],
          resources: [
            {
              type: "course",
              title: "Introduction Course",
              description: "Comprehensive introduction to the field"
            }
          ]
        },
        {
          id: "milestone-2",
          title: "Practical Application",
          description: "Apply concepts through hands-on projects",
          duration: "3 weeks",
          difficulty: "intermediate",
          skills: ["Practical skills", "Project management"],
          resources: [
            {
              type: "project",
              title: "Capstone Project",
              description: "Real-world project to demonstrate skills"
            }
          ],
          prerequisites: ["milestone-1"]
        }
      ]
    };
  }

  async generateQuestionsWithGemini(request: QuestionGenerationRequest): Promise<QuizQuestion[]> {
    // Use request queue to respect rate limits
    return this.requestQueue.enqueue(async () => {
      const prompt = this.buildQuestionPrompt(request);
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 20,
                topP: 0.9,
                maxOutputTokens: 3000 // Reduced from 4096
              }
            })
          });

          if (response.status === 429) {
            if (attempt < maxRetries - 1) {
              const baseDelay = attempt === 0 ? 15000 : 30000;
              const jitter = Math.random() * 5000;
              const delayMs = baseDelay + jitter;
              
              console.log(`⏳ Rate limited generating questions. Retrying in ${Math.round(delayMs / 1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            } else {
              throw new Error(`API rate limit exceeded. Free tier limit (20 requests/day) reached.`);
            }
          }

          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!generatedText) {
            throw new Error('No content generated from Gemini API');
          }

          return this.parseQuestionResponse(generatedText, request);
        } catch (error) {
          lastError = error as Error;
          
          if (error instanceof Error && error.message.includes('Missing required fields')) {
            throw error;
          }
          
          if (attempt === maxRetries - 1) {
            console.error('Error generating questions (all retries exhausted):', error);
            throw lastError;
          }
        }
      }

      throw lastError || new Error('Failed to generate questions: Unknown error');
    });
  }

  private buildQuestionPrompt(request: QuestionGenerationRequest): string {
    const currentDate = new Date().toISOString().split('T')[0];
    const count = request.count || 20;
    return `Generate ${count} quiz questions for Year ${request.studentYear} student in ${request.careerPath} (${request.department}).

Week: ${request.currentWeek}/4, Focus: ${this.getWeekFocus(request.currentWeek)}, Date: ${currentDate}

Split: ${Math.floor(count * 0.5)} career path + ${Math.floor(count * 0.5)} technical
Difficulty: ${Math.floor(count * 0.3)} EASY, ${Math.floor(count * 0.5)} MEDIUM, ${Math.floor(count * 0.2)} HARD

JSON format:
[{"id":"q1","question":"?","options":["A","B","C","D"],"correctAnswer":1,"explanation":"","category":"","difficulty":"MEDIUM","careerPath":"${request.careerPath}","points":2}]`;
  }

  private parseQuestionResponse(text: string, request: QuestionGenerationRequest): QuizQuestion[] {
    try {
      // Extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions structure');
      }

      const expectedCount = request.count || 20;
      
      // Ensure we have the expected number of questions
      if (questions.length !== expectedCount) {
        console.warn(`Expected ${expectedCount} questions, got ${questions.length}`);
      }

      return questions.slice(0, expectedCount); // Take first N if more than expected
    } catch (error) {
      console.error('Error parsing questions response:', error);
      // Return fallback questions if parsing fails
      return this.createFallbackQuestions(request);
    }
  }

  private getWeekFocus(week: number): string {
    switch (week) {
      case 1:
        return 'foundational concepts and basic principles';
      case 2:
        return 'intermediate concepts and practical applications';
      case 3:
        return 'advanced concepts and real-world scenarios';
      case 4:
        return 'expert-level concepts and industry best practices';
      default:
        return 'foundational concepts and basic principles';
    }
  }

  private createFallbackQuestions(request: QuestionGenerationRequest): QuizQuestion[] {
    // Return minimal fallback questions only if AI generation completely fails
    console.warn('Using fallback questions - AI generation failed');
    const fallbackQuestions = [
      {
        id: 'fallback-1',
        question: `What is the most important skill for a ${request.careerPath} professional?`,
        options: [
          'Technical expertise only',
          'Communication and collaboration',
          'Memorizing all tools',
          'Working alone'
        ],
        correctAnswer: 1,
        explanation: 'Communication and collaboration are essential for any professional role.',
        category: 'Career Development',
        difficulty: 'EASY',
        careerPath: request.careerPath,
        points: 1
      },
      {
        id: 'fallback-2',
        question: 'What is the primary purpose of networking in professional development?',
        options: [
          'To get free meals',
          'To build relationships and career opportunities',
          'To avoid work',
          'To show off skills'
        ],
        correctAnswer: 1,
        explanation: 'Networking helps build professional relationships that can lead to career opportunities and knowledge sharing.',
        category: 'Career Development',
        difficulty: 'EASY',
        careerPath: request.careerPath,
        points: 1
      },
      {
        id: 'fallback-3',
        question: 'What is the time complexity of binary search?',
        options: [
          'O(n)',
          'O(log n)',
          'O(n²)',
          'O(1)'
        ],
        correctAnswer: 1,
        explanation: 'Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.',
        category: 'Algorithms',
        difficulty: 'MEDIUM',
        careerPath: request.careerPath,
        points: 2
      }
    ];
    
    // Return the requested number of questions, repeating if necessary
    const requestedCount = request.count || 20;
    const result: QuizQuestion[] = [];
    for (let i = 0; i < requestedCount; i++) {
      const question = fallbackQuestions[i % fallbackQuestions.length];
      result.push({
        ...question,
        id: `fallback-${i + 1}`,
        difficulty: question.difficulty as 'EASY' | 'MEDIUM' | 'HARD'
      });
    }
    
    return result;
  }

  async generateLearningResources(request: LearningResourceRequest): Promise<LearningResource[]> {
    // Use request queue to respect rate limits
    return this.requestQueue.enqueue(async () => {
      const prompt = this.buildResourcePrompt(request);
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 20,
                topP: 0.9,
                maxOutputTokens: 2000 // Reduced from 4096
              }
            })
          });

          if (response.status === 429) {
            if (attempt < maxRetries - 1) {
              const baseDelay = attempt === 0 ? 15000 : 30000;
              const jitter = Math.random() * 5000;
              const delayMs = baseDelay + jitter;
              
              console.log(`⏳ Rate limited generating resources. Retrying in ${Math.round(delayMs / 1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            } else {
              throw new Error(`API rate limit exceeded. Free tier limit (20 requests/day) reached.`);
            }
          }

          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!generatedText) {
            throw new Error('No content generated from Gemini API');
          }

          return this.parseResourceResponse(generatedText, request);
        } catch (error) {
          lastError = error as Error;
          
          if (error instanceof Error && error.message.includes('Missing required fields')) {
            throw error;
          }
          
          if (attempt === maxRetries - 1) {
            console.error('Error generating resources (all retries exhausted):', error);
            throw lastError;
          }
        }
      }

      throw lastError || new Error('Failed to generate resources: Unknown error');
    });
  }

  private buildResourcePrompt(request: LearningResourceRequest): string {
    return `Generate 8 learning resources for Year ${request.studentYear} ${request.careerPath} student (${request.department}).
Split: 2 technical + 2 career + 2 docs + 2 news. Difficulty: beginner-intermediate.
Real URLs only. JSON format:
[{"title":"","description":"","url":"","category":"","difficulty":"beginner"}]`;
  }

  private parseResourceResponse(text: string, request: LearningResourceRequest): LearningResource[] {
    try {
      // Extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const resources = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!Array.isArray(resources) || resources.length === 0) {
        throw new Error('Invalid resources structure');
      }

      return resources.slice(0, 12); // Take first 12 if more than expected
    } catch (error) {
      console.error('Error parsing resources response:', error);
      // Return fallback resources if parsing fails
      return this.createFallbackResources(request);
    }
  }

  private createFallbackResources(request: LearningResourceRequest): LearningResource[] {
    return [
      {
        title: 'FreeCodeCamp - Full Stack Development',
        description: 'Free coding bootcamp with hands-on projects and certifications',
        url: 'https://www.freecodecamp.org/',
        category: 'Programming',
        difficulty: 'beginner'
      },
      {
        title: 'Codecademy - Interactive Coding Lessons',
        description: 'Learn to code with interactive lessons and projects',
        url: 'https://www.codecademy.com/',
        category: 'Programming',
        difficulty: 'beginner'
      },
      {
        title: 'LeetCode - Coding Interview Prep',
        description: 'Practice coding problems and prepare for technical interviews',
        url: 'https://leetcode.com/',
        category: 'Programming',
        difficulty: 'intermediate'
      },
      {
        title: 'Coursera - Professional Development',
        description: 'University-level courses with industry-relevant projects',
        url: 'https://www.coursera.org/',
        category: 'Career Development',
        difficulty: 'intermediate'
      },
      {
        title: 'LinkedIn Learning - Professional Skills',
        description: 'Professional development courses and certifications',
        url: 'https://www.linkedin.com/learning/',
        category: 'Career Development',
        difficulty: 'intermediate'
      },
      {
        title: 'Udemy - Practical Skills',
        description: 'Hands-on courses for practical skill development',
        url: 'https://www.udemy.com/',
        category: 'Career Development',
        difficulty: 'beginner'
      },
      {
        title: 'MDN Web Docs',
        description: 'Comprehensive web development documentation and tutorials',
        url: 'https://developer.mozilla.org/',
        category: 'Documentation',
        difficulty: 'beginner'
      },
      {
        title: 'Stack Overflow',
        description: 'Developer community for questions and answers',
        url: 'https://stackoverflow.com/',
        category: 'Documentation',
        difficulty: 'intermediate'
      },
      {
        title: 'GitHub',
        description: 'Code repositories and collaborative development',
        url: 'https://github.com/',
        category: 'Documentation',
        difficulty: 'intermediate'
      },
      {
        title: 'TechCrunch',
        description: 'Latest technology news and industry trends',
        url: 'https://techcrunch.com/',
        category: 'Industry News',
        difficulty: 'beginner'
      },
      {
        title: 'Hacker News',
        description: 'Technology community discussions and news',
        url: 'https://news.ycombinator.com/',
        category: 'Industry News',
        difficulty: 'intermediate'
      },
      {
        title: 'Dev.to',
        description: 'Developer articles and community discussions',
        url: 'https://dev.to/',
        category: 'Industry News',
        difficulty: 'beginner'
      }
    ];
  }
}

// Export the service instance and the method

const geminiService = new GeminiAIService();

export const generateQuestionsWithGemini = (request: QuestionGenerationRequest) => {
  return geminiService.generateQuestionsWithGemini(request);
};

export { GeminiAIService, type RoadmapRequest, type GeneratedRoadmap, type RoadmapMilestone, type QuizQuestion, type QuestionGenerationRequest, type LearningResource, type LearningResourceRequest };
