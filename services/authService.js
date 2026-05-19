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

/**
 * Đăng xuất
 */
export const logout = async () => {
  await axiosInstance.post('/auth/logout');
};

/**
 * Yêu cầu mã xác minh quên mật khẩu
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post('/auth/forgot-password', { email });
  return data;
};

/**
 * Đặt lại mật khẩu mới bằng OTP
 * @param {string} email
 * @param {string} code
 * @param {string} newPassword
 */
export const resetPassword = async (email, code, newPassword) => {
  const { data } = await axiosInstance.post('/auth/reset-password', { email, code, newPassword });
  return data;
};
