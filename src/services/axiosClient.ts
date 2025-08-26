import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Khởi tạo axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor cho response
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data, // luôn trả về response.data
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi là 401 (unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Gọi API refresh token (nó tự lấy từ cookie HttpOnly)
        await axiosClient.get('/auth/refresh-token');

        // Retry lại request gốc
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng fail → logout
        console.error('Refresh token failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Nếu lỗi khác hoặc đã retry → reject
    return Promise.reject(error);
  },
);

export default axiosClient;
