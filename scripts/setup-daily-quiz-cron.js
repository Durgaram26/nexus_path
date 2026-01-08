#!/usr/bin/env node

/**
 * Setup script for daily quiz cron job
 * This script helps configure the daily quiz reset system
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Setting up Daily Quiz Cron System...\n');

// Create environment variables template
const envTemplate = `
# Daily Quiz Cron Configuration
CRON_SECRET=your-secure-cron-secret-here
DATABASE_URL=your-database-url-here

# Optional: Set timezone for cron jobs
TZ=UTC
`;

// Create cron job configuration
const cronConfig = `
# Daily Quiz Reset - Runs at midnight UTC
0 0 * * * curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \\
  -H "Authorization: Bearer your-secure-cron-secret-here" \\
  -H "Content-Type: application/json"

# Alternative: Use a cron service like Vercel Cron or GitHub Actions
# For Vercel: Add to vercel.json
# For GitHub Actions: Create .github/workflows/daily-quiz-reset.yml
`;

// Create Vercel cron configuration
const vercelCronConfig = {
  "crons": [
    {
      "path": "/api/cron/daily-quiz-reset",
      "schedule": "0 0 * * *"
    }
  ]
};

// Create GitHub Actions workflow
const githubActionsWorkflow = `name: Daily Quiz Reset

on:
  schedule:
    - cron: '0 0 * * *'  # Run at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  reset-daily-quiz:
    runs-on: ubuntu-latest
    
    steps:
    - name: Reset Daily Quiz
      run: |
        curl -X POST "\${{ secrets.APP_URL }}/api/cron/daily-quiz-reset" \\
          -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}" \\
          -H "Content-Type: application/json"
`;

// Create setup instructions
const setupInstructions = `
# Daily Quiz System Setup Instructions

## 1. Environment Variables
Add these to your .env file:
${envTemplate}

## 2. Cron Job Setup Options

### Option A: Vercel Cron (Recommended for Vercel deployments)
1. Add the following to your vercel.json:
${JSON.stringify(vercelCronConfig, null, 2)}

2. Set CRON_SECRET in your Vercel environment variables

### Option B: GitHub Actions (Recommended for GitHub deployments)
1. Create .github/workflows/daily-quiz-reset.yml with the provided content
2. Set APP_URL and CRON_SECRET as GitHub secrets

### Option C: Traditional Cron (For VPS/Server deployments)
1. Add the cron job to your crontab:
${cronConfig}

### Option D: External Cron Service
Use services like:
- cron-job.org
- EasyCron
- SetCronJob

## 3. Manual Testing
Test the cron endpoint manually:
\`\`\`bash
curl -X POST "https://your-domain.com/api/cron/daily-quiz-reset" \\
  -H "Authorization: Bearer your-secure-cron-secret-here"
\`\`\`

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
`;

// Write configuration files
try {
  // Write environment template
  fs.writeFileSync(path.join(__dirname, '../.env.cron.template'), envTemplate.trim());
  console.log('✅ Created .env.cron.template');
  
  // Write cron configuration
  fs.writeFileSync(path.join(__dirname, '../cron-config.txt'), cronConfig.trim());
  console.log('✅ Created cron-config.txt');
  
  // Write Vercel configuration
  fs.writeFileSync(path.join(__dirname, '../vercel-cron.json'), JSON.stringify(vercelCronConfig, null, 2));
  console.log('✅ Created vercel-cron.json');
  
  // Write GitHub Actions workflow
  fs.writeFileSync(path.join(__dirname, '../.github/workflows/daily-quiz-reset.yml'), githubActionsWorkflow.trim());
  console.log('✅ Created .github/workflows/daily-quiz-reset.yml');
  
  // Write setup instructions
  fs.writeFileSync(path.join(__dirname, '../DAILY_QUIZ_SETUP.md'), setupInstructions.trim());
  console.log('✅ Created DAILY_QUIZ_SETUP.md');
  
  console.log('\n🎉 Daily Quiz Cron System setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated configuration files');
  console.log('2. Choose your preferred cron setup method');
  console.log('3. Configure environment variables');
  console.log('4. Test the cron endpoint manually');
  console.log('5. Deploy and monitor the system');
  console.log('\n📖 See DAILY_QUIZ_SETUP.md for detailed instructions');
  
} catch (error) {
  console.error('❌ Error setting up cron system:', errorerror.message);
  process.exit(1);
}
