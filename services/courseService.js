/**
 * services/courseService.js
 *
 * Gọi API khóa học:
 *   GET    /api/courses          → danh sách tất cả khóa học (ADMIN/TEACHER/USER)
 *   GET    /api/courses/myCourse → khóa học của user hiện tại
 *   GET    /api/courses/:id      → chi tiết khóa học
 *   POST   /api/courses          → tạo khóa học (ADMIN/TEACHER)
 *   PUT    /api/courses/:id      → cập nhật (ADMIN/TEACHER)
 *   DELETE /api/courses/:id      → xóa (ADMIN/TEACHER)
 *
 * Backend route: CourseController.java
 * Yêu cầu JWT Bearer token trong header.
 */

import axiosInstance from '../axiosInstance';

/**
 * Lấy tất cả khóa học
 * @returns {Promise<CourseResponse[]>}
 */
export const getAllCourses = async () => {
  const { data } = await axiosInstance.get('/courses');
  return data.result;
};

/**
 * Lấy khóa học mà user hiện tại đã đăng ký
 * @returns {Promise<CourseResponse[]>}
 */
export const getMyCourses = async () => {
  const { data } = await axiosInstance.get('/courses/myCourse');
  return data.result;
};

/**
 * Lấy chi tiết một khóa học
 * @param {number|string} id
 * @returns {Promise<CourseResponse>}
 */
export const getCourse = async (id) => {
  const { data } = await axiosInstance.get(`/courses/${id}`);
  return data.result;
};

/**
 * Tạo khóa học mới (ADMIN/TEACHER)
 * @param {{ title, description, price, categoryId }} payload
 * @returns {Promise<CourseResponse>}
 */
export const createCourse = async (payload) => {
  const { data } = await axiosInstance.post('/courses', payload);
  return data.result;
};

/**
 * Cập nhật khóa học (ADMIN/TEACHER)
 * @param {number|string} id
 * @param {{ title?, description?, price?, categoryId? }} payload
 * @returns {Promise<CourseResponse>}
 */
export const updateCourse = async (id, payload) => {
  const { data } = await axiosInstance.put(`/courses/${id}`, payload);
  return data.result;
};

/**
 * Xóa khóa học (ADMIN/TEACHER)
 * @param {number|string} id
 */
export const deleteCourse = async (id) => {
  await axiosInstance.delete(`/courses/${id}`);
};
