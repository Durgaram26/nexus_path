export const verifyTokenClient = (token: string) => {
  try {
    // Simple JWT decode without verification for client-side
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded as { userId: number; role: string };
  } catch (error) {
    return null;
  }
};

// Helper function to get token from localStorage or cookie
export const getTokenFromStorage = () => {
  // First try localStorage
  let token = localStorage.getItem('access_token');
  console.log('Token from localStorage:', token ? 'Found' : 'Not found');
  
  // If not in localStorage, try to extract from cookie
  if (!token && typeof document !== 'undefined') {
    console.log('Trying to extract token from cookie...');
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    if (accessTokenCookie) {
      token = accessTokenCookie.split('=')[1];
      console.log('Token extracted from cookie and stored in localStorage');
      // Store it in localStorage for future use
      localStorage.setItem('access_token', token);
    } else {
      console.log('No access_token cookie found');
    }
  }
  
  console.log('Final token:', token ? 'Available' : 'null');
  return token;
};

export const getAuthHeaders = () => {
  const token = getTokenFromStorage();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const isAuthenticated = () => {
  const token = getTokenFromStorage();
  if (!token) return false;
  
  const decoded = verifyTokenClient(token);
  return decoded !== null;
};







