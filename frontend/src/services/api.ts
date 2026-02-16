import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL
  || (process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : 'http://localhost:5001/api');

// Create axios instance (timeout so requests fail fast instead of hanging)
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'teacher' | 'parent' | 'employee';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const courseService = {
  getCourses: async () => {
    const response = await api.get('/creators/courses');
    return response.data;
  },
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  updateProgress: async (courseId: string, progress: number) => {
    const response = await api.put(`/courses/${courseId}/progress`, { progress });
    return response.data;
  },
};

export const assessmentService = {
  getAssessments: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },
  getAssessmentById: async (id: string) => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },
  submitAssessment: async (assessmentId: string, answers: Record<string, string>) => {
    const response = await api.post(`/assessments/${assessmentId}/submit`, { answers });
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (profileData: Partial<User>) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
};

export default api; 