/**
 * services/chapterService.js
 *
 * Gọi API chương học:
 *   GET    /api/chapters                   → tất cả chương
 *   GET    /api/chapters/course/:courseId  → chương theo khóa học
 *   GET    /api/chapters/:id               → chi tiết chương
 *   POST   /api/chapters                   → tạo (ADMIN/TEACHER)
 *   PUT    /api/chapters/:id               → cập nhật (ADMIN/TEACHER)
 *   DELETE /api/chapters/:id               → xóa (ADMIN/TEACHER)
 */

import axiosInstance from '../axiosInstance';

export const getAllChapters = async () => {
  const { data } = await axiosInstance.get('/chapters');
  return data.result;
};

export const getChaptersByCourse = async (courseId) => {
  const { data } = await axiosInstance.get(`/chapters/course/${courseId}`);
  return data.result;
};

export const getChapter = async (id) => {
  const { data } = await axiosInstance.get(`/chapters/${id}`);
  return data.result;
};

export const createChapter = async (payload) => {
  // payload: { courseId, title, orderIndex }
  const { data } = await axiosInstance.post('/chapters', payload);
  return data.result;
};

export const updateChapter = async (id, payload) => {
  const { data } = await axiosInstance.put(`/chapters/${id}`, payload);
  return data.result;
};

export const deleteChapter = async (id) => {
  await axiosInstance.delete(`/chapters/${id}`);
};
