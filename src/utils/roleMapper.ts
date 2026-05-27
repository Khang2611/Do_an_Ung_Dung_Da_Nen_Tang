import type { BackendRole, FrontendRole } from "../types/auth";

export type WritableBackendRole = "USER" | "TEACHER" | "ADMIN";

export function toBackendRole(role?: string): WritableBackendRole {
  const normalized = toFrontendRole(role);
  if (normalized === "admin") return "ADMIN";
  if (normalized === "instructor") return "TEACHER";
  return "USER";
}

export function toFrontendRole(role?: string): FrontendRole {
  const value = String(role || "student").replace("ROLE_", "").trim().toUpperCase() as BackendRole | string;
  if (value === "ADMIN") return "admin";
  if (value === "TEACHER" || value === "INSTRUCTOR") return "instructor";
  return "student";
}

export function formatRoleLabel(role?: string) {
  const labels: Record<FrontendRole, string> = {
    student: "Người học",
    instructor: "Giảng viên",
    admin: "Quản trị viên",
  };
  return labels[toFrontendRole(role)];
}

export function getRoleHome(role?: string) {
  const normalized = toFrontendRole(role);
  if (normalized === "admin") return "/admin/dashboard";
  if (normalized === "instructor") return "/instructor/courses";
  return "/courses";
}
