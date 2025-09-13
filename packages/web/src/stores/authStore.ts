import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3101';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // Send cookies with requests

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchCsrfToken: () => Promise<void>;
  clearError: () => void;
  setAccessToken: (token: string | null) => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Add axios interceptors for token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      csrfToken: null,

      setAccessToken: (token) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common['Authorization'];
        }
        set({ accessToken: token });
      },

      fetchCsrfToken: async () => {
        try {
          const response = await axios.get('/csrf-token');
          const token = response.data.csrfToken;
          set({ csrfToken: token });
          // Set CSRF token header for all future requests
          axios.defaults.headers.common['X-CSRF-Token'] = token;
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/v1/auth/login', {
            email,
            password,
          });

          const { user, accessToken } = response.data;
          
          get().setAccessToken(accessToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch CSRF token after successful login
          await get().fetchCsrfToken();
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }>;
          set({
            isLoading: false,
            error: axiosError.response?.data?.error || 'Login failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/v1/auth/register', data);
          
          const { user, accessToken } = response.data;
          
          get().setAccessToken(accessToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch CSRF token after successful registration
          await get().fetchCsrfToken();
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }>;
          set({
            isLoading: false,
            error: axiosError.response?.data?.error || 'Registration failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await axios.post('/api/v1/auth/logout');
        } catch (error) {
          // Even if logout fails, clear local state
          console.error('Logout error:', error);
        } finally {
          get().setAccessToken(null);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            csrfToken: null,
          });
          delete axios.defaults.headers.common['X-CSRF-Token'];
        }
      },

      refreshToken: async () => {
        try {
          const response = await axios.post('/api/v1/auth/refresh');
          const { accessToken, user } = response.data;
          
          get().setAccessToken(accessToken);
          
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          // Refresh failed, logout user
          get().setAccessToken(null);
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired. Please login again.',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const csrfToken = useAuthStore.getState().csrfToken;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await useAuthStore.getState().refreshToken();
        const token = useAuthStore.getState().accessToken;
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Redirect to login or handle as needed
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);