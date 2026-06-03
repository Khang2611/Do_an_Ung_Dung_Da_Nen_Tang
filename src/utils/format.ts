import type { ApiRole, FrontendRole } from "../types/auth";
import { formatRoleLabel, getRoleHome as getMappedRoleHome, toBackendRole, toFrontendRole as mapToFrontendRole } from "./roleMapper";

export function formatCurrency(value?: number) {
  if (!value) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function normalizeRole(role?: string): FrontendRole {
  return mapToFrontendRole(role);
}

export function toApiRole(role?: string): ApiRole {
  return toBackendRole(role);
}

export function toFrontendRole(role?: string): FrontendRole {
  return mapToFrontendRole(role);
}

export function normalizeStatus(status?: string) {
  const value = String(status || "active").toLowerCase();
  if (value === "inactive" || value === "disabled") return "locked";
  if (value === "locked") return "locked";
  if (value === "pending") return "pending";
  return "active";
}

export function toApiStatus(status?: string) {
  return normalizeStatus(status).toUpperCase() as "ACTIVE" | "LOCKED" | "PENDING";
}

export function formatRole(role?: string) {
  return formatRoleLabel(role);
}

export function normalizeCourseStatus(status?: string) {
  const value = String(status || "draft").toLowerCase();
  if (value === "published" || value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  if (value === "hidden") return "hidden";
  return "draft";
}

export function formatStatus(status?: string) {
  const normalized = String(status || "").toLowerCase();
  const map: Record<string, string> = {
    published: "Đã xuất bản",
    approved: "Đã xuất bản",
    pending: "Bản nháp",
    pending_review: "Bản nháp",
    draft: "Bản nháp",
    rejected: "Bị từ chối",
    active: "Hoạt động",
    inactive: "Tạm khóa",
    locked: "Tạm khóa",
    hidden: "Đã ẩn",
  };
  return map[normalized] || status || "Đang cập nhật";
}

export function getStatusBadgeVariant(status?: string) {
  const normalized = String(status || "").toLowerCase();
  if (["published", "approved", "active"].includes(normalized)) return "success";
  if (["pending", "pending_review", "draft"].includes(normalized)) return "warning";
  if (["rejected", "inactive", "locked", "hidden"].includes(normalized)) return "danger";
  return "slate";
}

export function getRoleBadgeVariant(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "danger";
  if (normalized === "instructor") return "indigo";
  return "success";
}

export function formatDuration(value?: string | number) {
  if (typeof value === "number") return `${value} phút`;
  return value || "Đang cập nhật";
}

export function getRoleHome(role?: string) {
  return getMappedRoleHome(role);
}
