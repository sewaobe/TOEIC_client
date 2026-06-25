import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  recoverSession,
  setLogoutHandler,
  triggerLogout,
} from "./sessionManager";

export { setLogoutHandler, triggerLogout };

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `[AxiosClient]: ${response.config.baseURL?.concat(response.config.url || "")}`,
      response.data
    );
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const recovery = await recoverSession();

      if (recovery === "RECOVERED") {
        return axiosClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient as {
  get<T = unknown, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = unknown, R = T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R>;
  put<T = unknown, R = T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R>;
  patch<T = unknown, R = T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<R>;
  delete<T = unknown, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
};
