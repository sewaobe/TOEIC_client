import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig 
} from 'axios';
import type { NavigateFunction } from 'react-router-dom';
import { store } from '../stores/store';

// --- Các phần khác giữ nguyên ---
let navigateRef: NavigateFunction | null = null;
export const setNavigate = (navigate: NavigateFunction) => { navigateRef = navigate; };
let logoutHandler: (() => void) | null = null;
export const setLogoutHandler = (handler: () => void) => { logoutHandler = handler; };
export const triggerLogout = () => { if (logoutHandler) logoutHandler(); };
// ------------------------------

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Cập nhật type cho config
const addAuthHeaderInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const activeUserId = localStorage.getItem("activeUserId");

  if (activeUserId) {
    // Với InternalAxiosRequestConfig, object headers luôn tồn tại,
    // không cần kiểm tra "config.headers || {}" nữa.
    config.headers['X-Active-User-ID'] = activeUserId;
  }
  return config;
};

// Áp dụng interceptor cho cả hai instance
axiosClient.interceptors.request.use(addAuthHeaderInterceptor, (error) => Promise.reject(error));
axiosRefresh.interceptors.request.use(addAuthHeaderInterceptor, (error) => Promise.reject(error));

// --- Interceptor response ---
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(">>>>>>>>>>>>AxiosClient: ", response.data)
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosRefresh.get('/auth/refresh-token');
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        triggerLogout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// --- Export giữ nguyên ---
export default axiosClient as {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  put<T = any, R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
};