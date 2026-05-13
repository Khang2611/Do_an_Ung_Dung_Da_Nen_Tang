/**
 * services/paymentService.js
 *
 * Gọi API thanh toán:
 *   POST /api/payment-transactions      → tạo giao dịch thanh toán (USER/ADMIN)
 *   GET  /api/payment-transactions/:id  → chi tiết giao dịch
 *   POST /api/transaction-items         → thêm khóa học vào đơn hàng (USER/ADMIN)
 *   GET  /api/transaction-items/transaction/:transactionId → items của đơn
 */

import axiosInstance from '../axiosInstance';

/**
 * Tạo giao dịch thanh toán mới
 * Backend sẽ tự lấy IP từ request header
 * @param {{ courseId: number, amount: number, ... }} payload
 * @returns {Promise<PaymentTransactionResponse>} Bao gồm paymentUrl để mở WebView
 */
export const createPaymentTransaction = async (payload) => {
  const { data } = await axiosInstance.post('/payment-transactions', payload);
  return data.result;
};

export const getPaymentTransaction = async (id) => {
  const { data } = await axiosInstance.get(`/payment-transactions/${id}`);
  return data.result;
};

/**
 * Thêm một khóa học vào đơn hàng (trước khi thanh toán)
 * @param {{ transactionId: number, courseId: number, price: number }} payload
 * @returns {Promise<TransactionItemResponse>}
 */
export const addTransactionItem = async (payload) => {
  const { data } = await axiosInstance.post('/transaction-items', payload);
  return data.result;
};

/**
 * Lấy danh sách items của một đơn hàng
 * @param {number} transactionId
 */
export const getTransactionItems = async (transactionId) => {
  const { data } = await axiosInstance.get(`/transaction-items/transaction/${transactionId}`);
  return data.result;
};
