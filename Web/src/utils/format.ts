export function formatCurrency(value: number) {
  if (!value) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function normalizeRole(role?: string) {
  const value = String(role || "student").replace("ROLE_", "").toLowerCase();
  if (value === "user") return "student";
  if (value === "teacher") return "instructor";
  return value;
}

export function getRoleHome(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/admin";
  if (normalized === "instructor") return "/instructor";
  return "/student";
}
