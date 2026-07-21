import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL is not defined. Add VITE_API_URL to frontend/.env for local development or set it in Vercel.')
}

const API = axios.create({
  baseURL: `${apiUrl}/api`,
});

// request interceptor to add auth token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
