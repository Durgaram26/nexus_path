# AI Generation Timeout & Rate Limit Fixes

## Overview
This document outlines the fixes implemented to address timeout issues (axios 30s limit) and rate limit handling for AI-generated content.

## Problems Addressed

### 1. Axios Timeout Issue (30 seconds)
**Problem:** The default axios timeout of 30 seconds was insufficient for AI generation requests when combined with:
- Queue manager 6-second minimum delay between requests
- Gemini API processing time
- Complex roadmap generation

**Solution:**
- Created separate axios instance (`aiApi`) with 120-second timeout
- Implemented in [lib/api.ts](lib/api.ts)
- Used for all AI generation endpoints

### 2. Rate Limit Error Handling
**Problem:** When hitting Gemini free tier limit (20 requests/day), errors were:
- Not properly caught and communicated
- Silently failed in queue processing
- Unclear when quota would reset

**Solution:**
- Created custom error classes: `RateLimitError` and `QuotaExceededError`
- Added proper error detection and user-friendly messages
- Returns quota reset time to clients
- Implemented in [lib/gemini-ai.ts](lib/gemini-ai.ts)

## Changes Made

### 1. **lib/api.ts** - Extended Timeout for AI Operations
```typescript
// New aiApi instance with 2-minute timeout
const aiApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 120000, // 2 minutes for AI operations
});
```

**Usage:** Import and use for AI endpoints:
```typescript
import { aiApi } from '@/lib/api';
await aiApi.post('/learning/roadmap', data);
```

### 2. **lib/gemini-ai.ts** - Custom Error Classes & Queue Management
```typescript
export class RateLimitError extends Error {
  public retryAfter: Date;
  constructor(message: string, retryAfter: Date) { ... }
}

export class QuotaExceededError extends Error {
  public resetTime: Date;
  constructor(message: string, resetTime: Date) { ... }
}
```

**Benefits:**
- Specific error types for different scenarios
- Return timing information for client retry logic
- Queue manager properly throws these errors instead of silently failing

### 3. **app/api/learning/roadmap/route.ts** - Enhanced Error Handling
Added specific handlers for each error type:

```typescript
if (error instanceof RateLimitError) {
  // Return 429 with retry timing
  return NextResponse.json({
    error: error.message,
    errorType: 'RATE_LIMIT',
    retryAfter: error.retryAfter.toISOString()
  }, { status: 429 });
}

if (error instanceof QuotaExceededError) {
  // Return 429 with quota reset time
  return NextResponse.json({
    error: error.message,
    errorType: 'QUOTA_EXCEEDED',
    resetTime: error.resetTime.toISOString()
  }, { status: 429 });
}

// Timeout detection
if ((error as any)?.message?.includes('timeout')) {
  return NextResponse.json({
    error: 'AI generation timed out...',
    errorType: 'TIMEOUT'
  }, { status: 504 });
}
```

### 4. **hooks/useAIGeneration.ts** - Client-Side Integration
New hook for handling AI generation with proper error handling:

```typescript
const { generateRoadmap, isLoading, error } = useAIGeneration({
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error)
});

// Call with payload
await generateRoadmap({
  year: 1,
  careerPath: 'Full Stack Development',
  department: 'IT',
  studentLevel: 'beginner'
});
```

**Error Response Examples:**

**Quota Exceeded:**
```json
{
  "error": "Daily quota exceeded. Resets at 2:30 PM",
  "errorType": "QUOTA_EXCEEDED",
  "resetTime": "2026-01-11T02:30:00.000Z",
  "statusCode": 429
}
```

**Rate Limited:**
```json
{
  "error": "Rate limited. Please retry in 45 seconds.",
  "errorType": "RATE_LIMIT",
  "retryAfter": "2026-01-10T14:15:45.000Z",
  "statusCode": 429
}
```

**Timeout:**
```json
{
  "error": "Request timed out. Please try a simpler roadmap.",
  "errorType": "TIMEOUT",
  "statusCode": 504
}
```

## Implementation Steps for Developers

### Using AI Generation in Components

```typescript
import { useAIGeneration } from '@/hooks/useAIGeneration';

export function RoadmapGenerator() {
  const { generateRoadmap, isLoading, error, clearError } = useAIGeneration({
    onSuccess: (data) => {
      console.log('Roadmap generated:', data);
    },
    onError: (error) => {
      console.error('Generation failed:', error.message);
    }
  });

  const handleGenerate = async () => {
    try {
      const result = await generateRoadmap({
        year: 1,
        careerPath: selectedPath,
        department: selectedDept,
        studentLevel: 'beginner'
      });
      // Handle success
    } catch (err) {
      // Error already set in state
      // Display error.message to user
      if (err.errorType === 'QUOTA_EXCEEDED') {
        // Show "Try again tomorrow" message
      } else if (err.errorType === 'TIMEOUT') {
        // Show "Try with simpler parameters" message
      }
    }
  };

  return (
    <>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Roadmap'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </>
  );
}
```

## Performance Optimizations Already in Place

1. **Caching:** 24-hour cache for roadmaps
   ```typescript
   private responseCache: Map<string, { data: any; timestamp: number }> = new Map();
   private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
   ```

2. **Queue Management:** 6-second minimum delay between requests
   - Respects Gemini free tier rate limits
   - Prevents quota exhaustion

3. **Token Optimization:**
   - Temperature: 0.5 (reduced from default for consistency)
   - MaxOutputTokens: 4096 (reduced to save tokens)
   - TopK: 20, TopP: 0.9 (optimized for balanced output)

4. **Retry Logic:** 3 attempts with exponential backoff
   - 1st retry: 15-30 seconds
   - 2nd retry: 30-60 seconds
   - Final attempt: error thrown

## Monitoring & Debugging

### Log Messages
- Queue processing: `⏳ Rate limited (429). Retrying in Xs...`
- Cache hits: `Using cached roadmap for [careerPath]`
- Daily limit: `Daily request limit reached (20/day). Next reset in Xm minutes.`

### Check Queue Status
```typescript
// In server logs, you'll see:
console.log(`⏳ Rate limited (429). Retrying in ${Math.round(delayMs / 1000)}s... (Attempt ${attempt + 1}/${maxRetries})`);
```

## Future Improvements

1. **Implement Job Polling System**
   - Return job ID immediately instead of waiting
   - Client polls for completion status
   - Eliminates timeout concerns

2. **Webhook Notifications**
   - Notify client when generation completes
   - Better UX for long-running operations

3. **Fallback AI Providers**
   - Switch to OpenAI if Gemini quota exceeded
   - Graceful degradation

4. **User Quota Tracking**
   - Track per-user daily usage
   - Implement tiered access levels

## Testing Rate Limits

To test rate limit handling:

```bash
# Test 21+ requests to trigger daily limit
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/learning/roadmap \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "year": 1,
      "careerPath": "Path'$i'",
      "department": "IT",
      "studentLevel": "beginner"
    }'
  sleep 7  # Respect queue delay
done
```

Expected behavior:
- First 20 requests: Success
- Request 21+: `QUOTA_EXCEEDED` error with reset time

## Status Codes Reference

- **200 OK:** Roadmap generated successfully
- **429 Too Many Requests:** Rate limited or quota exceeded
- **504 Gateway Timeout:** Generation timed out (try simpler request)
- **401 Unauthorized:** Authentication token invalid
- **403 Forbidden:** Insufficient permissions
- **500 Internal Server Error:** Unexpected error during generation

