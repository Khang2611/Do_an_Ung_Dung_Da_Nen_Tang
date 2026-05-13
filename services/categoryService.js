/**
 * services/categoryService.js
 *
 * Gọi API danh mục:
 *   GET    /api/categories      → tất cả danh mục
 *   GET    /api/categories/:id  → chi tiết danh mục
 *   POST   /api/categories      → tạo (ADMIN/TEACHER)
 *   PUT    /api/categories/:id  → cập nhật (ADMIN/TEACHER)
 *   DELETE /api/categories/:id  → xóa (ADMIN/TEACHER)
 */

import axiosInstance from '../axiosInstance';

export const getAllCategories = async () => {
  const { data } = await axiosInstance.get('/categories');
  return data.result;
};

export const getCategory = async (id) => {
  const { data } = await axiosInstance.get(`/categories/${id}`);
  return data.result;
};

export const createCategory = async (payload) => {
  const { data } = await axiosInstance.post('/categories', payload);
  return data.result;
};

export const updateCategory = async (id, payload) => {
  const { data } = await axiosInstance.put(`/categories/${id}`, payload);
  return data.result;
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/categories/${id}`);
};
