import axios from "axios";
import { getTokenFromStorage } from "@/src/lib/auth-client";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // This ensures cookies are sent with requests
  timeout: 30000, // 30 seconds default timeout
});

api.interceptors.request.use((config) => {
  // Use the proper token extraction method
  const token = getTokenFromStorage();
  console.log('API interceptor - Token check:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 20) + '...' : 'null',
    url: config.url,
    fullUrl: `${config.baseURL}${config.url}`,
    headers: config.headers
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token added to request headers');
  } else {
    console.log('No token found - request will likely fail with 401');
  }
  return config;
});

// Add response interceptor to debug response issues
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.log('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      dataString: JSON.stringify(error.response?.data),
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
