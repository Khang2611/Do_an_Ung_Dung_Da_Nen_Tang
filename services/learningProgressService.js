/**
 * services/learningProgressService.js
 *
 * Gọi API tiến độ học tập:
 *   POST /api/learning-progresses                          → tạo tiến độ (USER/ADMIN)
 *   GET  /api/learning-progresses/enrollment/:enrollmentId → theo enrollment
 *   GET  /api/learning-progresses/:id                      → chi tiết
 *   PUT  /api/learning-progresses/:id                      → cập nhật (đánh dấu hoàn thành)
 *   DELETE /api/learning-progresses/:id                    → xóa (ADMIN)
 */

import axiosInstance from '../axiosInstance';

/**
 * Tạo bản ghi tiến độ học tập cho một bài học
 * @param {{ enrollmentId: number, lessonId: number }} payload
 */
export const createLearningProgress = async (payload) => {
  const { data } = await axiosInstance.post('/learning-progresses', payload);
  return data.result;
};

/**
 * Lấy tiến độ của một enrollment (tất cả bài đã học)
 * @param {number} enrollmentId
 */
export const getProgressByEnrollment = async (enrollmentId) => {
  const { data } = await axiosInstance.get(`/learning-progresses/enrollment/${enrollmentId}`);
  return data.result;
};

export const getLearningProgress = async (id) => {
  const { data } = await axiosInstance.get(`/learning-progresses/${id}`);
  return data.result;
};

/**
 * Đánh dấu hoàn thành bài học
 * @param {number} id - ID của bản ghi learning progress
 * @param {{ isCompleted: boolean }} payload
 */
export const updateLearningProgress = async (id, payload) => {
  const { data } = await axiosInstance.put(`/learning-progresses/${id}`, payload);
  return data.result;
};

export const deleteLearningProgress = async (id) => {
  await axiosInstance.delete(`/learning-progresses/${id}`);
};
