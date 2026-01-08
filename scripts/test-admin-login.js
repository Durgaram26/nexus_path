// Using built-in fetch (Node.js 18+)

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');

    const response = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('   Access token received');
      console.log('   Status:', response.status);
    } else {
      console.log('❌ Admin login failed:');
      console.log('   Status:', response.status);
      console.log('   Message:', data.message);
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
    console.log('   Make sure the server is running on localhost:3000');
  }
}

testAdminLogin();
