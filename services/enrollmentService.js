/**
 * services/enrollmentService.js
 *
 * Gọi API đăng ký khóa học:
 *   POST /api/enrollments          → đăng ký khóa học (USER/ADMIN)
 *   GET  /api/enrollments/me       → danh sách đăng ký của user hiện tại
 *   GET  /api/enrollments/user/:userId   → theo userId (USER/ADMIN)
 *   GET  /api/enrollments/course/:courseId → theo courseId (ADMIN/TEACHER)
 *   GET  /api/enrollments/:id      → chi tiết enrollment
 *   PUT  /api/enrollments/:id      → cập nhật (ADMIN)
 *   DELETE /api/enrollments/:id    → xóa (ADMIN)
 */

import axiosInstance from '../axiosInstance';

/**
 * Đăng ký khóa học
 * @param {{ userId: number, courseId: number }} payload
 * @returns {Promise<EnrollmentResponse>}
 */
export const createEnrollment = async (payload) => {
  const { data } = await axiosInstance.post('/enrollments', payload);
  return data.result;
};

/**
 * Lấy danh sách khóa học đã đăng ký của user hiện tại
 * Trả về đầy đủ thông tin khóa học kèm theo
 * @returns {Promise<MyEnrollmentResponse[]>}
 */
export const getMyEnrollments = async () => {
  const { data } = await axiosInstance.get('/enrollments/me');
  return data.result;
};

export const getEnrollmentsByUser = async (userId) => {
  const { data } = await axiosInstance.get(`/enrollments/user/${userId}`);
  return data.result;
};

export const getEnrollmentsByCourse = async (courseId) => {
  const { data } = await axiosInstance.get(`/enrollments/course/${courseId}`);
  return data.result;
};

export const getEnrollment = async (id) => {
  const { data } = await axiosInstance.get(`/enrollments/${id}`);
  return data.result;
};

export const updateEnrollment = async (id, payload) => {
  const { data } = await axiosInstance.put(`/enrollments/${id}`, payload);
  return data.result;
};

export const deleteEnrollment = async (id) => {
  await axiosInstance.delete(`/enrollments/${id}`);
};
