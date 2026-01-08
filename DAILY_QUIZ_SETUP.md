# Daily Quiz System Setup Instructions

## 1. Environment Variables
Add these to your .env file:

# Daily Quiz Cron Configuration
CRON_SECRET=your-secure-cron-secret-here
DATABASE_URL=your-database-url-here

# Optional: Set timezone for cron jobs
TZ=UTC


## 2. Cron Job Setup Options

### Option A: Vercel Cron (Recommended for Vercel deployments)
1. Add the following to your vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/daily-quiz-reset",
      "schedule": "0 0 * * *"
    }
  ]
}

2. Set CRON_SECRET in your Vercel environment variables

### Option B: GitHub Actions (Recommended for GitHub deployments)
1. Create .github/workflows/daily-quiz-reset.yml with the provided content
2. Set APP_URL and CRON_SECRET as GitHub secrets

### Option C: Traditional Cron (For VPS/Server deployments)
1. Add the cron job to your crontab:

# Daily Quiz Reset - Runs at midnight UTC
0 0 * * * curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \
  -H "Authorization: Bearer your-secure-cron-secret-here" \
  -H "Content-Type: application/json"

# Alternative: Use a cron service like Vercel Cron or GitHub Actions
# For Vercel: Add to vercel.json
# For GitHub Actions: Create .github/workflows/daily-quiz-reset.yml


### Option D: External Cron Service
Use services like:
- cron-job.org
- EasyCron
- SetCronJob

## 3. Manual Testing
Test the cron endpoint manually:
```bash
curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \
  -H "Authorization: Bearer your-secure-cron-secret-here"
```

## 4. Monitoring
- Check application logs for cron job execution
- Monitor database for daily quiz resets
- Set up alerts for failed cron jobs

## 5. Database Maintenance
The system automatically:
- Archives old quiz data
- Updates student performance metrics
- Resets daily quiz availability
- Tracks learning progress

## 6. Security Notes
- Use a strong CRON_SECRET
- Restrict cron endpoint access
- Monitor for unauthorized access
- Log all cron job executions