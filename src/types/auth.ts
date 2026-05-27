export type FrontendRole = "student" | "instructor" | "admin";
export type BackendRole = "STUDENT" | "TEACHER" | "INSTRUCTOR" | "ADMIN" | "USER";
export type ApiRole = BackendRole;
export type UserRole = FrontendRole | BackendRole;

export interface AuthUser {
  id?: string | number;
  userId?: string | number;
  fullName?: string;
  name?: string;
  email?: string;
  username: string;
  role: UserRole | string;
  accessToken?: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  avatar?: string;
  createdAt?: string;
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
  role?: FrontendRole | ApiRole;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}
