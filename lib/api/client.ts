import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create API Request/Response Types (as per task 1.7.4)
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Create base client
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Configure API base URL and interceptors (task 1.7.2 & 1.7.5)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Setup authentication token handling
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexus_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Setup error handling middleware (task 1.7.3)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle global errors here
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_auth_token');
        // Optional: redirect to login
        // window.location.href = '/login';
      }
    }
    const customError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
