import axios from 'axios';

// Usamos el puerto 3000 por defecto para el backend local, o la variable de entorno si existe
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
