import type { UserRole } from "./auth";

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole | string;
  status: "active" | "locked" | "pending";
  createdAt: string;
}
