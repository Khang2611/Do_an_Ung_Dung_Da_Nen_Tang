/**
 * services/resourceService.js
 *
 * Gọi API tài liệu đính kèm bài học:
 *   GET    /api/resources                   → tất cả tài liệu
 *   GET    /api/resources/lesson/:lessonId  → tài liệu theo bài học
 *   GET    /api/resources/:id               → chi tiết
 *   POST   /api/resources                   → tạo (ADMIN/TEACHER)
 *   PUT    /api/resources/:id               → cập nhật (ADMIN/TEACHER)
 *   DELETE /api/resources/:id               → xóa (ADMIN/TEACHER)
 */

import axiosInstance from '../axiosInstance';

export const getAllResources = async () => {
  const { data } = await axiosInstance.get('/resources');
  return data.result;
};

export const getResourcesByLesson = async (lessonId) => {
  const { data } = await axiosInstance.get(`/resources/lesson/${lessonId}`);
  return data.result;
};

export const getResource = async (id) => {
  const { data } = await axiosInstance.get(`/resources/${id}`);
  return data.result;
};

export const createResource = async (payload) => {
  const { data } = await axiosInstance.post('/resources', payload);
  return data.result;
};

export const updateResource = async (id, payload) => {
  const { data } = await axiosInstance.put(`/resources/${id}`, payload);
  return data.result;
};

export const deleteResource = async (id) => {
  await axiosInstance.delete(`/resources/${id}`);
};
