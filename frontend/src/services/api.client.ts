import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { StandardResponse, ApiError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and transform data
apiClient.interceptors.response.use(
  (response: AxiosResponse<StandardResponse>) => {
    // Convert timestamps to Saudi Arabia timezone (UTC+3)
    if (response.data.timestamp) {
      const date = new Date(response.data.timestamp);
      // Adjust to UTC+3
      date.setHours(date.getHours() + 3);
      response.data.timestamp = date.toISOString();
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
        timestamp: new Date().toISOString(),
      } as ApiError);
    }

    // Return formatted error
    const apiError: ApiError = {
      success: false,
      error: error.response.data?.error || 'UNKNOWN_ERROR',
      message: error.response.data?.message || 'An unexpected error occurred',
      details: error.response.data?.details,
      timestamp: error.response.data?.timestamp || new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

// Generic API call wrapper with type safety
export async function apiCall<T = any>(
  config: AxiosRequestConfig
): Promise<StandardResponse<T>> {
  try {
    const response = await apiClient.request<StandardResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>({ ...config, method: 'GET', url }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiCall<T>({ ...config, method: 'POST', url, data }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiCall<T>({ ...config, method: 'PUT', url, data }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiCall<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>({ ...config, method: 'DELETE', url }),
};

export default apiClient;
