import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // This ensures cookies are sent with requests
});

api.interceptors.request.use((config) => {
  // Try to get token from localStorage first (for backward compatibility)
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Note: If no token in localStorage, the server will use the cookie-based auth
  return config;
});

export default api;
