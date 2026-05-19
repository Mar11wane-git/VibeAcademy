import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Automatically attach Sanctum token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response && error.response.status === 503) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.is_admin) {
        const serverMessage = error.response.data?.message || "Le système est en maintenance.";
        alert(serverMessage);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
