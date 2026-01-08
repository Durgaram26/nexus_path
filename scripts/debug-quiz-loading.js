const fetch = require('node-fetch');

async function debugQuizLoading() {
  console.log('🔍 Debugging Quiz Loading Issue...');
  
  try {
    // Test if the API endpoints are working
    console.log('\n📡 Testing API endpoints...');
    
    // Test daily quiz API
    console.log('\n1️⃣ Testing /api/student/daily-quiz...');
    try {
      const quizResponse = await fetch('http://localhost:3000/api/student/daily-quiz', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: You'll need to add proper authentication headers
        }
      });
      
      console.log(`   Status: ${quizResponse.status}`);
      if (quizResponse.ok) {
        const data = await quizResponse.json();
        console.log('   Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('   Error:', await quizResponse.text());
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    // Test quiz history API
    console.log('\n2️⃣ Testing /api/student/quiz-history...');
    try {
      const historyResponse = await fetch('http://localhost:3000/api/student/quiz-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: You'll need to add proper authentication headers
        }
      });
      
      console.log(`   Status: ${historyResponse.status}`);
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        console.log('   Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('   Error:', await historyResponse.text());
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }
    
    console.log('\n💡 Common causes of "Loading quiz data..." issue:');
    console.log('1. ❌ Authentication failed - Check if user is logged in');
    console.log('2. ❌ API endpoints not responding - Check if backend is running');
    console.log('3. ❌ Network errors - Check browser console for errors');
    console.log('4. ❌ CORS issues - Check if API allows frontend requests');
    console.log('5. ❌ Database connection issues - Check if database is accessible');
    
    console.log('\n🔧 Debugging steps:');
    console.log('1. Open browser console (F12)');
    console.log('2. Navigate to: http://localhost:3000/student/career-dashboard#daily-quiz');
    console.log('3. Look for console logs starting with 🔄, 📊, 📈, ✅, ❌');
    console.log('4. Check Network tab for failed API calls');
    console.log('5. Verify authentication token is present');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Run the debug script
debugQuizLoading();
