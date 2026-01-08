'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthPayload {
  userId: string;
  role: string;
  email: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        let token = localStorage.getItem('access_token');
        
        if (!token) {
          // Try to get from cookies
          const cookies = document.cookie.split(';');
          const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
          if (accessTokenCookie) {
            token = accessTokenCookie.split('=')[1];
            localStorage.setItem('access_token', token);
          }
        }
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Decode JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setUser(decoded);
        setIsAuthenticated(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth/login');
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout
  };
}
