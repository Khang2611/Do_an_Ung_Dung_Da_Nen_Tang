import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { AUTH_LOGIN, AUTH_ME, AUTH_REGISTER } from "./endpoints";
import { mockLogin, mockRegister } from "../data/mockData";
import type { AuthUser, LoginPayload, LoginResult, RegisterPayload } from "../types/auth";

function findToken(raw: any): string {
  return raw?.token || raw?.accessToken || raw?.access_token || raw?.jwt || "";
}

function firstToken(...items: any[]) {
  for (const item of items) {
    const token = findToken(item);
    if (token) return token;
  }
  return "";
}

function findRefreshToken(raw: any): string {
  return raw?.refreshToken || raw?.refresh_token || raw?.data?.refreshToken || raw?.result?.refreshToken || "";
}

function findRole(user: any, raw: any): string {
  const authority =
    user?.authorities?.[0]?.authority ||
    raw?.authorities?.[0]?.authority ||
    raw?.data?.authorities?.[0]?.authority ||
    raw?.result?.authorities?.[0]?.authority;

  return String(user?.role || raw?.role || raw?.data?.role || raw?.result?.role || authority || "student").replace("ROLE_", "");
}

function normalizeAuthUser(raw: any): AuthUser {
  return {
    ...raw,
    id: raw?.id ?? raw?.userId,
    username: raw?.username || raw?.email || "user",
    email: raw?.email || "",
    fullName: raw?.fullName || raw?.name || raw?.username,
    role: findRole(raw, raw),
    status: raw?.status || "active",
  };
}

export function normalizeLoginResponse(rawResponse: any): LoginResult {
  const raw = rawResponse?.result ?? rawResponse?.data ?? rawResponse;
  const userSource =
    rawResponse?.user ||
    rawResponse?.account ||
    rawResponse?.data?.user ||
    rawResponse?.data?.account ||
    rawResponse?.result?.user ||
    rawResponse?.result?.account ||
    raw?.user ||
    raw?.account ||
    raw;

  const token = firstToken(rawResponse, rawResponse?.data, rawResponse?.result, raw, userSource);
  if (!token) throw new Error("Backend không trả về token đăng nhập.");

  const user: AuthUser = {
    ...normalizeAuthUser(userSource),
    accessToken: token,
    refreshToken: findRefreshToken(rawResponse),
  };

  return { user, token, refreshToken: user.refreshToken };
}

export async function login(data: LoginPayload): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(data);
  const response = await axiosClient.post(AUTH_LOGIN, data);
  return normalizeLoginResponse(response.data);
}

export async function register(data: RegisterPayload) {
  if (USE_MOCK) return mockRegister(data);
  const response = await axiosClient.post(AUTH_REGISTER, data);
  return unwrap(response);
}

export async function getMe(): Promise<AuthUser> {
  if (USE_MOCK) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) throw new Error("Chưa đăng nhập.");
    return JSON.parse(raw) as AuthUser;
  }
  const response = await axiosClient.get(AUTH_ME);
  return normalizeAuthUser(unwrap<any>(response));
}

export async function updateProfile(data: { fullName?: string; email?: string; password?: string }): Promise<AuthUser> {
  if (USE_MOCK) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) throw new Error("Chưa đăng nhập.");
    const user = { ...JSON.parse(raw), ...data };
    localStorage.setItem("auth_user", JSON.stringify(user));
    return user as AuthUser;
  }
  const response = await axiosClient.put("/api/users/me", data);
  return normalizeAuthUser(unwrap<any>(response));
}

export async function logout(refreshToken?: string) {
  if (USE_MOCK) return;
  if (!refreshToken) return;
  await axiosClient.post("/api/auth/logout", { refreshToken });
}
