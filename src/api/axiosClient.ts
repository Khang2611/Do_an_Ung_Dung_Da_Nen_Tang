import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(error: any) {
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data === "string") return data;
  if (error?.message === "Network Error") return "Không thể kết nối máy chủ. Kiểm tra backend hoặc VITE_API_BASE_URL.";
  return "Có lỗi xảy ra khi kết nối máy chủ.";
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 6000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth:logout"));
      if (!window.location.pathname.includes("/login")) window.location.href = "/login";
    }
    return Promise.reject(new ApiError(getErrorMessage(error), error?.response?.status));
  },
);

export function unwrap<T>(response: any): T {
  return (response?.data?.result ?? response?.data?.data ?? response?.data) as T;
}

export default axiosClient;
