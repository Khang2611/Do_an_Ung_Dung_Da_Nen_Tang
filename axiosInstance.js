/**
 * axiosInstance.js
 *
 * Cấu hình Axios trung tâm cho toàn bộ ứng dụng.
 * - Tự động đính kèm JWT token vào mọi request (request interceptor)
 * - Tự động xử lý lỗi 401 → logout (response interceptor)
 *
 * Cách dùng: import axiosInstance from '../axiosInstance';
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Thay bằng IP máy tính chạy backend khi test trên thiết bị thật ───────────
// Emulator Android : http://10.0.2.2:8080/api
// iOS Simulator / Web : http://localhost:8080/api
// Thiết bị thật   : http://<IP-LAN-của-bạn>:8080/api
export const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/api' 
  : 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: gắn token JWT vào header Authorization ──────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    // Kiểm tra kỹ tránh trường hợp token là chuỗi "null" hoặc "undefined"
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: bắt 401 → xóa token, điều hướng về login ──────────
// Lưu ý: điều hướng thực tế cần gọi router từ bên ngoài (xem useAuth.js)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Phát sự kiện để AuthProvider xử lý logout (xem useAuth.js)
      // Không import router trực tiếp ở đây để tránh circular dependency
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
