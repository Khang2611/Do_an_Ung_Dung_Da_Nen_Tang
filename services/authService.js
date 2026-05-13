/**
 * services/authService.js
 *
 * Gọi API xác thực:
 *   POST /api/auth/login    → trả về { token, ... }
 *   POST /api/auth/register → trả về UserResponse
 *
 * Backend route: AuthController.java
 * Không cần JWT (permitAll trong SecurityConfig)
 */

import axiosInstance from '../axiosInstance';

/**
 * Đăng nhập
 * @param {string} username
 * @param {string} password
 * @returns {Promise<LoginResponse>} { token, username, role, ... }
 */
export const login = async (username, password) => {
  const { data } = await axiosInstance.post('/auth/login', { username, password });
  // Backend trả: { code, message, result: { token, ... } }
  return data.result;
};

/**
 * Đăng ký tài khoản mới
 * @param {{ username, password, fullName, email }} payload
 * @returns {Promise<UserResponse>}
 */
export const register = async (payload) => {
  const { data } = await axiosInstance.post('/auth/register', payload);
  return data.result;
};
