import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import {useAuthStore} from '@/store/authStore';

const API_BASE_URL =
  (process.env.API_BASE_URL as string) || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — image/PDF uploads + AI extraction can take a while
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — inject auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const session = useAuthStore.getState().session;
    if (session?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend uses a consistent { success, data, message } envelope.
    // Unwrap it so callers can type against the payload directly.
    const body = response.data as unknown;
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as {success?: unknown}).success === true &&
      'data' in body
    ) {
      response.data = (body as {data: unknown}).data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and force re-login
      useAuthStore.getState().clearAuth();

      // Optionally attempt token refresh here in the future
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
