import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { addMockPaidEnrollment } from "../data/mockData";

export type PaymentMethod = "VNPAY" | "MOMO" | "BANK_TRANSFER" | "DEMO";

export interface CreatePaymentResult {
  paymentUrl?: string;
  gatewayUrl?: string;
  orderId: string;
  courseId: string;
  status: "PAID" | "PENDING" | "FAILED";
  transactionId?: number;
  transactionRef?: string;
}

export interface PendingPayment {
  courseId: string;
  orderId: string;
  transactionId?: number;
  transactionRef?: string;
  createdAt: string;
}

const PENDING_PAYMENT_KEY = "pending_payment";

function getStoredUserId() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return user?.id ?? user?.userId ?? null;
  } catch {
    return null;
  }
}

export async function createPayment(courseId: string, paymentMethod: PaymentMethod): Promise<CreatePaymentResult> {
  if (USE_MOCK) {
    const result = addMockPaidEnrollment(courseId, paymentMethod);
    return {
      orderId: result.payment?.id || result.enrollment.id,
      courseId,
      status: "PAID",
    };
  }

  let userId = getStoredUserId();
  if (!userId) {
    const meResponse = await axiosClient.get("/api/auth/me");
    const me = unwrap<any>(meResponse);
    userId = me?.id ?? me?.userId;
    localStorage.setItem("auth_user", JSON.stringify({ ...me, id: userId }));
  }
  if (!userId) throw new Error("Backend chưa trả userId.");

  const response = await axiosClient.post("/api/payment-transactions", {
    userId: Number(userId),
    orderId: Number(courseId),
    courseId: Number(courseId),
    paymentMethod,
  });
  const transaction = unwrap<any>(response);
  const status = String(transaction.status || "PENDING").toUpperCase();
  const pending = {
    courseId,
    orderId: String(transaction.transactionId ?? transaction.orderId ?? courseId),
    transactionId: transaction.transactionId,
    transactionRef: transaction.transactionRef,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pending));
  return {
    paymentUrl: transaction.gatewayUrl,
    gatewayUrl: transaction.gatewayUrl,
    orderId: String(transaction.transactionId ?? transaction.orderId ?? courseId),
    courseId,
    status: status === "SUCCESS" ? "PAID" : status === "FAILED" ? "FAILED" : "PENDING",
    transactionId: transaction.transactionId,
    transactionRef: transaction.transactionRef,
  };
}

export async function getPaymentTransaction(id: string | number) {
  const response = await axiosClient.get(`/api/payment-transactions/${id}`);
  return unwrap<any>(response);
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
