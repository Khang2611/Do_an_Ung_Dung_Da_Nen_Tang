/**
 * services/lessonService.js
 *
 * Gọi API bài học:
 *   GET    /api/lessons                      → tất cả bài học
 *   GET    /api/lessons/chapter/:chapterId   → bài học theo chương
 *   GET    /api/lessons/:id                  → chi tiết bài học
 *   POST   /api/lessons                      → tạo (ADMIN/TEACHER)
 *   PUT    /api/lessons/:id                  → cập nhật (ADMIN/TEACHER)
 *   DELETE /api/lessons/:id                  → xóa (ADMIN/TEACHER)
 */

import axiosInstance from '../axiosInstance';

export const getAllLessons = async () => {
  const { data } = await axiosInstance.get('/lessons');
  return data.result;
};

export const getLessonsByChapter = async (chapterId) => {
  const { data } = await axiosInstance.get(`/lessons/chapter/${chapterId}`);
  return data.result;
};

export const getLesson = async (id) => {
  const { data } = await axiosInstance.get(`/lessons/${id}`);
  return data.result;
};

export const createLesson = async (payload) => {
  // payload: { chapterId, title, videoUrl, orderIndex }
  const { data } = await axiosInstance.post('/lessons', payload);
  return data.result;
};

export const updateLesson = async (id, payload) => {
  const { data } = await axiosInstance.put(`/lessons/${id}`, payload);
  return data.result;
};

export const deleteLesson = async (id) => {
  await axiosInstance.delete(`/lessons/${id}`);
};
