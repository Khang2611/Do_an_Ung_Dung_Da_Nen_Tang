import type { LoginRoleConfig, LoginRoleKey } from "./types";

export const LOGIN_ROLE_ORDER: LoginRoleKey[] = [
  "student",
  "instructor",
  "admin",
];

export const LOGIN_ROLES: Record<LoginRoleKey, LoginRoleConfig> = {
  student: {
    key: "student",
    label: "Học sinh",
    accent: "#2563EB",
    fill: "#EAF2FF",
    icon: "school-outline",
    demoEmail: "student@engpro.vn",
    demoPassword: "123456",
    buttonGradient: ["#356BFF", "#1E48E5"],
    brandGradient: ["#4F7CFF", "#2C4AF1"],
    portalTitle: "Cổng học sinh",
    portalDescription: "Theo dõi lớp học, bài tập và tiến độ học tập hằng ngày.",
    noteTitle: "JWT cho học sinh",
    noteText:
      "Token gắn role student để gọi các API học tập, lịch học và bài nộp.",
  },
  instructor: {
    key: "instructor",
    label: "Giảng viên",
    accent: "#7C3AED",
    fill: "#F3E8FF",
    icon: "reader-outline",
    demoEmail: "instructor@engpro.vn",
    demoPassword: "123456",
    buttonGradient: ["#9155FF", "#6D28D9"],
    brandGradient: ["#A67CFF", "#7C3AED"],
    portalTitle: "Cổng giảng viên",
    portalDescription: "Quản lý lớp dạy, điểm danh, bài giảng và phản hồi học viên.",
    noteTitle: "JWT cho giảng viên",
    noteText:
      "Token gắn role instructor để truy cập dashboard lớp học và nghiệp vụ giảng dạy.",
  },
  admin: {
    key: "admin",
    label: "Admin",
    accent: "#DC2626",
    fill: "#FEECEC",
    icon: "shield-checkmark-outline",
    demoEmail: "admin@engpro.vn",
    demoPassword: "123456",
    buttonGradient: ["#FF6B6B", "#DC2626"],
    brandGradient: ["#FF8A8A", "#DC2626"],
    portalTitle: "Cổng quản trị",
    portalDescription: "Kiểm soát người dùng, phân quyền và theo dõi sức khỏe hệ thống.",
    noteTitle: "JWT cho admin",
    noteText:
      "Token gắn role admin để gọi các API quản trị, phân quyền và kiểm soát dữ liệu.",
  },
};
