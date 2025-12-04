// API Service - handles all backend communication
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsConfig from '@/lib/aws-config';

const api = axios.create({
  baseURL: awsConfig.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        config.headers.Authorization = `Bearer ${session.tokens.idToken.toString()}`;
      }
    } catch (error) {
      // User not authenticated - continue without token
      console.debug('No auth session available');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Type for API responses with standardized envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string; details?: unknown } | null;
  meta: { timestamp: string; [key: string]: unknown };
}

// Helper to extract data from response envelope
export async function unwrapResponse<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

// API endpoints
export const endpoints = {
  // Health
  health: () => api.get('/health'),

  // Flights - Public endpoints
  getFlights: (params?: { global?: boolean; lat?: number; lon?: number; dist?: number }) =>
    api.get('/flights', { params }),
  getFlightDetails: (aircraftId: string) => api.get(`/flights/${aircraftId}/details`),

  // Flight trails
  getTrail: (aircraftId: string, hours?: number) =>
    api.get(`/trails/${aircraftId}`, { params: { hours } }),

  // User profile - Protected endpoints
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: Record<string, unknown>) => api.put(`/users/${userId}`, data),

  // Admin config - Protected endpoints
  getAdminConfig: () => api.get('/admin/config'),
  updateAdminConfig: (data: Record<string, boolean>) => api.put('/admin/config', data),
};
