import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

const parseHostFromUri = (uri) => {
  if (!uri || typeof uri !== "string") return null;
  const cleaned = uri.replace(/^https?:\/\//, "").replace(/^exp:\/\//, "");
  const host = cleaned.split(":")[0];
  return host === "" ? null : host;
};

const getCurrentMobileHost = () => {
  const hostUri =
    extra.API_BASE_URL ||
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (typeof hostUri === "string") {
    const host = parseHostFromUri(hostUri);
    if (host) return `http://${host}:8080/api`;
  }

  return "http://192.168.44.100:8080/api";
};

const LOCAL_MOBILE_API = getCurrentMobileHost();
const WEB_API = extra.WEB_API_URL || "http://localhost:8080/api";

export const BASE_URL = Platform.OS === "web" ? WEB_API : LOCAL_MOBILE_API;

// ✅ Tạo instance trước khi dùng
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn(
        "Phiên làm việc hết hạn hoặc không có quyền. Đang xóa token...",
      );
      await AsyncStorage.multiRemove(["token", "user"]);
      if (Platform.OS === "web") {
        window.location.href = "/(auth)/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
