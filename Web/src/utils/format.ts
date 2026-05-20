export function formatCurrency(value?: number) {
  if (!value) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function normalizeRole(role?: string) {
  const value = String(role || "student").replace("ROLE_", "").toLowerCase();
  if (value === "user") return "student";
  if (value === "teacher") return "instructor";
  return value;
}

export function formatRole(role?: string) {
  const normalized = normalizeRole(role);
  const map: Record<string, string> = {
    student: "Người học",
    instructor: "Giảng viên",
    admin: "Quản trị viên",
  };
  return map[normalized] || role || "Người học";
}

export function formatStatus(status?: string) {
  const normalized = String(status || "").toLowerCase();
  const map: Record<string, string> = {
    published: "Đã xuất bản",
    pending: "Chờ duyệt",
    draft: "Bản nháp",
    approved: "Đã duyệt",
    rejected: "Từ chối",
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
  if (["pending", "draft"].includes(normalized)) return "warning";
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
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/admin";
  if (normalized === "instructor") return "/instructor";
  return "/student";
}
