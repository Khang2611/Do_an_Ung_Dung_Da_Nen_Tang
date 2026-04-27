export type RegisterRoleKey = "student" | "instructor";

export type RegisterRole = {
  key: RegisterRoleKey;
  title: string;
  description: string;
  accent: string;
  fill: string;
  icon: string;
};

export const REGISTER_ROLES: RegisterRole[] = [
  {
    key: "student",
    title: "Người học",
    description: "Đăng ký khóa học & học tập",
    accent: "#2563EB",
    fill: "#EAF2FF",
    icon: "school-outline",
  },
  {
    key: "instructor",
    title: "Giảng viên",
    description: "Tạo & quản lý khóa học",
    accent: "#7C3AED",
    fill: "#F3E8FF",
    icon: "reader-outline",
  },
];
