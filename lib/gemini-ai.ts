interface RoadmapRequest {
  year: number;
  careerPath: string;
  department: string;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
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

class GeminiAIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.llm_api_key || "AIzaSyA9PLlY8MT80jjPpWXrTeHnEVHRina0orQ";
    this.model = process.env.llm_model || "gemini-2.0-flash";
    this.apiUrl = process.env.llm_api_url || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  }

  async generateRoadmap(request: RoadmapRequest): Promise<GeneratedRoadmap> {
    const prompt = this.buildRoadmapPrompt(request);
    
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated from Gemini API');
      }

      return this.parseRoadmapResponse(generatedText, request);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw new Error(`Failed to generate roadmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildRoadmapPrompt(request: RoadmapRequest): string {
    return `You are an expert educational consultant creating a comprehensive learning roadmap. Generate a detailed, structured roadmap for a in their ${request.year} year pursuing ${request.careerPath}.

REQUIREMENTS:
- Create a roadmap similar to roadmap.sh but more detailed and personalized
- Include 8-12 milestones that progressively build skills
- Each milestone should have specific learning objectives
- Include practical projects and real-world applications
- Consider the academic year level (${request.year} year )
- Focus on industry-relevant skills for ${request.careerPath}

RESOURCE TYPES TO INCLUDE:
- Coursera courses (mention specific course names and provide URLs)
- Udemy courses (mention specific course names and provide URLs)
- GitHub repositories (provide actual GitHub repo URLs)
- Official documentation and tutorials
- Books and e-books
- Interactive coding platforms (Codecademy, freeCodeCamp, etc.)
- Project-based learning RESPONSE FORMAT (return as valid JSON):
{
  "title": "Comprehensive ${request.careerPath} Learning Roadmap for Year ${request.year} Students",
  "description": "A detailed learning path designed specifically for ${request.year} year students pursuing ${request.careerPath}",
  "totalDuration": "months",
  "learningPath": "Brief description of the learning approach",
  "careerOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Milestone Title",
      "description": "Detailed description of what students will learn",
      "duration": "2 weeks",
      "difficulty": "beginner",
      "skills": ["skill1", "skill2", "skill3"],
       "": [
         {
           "type": "course",
           "title": "Coursera: [Specific Course Name]",
           "url": "https://www.coursera.org/learn/...",
           "description": "University-level course on [topic]"
         },
         {
           "type": "course",
           "title": "Udemy: [Specific Course Name]",
           "url": "https://www.udemy.com/course/...",
           "description": "Hands-on project-based course"
         },
         {
           "type": "project",
           "title": "GitHub Repository: [Repo Name]",
           "url": "https://github.com/...",
           "description": "Open-source project to study and contribute to"
         }
       ],
      "prerequisites": ["prerequisite1", "prerequisite2"]
    }
  ]
}

IMPORTANT RESOURCE GUIDELINES:
1. For Coursera: Mention specific course names and provide course URLs
2. For Udemy: Include specific course names and URLs
3. For GitHub: Provide actual repository URLs for relevant projects
4. Include a mix of free and paid 5. Prioritize high-quality, well-known 6. Include beginner-friendly for early milestones
7. Include advanced for later milestones

Make sure the roadmap is:
1. Progressive (each milestone builds on previous ones)
2. Practical (includes hands-on projects)
3. Industry-relevant (focuses on current job market needs)
4. Time-appropriate (matches the academic year level)
5. Comprehensive (covers both theoretical and practical aspects)
6. Resource-rich (includes diverse learning materials)

Generate the roadmap now:`;
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
    const prompt = this.buildQuestionPrompt(request);
    
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        })
      });

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
      console.error('Error generating questions:', error);
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildQuestionPrompt(request: QuestionGenerationRequest): string {
    const currentDate = new Date().toISOString().split('T')[0];
    return `You are an expert quiz generator creating adaptive questions for a ${request.studentYear} year ${request.department} pursuing ${request.careerPath} career path.

STUDENT CONTEXT:
- Academic Year: ${request.studentYear}
- Department: ${request.department}
- Career Path: ${request.careerPath}
- Learning Plan Week: ${request.currentWeek} of 4
- Current Date: ${currentDate}

