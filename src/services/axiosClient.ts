import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NavigateFunction } from 'react-router-dom';

let navigateRef: NavigateFunction | null = null;
export const setNavigate = (navigate: NavigateFunction) => { navigateRef = navigate; };

// logoutService.ts
let logoutHandler: (() => void) | null = null;

/** Thiết lập handler logout từ component */
export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

/** Gọi logout */
export const triggerLogout = () => {
  if (logoutHandler) logoutHandler();
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

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
        await axiosRefresh.get('/auth/refresh-token'); // gọi riêng
        return axiosClient(originalRequest); // retry request gốc
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        triggerLogout(); // → component lắng nghe để dispatch + redirect
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);


export default axiosClient as {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  put<T = any, R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
};

