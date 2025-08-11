import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/v1/auth/signup', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/v1/auth/login', credentials);
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/v1/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return response.data;
  },
  
  requestEmailVerification: async () => {
    const response = await api.get('/v1/auth/email-verify/request');
    return response.data;
  },
  
  submitEmailVerification: async (otp) => {
    const response = await api.post('/v1/auth/email-verify/submit', { otp });
    return response.data;
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/v1/user/');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/v1/user/', userData);
    return response.data;
  },
  
  getDoctors: async () => {
    const response = await api.get('/v1/user/doctors');
    return response.data;
  }
};

// Appointment APIs
export const appointmentAPI = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/v1/appointments/', appointmentData);
    return response.data;
  },
  
  getAppointments: async (role) => {
    const response = await api.get(`/v1/appointments/${role}`);
    return response.data;
  },
  
  updateAppointmentStatus: async (appointmentId, statusData) => {
    const response = await api.put(`/v1/appointments/${appointmentId}`, statusData);
    return response.data;
  }
};

// Medical Reports APIs
export const reportsAPI = {
  uploadReport: async (formData) => {
    const response = await api.post('/v1/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Test API
export const getGreeting = async () => {
  try {
    const response = await api.get('/greeting');
    return response.data;
  } catch (error) {
    console.error('Error fetching greeting:', error);
    throw error;
  }
};

export default api; 