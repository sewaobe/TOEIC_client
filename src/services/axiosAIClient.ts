import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const axiosAIClient = axios.create({
    baseURL: import.meta.env.VITE_AI_API_URL || "http://localhost:8089/api/v1",
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
});

/* ---------- REQUEST LOG ---------- */
axiosAIClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log(
            `%c[AI-Request]`,
            "color: #22c55e; font-weight: bold;",
            config.method?.toUpperCase(),
            config.baseURL?.concat(config.url || ""),
            config.data ? "\n📦 Payload:" : "",
            config.data || ""
        );
        return config;
    },
    (error: AxiosError) => {
        console.error("[AI-Request Error]", error);
        return Promise.reject(error);
    }
);

/* ---------- RESPONSE LOG ---------- */
axiosAIClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(
            `%c[AI-Response]`,
            "color: #3b82f6; font-weight: bold;",
            response.config.baseURL?.concat(response.config.url || ""),
            "\n✅ Status:",
            response.status,
            "\n📤 Data:",
            response.data
        );
        return response;
    },
    (error: AxiosError) => {
        console.error(
            "%c[AI-Response Error]",
            "color: #ef4444; font-weight: bold;",
            error.config?.baseURL?.concat(error.config?.url || ""),
            "\n❌ Message:",
            error.message,
            "\n📦 Response:",
            error.response?.data
        );
        return Promise.reject(error);
    }
);

export default axiosAIClient;
