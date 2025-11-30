// API Service - handles all backend communication
import axios from 'axios';
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
    // TODO: Add Cognito token to requests
    // const session = await fetchAuthSession();
    // if (session.tokens?.idToken) {
    //   config.headers.Authorization = `Bearer ${session.tokens.idToken}`;
    // }
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

// API endpoints
export const endpoints = {
  // Health
  health: () => api.get('/health'),

  // Flights
  searchFlights: (query: string) => api.get(`/flights/search?q=${query}`),
  getFlight: (flightId: string) => api.get(`/flights/${flightId}`),
  getFlightPositions: (bounds: { north: number; south: number; east: number; west: number }) =>
    api.get('/flights/positions', { params: bounds }),

  // User's tracked flights
  getTrackedFlights: () => api.get('/user/flights'),
  trackFlight: (flightId: string) => api.post(`/user/flights/${flightId}`),
  untrackFlight: (flightId: string) => api.delete(`/user/flights/${flightId}`),

  // User profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/user/profile', data),

  // Crossings
  getCrossings: () => api.get('/user/crossings'),
  getCrossing: (crossingId: string) => api.get(`/crossings/${crossingId}`),
};
