# Free Tier Gemini API Optimization Guide

## Your Current Limits
- **Model**: `gemini-2.5-flash-lite`
- **Requests per minute**: 10 req/min
- **Tokens per minute**: 250K tokens/min  
- **Requests per day**: 20 req/day ⚠️ **Most Restrictive**

## Changes Made to Support Free Tier

### 1. **Request Queue Manager** (NEW)
- Enforces 6-second minimum delay between requests (10 req/min limit)
- Tracks daily request count (20 req/day limit)
- Queues requests automatically when limits are hit
- Prevents concurrent API calls that exceed rate limits

**Location**: `lib/gemini-ai.ts` - `RequestQueueManager` class

### 2. **Response Caching** (NEW)
- Caches roadmap responses for 24 hours
- Avoids redundant API calls for identical requests
- Dramatically reduces daily request usage
- Cache key: `roadmap_{year}_{careerPath}_{department}_{studentLevel}`

**Impact**: Multiple requests for same roadmap use cache instead of API

### 3. **Token Usage Optimization**
Changes to reduce tokens per request:

| Aspect | Before | After | Savings |
|--------|--------|-------|---------|
| Roadmap prompt | ~400 tokens | ~150 tokens | **62% reduction** |
| Question prompt | ~500 tokens | ~100 tokens | **80% reduction** |
| Resource prompt | ~400 tokens | ~80 tokens | **80% reduction** |
| Max output tokens | 8192 | 4096 (roadmap), 3000 (questions), 2000 (resources) | **50-75% reduction** |
| Temperature | 0.7-0.8 | 0.5-0.7 | More consistent output |
| topK | 40 | 20 | Faster generation |
| topP | 0.95 | 0.9 | More focused output |

### 4. **Improved Rate Limit Handling**
- Extended retry delays: 15s → 30s → 60s (instead of 2s → 4s → 8s → 16s → 32s)
- Reduced retry attempts from 5 to 3 (matches free tier limits)
- Better error messages indicating daily limit reached
- Graceful fallback to cached data when available

### 5. **Fallback Mechanisms**
- Fallback roadmap structure if generation fails
- Fallback questions array if quiz generation fails
- Prevents complete application failure on rate limits

## Daily Usage Pattern

With 20 requests/day limit:

### Recommended Usage:
- **Roadmap Creation**: 5-8 requests/day (reuse cached versions)
- **Daily Quiz Generation**: 8-10 requests/day
- **Learning Resources**: 2-4 requests/day
- **Buffer**: 2-4 requests for emergencies

### What Will Work:
✅ Single roadmap generation per career path per day  
✅ Daily quiz generation for one batch of students  
✅ Generating resources for main career paths  
✅ Caching ensures repeated access is free

### What Won't Work:
❌ Multiple roadmap generations for same path in same day  
❌ Bulk quiz generation for all students at once  
❌ Frequent prompt changes/iterations  
❌ Real-time API calls without caching

## Implementation Details

### Request Queue Usage:
All three methods now use the request queue:
- `generateRoadmap()`
- `generateQuestionsWithGemini()`
- `generateLearningResources()`

```typescript
// Requests are automatically queued and respect rate limits
return this.requestQueue.enqueue(async () => {
  // Your API call here
});
```

### Cache Usage:
```typescript
// Check cache first
const cached = this.responseCache.get(cacheKey);
if (cached && this.isCacheValid(cached.timestamp)) {
  return cached.data; // No API call made!
}
```

### Retry Strategy:
```
Attempt 1 fails (429) → Wait 15s + jitter → Retry
Attempt 2 fails (429) → Wait 30s + jitter → Retry  
Attempt 3 fails (429) → Throw error with helpful message
```

## Monitoring

### Console Output:
```
⏳ Rate limited (429). Retrying in 15234ms... (Attempt 1/3)
Using cached roadmap for Web Development
Daily request limit reached (20/day). Next reset in 1380 minutes.
```

### Check Daily Limit Status:
The system automatically logs:
- Requests remaining until 24-hour reset
- When daily limit is reached
- When cache is being used

## Upgrading from Free Tier

If you need more capacity, consider:
1. **Paid Plan**: Removes daily request limits, higher rate limits
2. **Different Model**: Try other models if available with better limits
3. **Batch Processing**: Schedule requests across multiple days
4. **Local Alternatives**: Consider local LLMs for non-critical generation

## Troubleshooting

### Getting "API rate limit exceeded":
1. Wait 24 hours for daily limit reset
2. Or check if responses are in cache (most are)
3. Upgrade to paid tier if this is blocking production

### Slow requests:
1. Requests are queued to respect rate limits
2. Each request takes minimum 6 seconds apart
3. This is intentional to stay within 10 req/min limit

### Want to change cache expiry:
Edit `lib/gemini-ai.ts`, search for `cacheExpiry`:
```typescript
private cacheExpiry = 24 * 60 * 60 * 1000; // Change this value
```

### Need to clear cache:
```typescript
// Add to constructor or call method
this.responseCache.clear();
```

## Best Practices

1. **Batch Request Generation**:
   - Generate all roadmaps at start of term
   - Cache them for entire duration
   - Reuse for similar student combinations

2. **Off-Peak Generation**:
   - Schedule heavy API calls during off-hours
   - Allows requests to spread across 24 hours
   - Reduce bottlenecks

3. **User Communication**:
   - Explain to students that roadmap generation is "smart" (using cache)
   - First-time generation takes longer than subsequent accesses
   - This is normal and improves over time

4. **Monitor Usage**:
   - Check console logs daily
   - Plan generation schedule around 20 req/day limit
   - Alert when hitting limits

## API Keys & Environment

Your current `.env` settings:
```
llm_api_key=AIzaSyA9PLlY8MT80jjPpWXrTeHnEVHRina0orQ
llm_model=gemini-2.5-flash-lite
llm_api_url=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent
```

✅ These are optimized for free tier usage

To use different settings, update `.env` and restart server.
