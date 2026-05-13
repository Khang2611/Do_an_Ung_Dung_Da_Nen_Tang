export type UserRole = "student" | "instructor" | "admin" | "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface AuthUser {
  id?: string | number;
  fullName?: string;
  name?: string;
  email?: string;
  username: string;
  role: UserRole | string;
  accessToken?: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role?: "student" | "instructor";
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}
