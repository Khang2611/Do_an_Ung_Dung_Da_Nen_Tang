import axiosInstance from '../axiosInstance';

/**
 * Đổi mật khẩu của người dùng hiện tại
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = async (oldPassword, newPassword) => {
  const { data } = await axiosInstance.post('/users/change-password', { oldPassword, newPassword });
  return data;
};
