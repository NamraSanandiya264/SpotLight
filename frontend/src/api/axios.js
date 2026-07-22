import axios from 'axios';

export const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL or BACKEND_URL is not defined. Add VITE_API_URL to SPOTLIGHT/.env for local development or set it in Vercel.')
}

export const resolveBackendAssetUrl = (assetPath) => {
  if (!assetPath) return "";
  return assetPath.startsWith("http") ? assetPath : `${apiUrl}${assetPath}`;
};

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
