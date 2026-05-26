import axiosClient, { unwrap } from "./axiosClient";
import { PAYMENT_TRANSACTIONS } from "./endpoints";

export interface PaymentTransaction {
  transactionId: number;
  userId: number;
  orderId: number;
  amount: number;
  paymentMethod?: string;
  transactionRef: string;
  status: string;
  gatewayUrl?: string;
}

export interface PendingPayment {
  courseId: string;
  transactionId: number;
  transactionRef: string;
  status: string;
  createdAt: string;
}

const PENDING_PAYMENT_KEY = "pending_payment";

export async function createPayment(courseId: string): Promise<PaymentTransaction> {
  const rawUser = localStorage.getItem("auth_user");
  let user = rawUser ? JSON.parse(rawUser) : null;
  if (!(user?.id ?? user?.userId)) {
    const meResponse = await axiosClient.get("/api/auth/me");
    user = unwrap<any>(meResponse);
    localStorage.setItem("auth_user", JSON.stringify({ ...user, id: user?.id ?? user?.userId }));
  }
  const userId = user?.id ?? user?.userId;
  if (!userId) {
    throw new Error("Backend login chưa trả userId.");
  }
  const response = await axiosClient.post(PAYMENT_TRANSACTIONS, {
    userId: Number(userId),
    orderId: Number(courseId),
    courseId: Number(courseId),
    paymentMethod: "GATEWAY",
  });
  return unwrap<PaymentTransaction>(response);
}

export async function getPaymentTransaction(id: string | number): Promise<PaymentTransaction> {
  const response = await axiosClient.get(`${PAYMENT_TRANSACTIONS}/${id}`);
  return unwrap<PaymentTransaction>(response);
}

export function savePendingPayment(courseId: string, payment: PaymentTransaction) {
  const pending: PendingPayment = {
    courseId,
    transactionId: payment.transactionId,
    transactionRef: payment.transactionRef,
    status: payment.status,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pending));
}

export function getPendingPayment(): PendingPayment | null {
  const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  localStorage.removeItem(PENDING_PAYMENT_KEY);
}
