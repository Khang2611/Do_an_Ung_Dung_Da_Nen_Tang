/**
 * hooks/useAuth.js  ← THAY THẾ file gốc dùng mock data
 *
 * AuthProvider:
 *   - Gọi authService.login() → lưu token + user vào AsyncStorage
 *   - Khôi phục session khi mở lại app (load từ AsyncStorage)
 *   - Gọi authService.register() cho màn hình đăng ký
 *   - logout() → xóa token, điều hướng về login
 *
 * Lắng nghe event 'auth:logout' từ axiosInstance (401 interceptor)
 * để tự động đăng xuất khi token hết hạn.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { login as loginApi, register as registerApi } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // đang khôi phục session

  // ─── Khôi phục session khi khởi động app ───────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (_) {
        // Dữ liệu lưu bị lỗi → bỏ qua, bắt user đăng nhập lại
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Đăng nhập ─────────────────────────────────────────────────────────────
  /**
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   * @throws Error nếu sai thông tin đăng nhập (backend trả 4xx)
   */
  const login = useCallback(async (username, password) => {
    const result = await loginApi(username, password);
    // result = { accessToken, username, role, ... } (LoginResponse từ backend)

    const token = result.accessToken;

    await Promise.all([
      AsyncStorage.setItem('token', token),
      AsyncStorage.setItem('user', JSON.stringify(result)),
    ]);

    setToken(token);
    setUser(result);
  }, []);

  // ─── Đăng ký ───────────────────────────────────────────────────────────────
  /**
   * @param {{ username, password, fullName, email }} payload
   * @returns {Promise<UserResponse>}
   */
  const register = useCallback(async (payload) => {
    return await registerApi(payload);
    // Sau khi đăng ký thành công → màn hình gọi router.push('/(auth)/login')
  }, []);

  // ─── Đăng xuất ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user'),
    ]);
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
