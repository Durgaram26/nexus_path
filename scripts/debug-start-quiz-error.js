const axios = require('axios');

async function debugStartQuizError() {
  try {
    console.log('🔍 Debugging start-quiz 500 error...');
    
    // First, let's test if the server is running
    console.log('\n1. Testing server connectivity...');
    try {
      const healthCheck = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('Server is running, got response:', healthCheck.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Server is running (401 auth error is expected)');
      } else {
        console.log('❌ Server might not be running:', error.message);
        return;
      }
    }
    
    // Now let's test the start-quiz endpoint with a real token
    console.log('\n2. Testing start-quiz endpoint...');
    
    // Try to get a real token first
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'keerthanarajaram255@gmail.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        token = loginResponse.data.token;
        console.log('✅ Got authentication token');
      } else {
        console.log('❌ Failed to get token, using fake token for testing');
        token = 'fake-token';
      }
    } catch (loginError) {
      console.log('❌ Login failed, using fake token for testing');
      token = 'fake-token';
    }
    
    // Test the start-quiz endpoint
    try {
      const response = await axios.post('http://localhost:3000/api/student/start-quiz', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Start-quiz API working:', response.status);
      console.log('Response data:', response.data);
      
    } catch (error) {
      console.log('❌ Start-quiz API error:');
      console.log('Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Full error:', error.message);
      
      if (error.response?.data?.error) {
        console.log('\n🔍 Detailed error message:', error.response.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }
}

debugStartQuizError();