REQUIREMENTS:
- Generate exactly ${request.count || 20} questions total
- ${Math.floor((request.count || 20) / 2)} questions about ${request.careerPath} career path topics
- ${Math.floor((request.count || 20) / 2)} questions about coding/programming topics relevant to ${request.careerPath}
- Questions should be appropriate for week ${request.currentWeek} of a 4-week learning plan
- Week ${request.currentWeek} should focus on ${this.getWeekFocus(request.currentWeek)}
- Mix of difficulty levels: ${Math.floor((request.count || 20) * 0.3)} EASY, ${Math.floor((request.count || 20) * 0.5)} MEDIUM, ${Math.floor((request.count || 20) * 0.2)} HARD questions
- Each question should have 4 multiple choice options
- Include detailed explanations for each answer
- IMPORTANT: Generate fresh, unique questions for ${currentDate} - avoid repeating questions from previous days
- Focus on current industry trends and recent developments in ${request.careerPath}

CAREER PATH TOPICS (10 questions):
- Industry knowledge, trends, and best practices in ${request.careerPath}
- Career development, networking, and professional skills
- Industry tools, methodologies, and frameworks
- Real-world applications and case studies

CODING TOPICS (10 questions):
- Programming languages relevant to ${request.careerPath}
- Data structures and algorithms
- Software development practices
- Problem-solving and debugging

RESPONSE FORMAT (return as valid JSON array):
[
  {
    "id": "q1",
    "question": "What is the primary advantage of using version control systems like Git in software development?",
    "options": [
      "It makes code run faster",
      "It allows multiple developers to collaborate and track changes",
      "It automatically fixes bugs",
      "It reduces the need for testing"
    ],
    "correctAnswer": 1,
    "explanation": "Version control systems like Git enable multiple developers to work on the same project simultaneously, track all changes, and maintain a complete history of the codebase.",
    "category": "Software Development",
    "difficulty": "MEDIUM",
    "careerPath": "${request.careerPath}",
    "points": 2
  }
]

DIFFICULTY GUIDELINES:
- EASY: Basic concepts, definitions, simple applications
- MEDIUM: Practical applications, problem-solving, intermediate concepts
- HARD: Complex scenarios, advanced concepts, critical thinking

Generate 20 questions now:`;
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
    const prompt = this.buildResourcePrompt(request);
    
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
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        })
      });

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
      console.error('Error generating learning resources:', error);
      throw new Error(`Failed to generate learning resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildResourcePrompt(request: LearningResourceRequest): string {
    return `You are an expert educational consultant creating personalized learning for a ${request.studentYear} year ${request.department} pursuing ${request.careerPath} career path.

STUDENT CONTEXT:
- Academic Year: ${request.studentYear}
- Department: ${request.department}
- Career Path: ${request.careerPath}

REQUIREMENTS:
- Generate exactly 12 learning total
- 3 for Programming/Technical Skills
- 3 for Career Development
- 3 for Documentation/Reference
- 3 for Industry News/Trends
- Mix of difficulty levels: 4 beginner, 6 intermediate, 2 advanced
- Include real, working URLs for each resource
- Focus on current, relevant for ${request.careerPath}

RESOURCE CATEGORIES:
1. Programming/Technical Skills:
   - Coding tutorials, courses, and practice platforms
   - Language-specific for ${request.careerPath}
   - Algorithm and data structure learning

2. Career Development:
   - Professional development courses
   - Industry certifications
   - Networking and career advancement

3. Documentation/Reference:
   - Official documentation
   - Developer communities
   - Code repositories and examples

4. Industry News/Trends:
   - Technology news sources
   - Industry blogs and publications
   - Professional communities

RESPONSE FORMAT (return as valid JSON array):
[
  {
    "title": "FreeCodeCamp - Full Stack Development",
    "description": "Free coding bootcamp with hands-on projects and certifications",
    "url": "https://www.freecodecamp.org/",
    "category": "Programming",
    "difficulty": "beginner"
  },
  {
    "title": "Coursera - ${request.careerPath} Specialization",
    "description": "University-level courses with industry-relevant projects",
    "url": "https://www.coursera.org/",
    "category": "Career Development",
    "difficulty": "intermediate"
  }
]

IMPORTANT GUIDELINES:
1. Use real, working URLs that are currently accessible
2. Include a mix of free and paid 3. Prioritize high-quality, well-known platforms
4. Ensure are relevant to ${request.careerPath}
5. Include beginner-friendly for early learning
6. Include advanced for skill development
7. Focus on current industry standards and best practices

Generate 12 learning now:`;
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
