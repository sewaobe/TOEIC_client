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

// Race condition khi nhiều request cùng fail 401 → chỉ cần refresh token 1 lần duy nhất, các request còn lại sẽ chờ và retry sau khi token đã được refresh
let isRefreshing = false;
let failQueue: Array<{
  resolve: () => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (err?: any) => {
  failQueue.forEach(prom => {
    if (err) {
      prom.reject(err);
    } else {
      prom.resolve();
    }
  })

  failQueue = [];
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[AxiosClient]: ${response.config.baseURL?.concat(response.config.url || "")}`, response.data)
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Kiểm tra nếu đang refresh token thì push request vô queue
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) =>
          failQueue.push({ resolve, reject }))
          .then(() => {
            // Retry lại request với axios
            originalRequest._retry = true;
            return axiosClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      // Đánh dấu đang refresh token
      isRefreshing = true;
      originalRequest._retry = true;
      try {
        await axiosRefresh.get('/auth/refresh-token'); // gọi riêng

        isRefreshing = false;
        processQueue(null); // Phát tín hiệu đã refresh xong để thực hiện các request còn lại đang trong queue
        return axiosClient(originalRequest); // retry request gốc
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);

        isRefreshing = false;
        processQueue(refreshError); // Phát tìn hiệu refresh bị lỗi nên reject tất cả request đang có trong queue
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
  patch<T = any, R = T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>; // ✅ thêm dòng này
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
};


