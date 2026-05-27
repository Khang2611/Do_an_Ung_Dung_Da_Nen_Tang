import type { UserRole } from "./auth";

export type UserStatus = "active" | "locked" | "pending" | "ACTIVE" | "LOCKED" | "PENDING";

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole | string;
  status: UserStatus | string;
  createdAt: string;
  avatar?: string;
  enrolledCourses?: number;
  teachingCourses?: number;
  recentActivities?: string[];
}
