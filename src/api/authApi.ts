import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { AUTH_LOGIN, AUTH_ME, AUTH_REGISTER } from "./endpoints";
import { mockLogin, mockRegister } from "../data/mockData";
import type { AuthUser, LoginPayload, LoginResult, RegisterPayload } from "../types/auth";
import { toApiRole, toFrontendRole } from "../utils/format";

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

function findRole(user: any, raw: any): string {
  const authority =
    user?.authorities?.[0]?.authority ||
    raw?.authorities?.[0]?.authority ||
    raw?.data?.authorities?.[0]?.authority ||
    raw?.result?.authorities?.[0]?.authority;

  return toFrontendRole(String(user?.role || raw?.role || raw?.data?.role || raw?.result?.role || authority || "student"));
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
    ...userSource,
    id: userSource?.id ?? userSource?.userId ?? raw?.id ?? raw?.userId,
    username: userSource?.username || userSource?.email || raw?.username || raw?.email || "user",
    email: userSource?.email || raw?.email,
    fullName: userSource?.fullName || userSource?.name || raw?.fullName || raw?.name || userSource?.username,
    role: findRole(userSource, rawResponse),
    accessToken: token,
  };

  return { user, token };
}

export async function login(data: LoginPayload): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(data);
  const response = await axiosClient.post(AUTH_LOGIN, data);
  return normalizeLoginResponse(response.data);
}

export async function register(data: RegisterPayload) {
  if (USE_MOCK) return mockRegister(data);
  const response = await axiosClient.post(AUTH_REGISTER, { ...data, role: toApiRole(data.role || "student") });
  return unwrap(response);
}

export async function getMe(): Promise<AuthUser> {
  if (USE_MOCK) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) throw new Error("Chưa đăng nhập.");
    return JSON.parse(raw) as AuthUser;
  }
  const response = await axiosClient.get(AUTH_ME);
  return unwrap<AuthUser>(response);
}

export async function updateProfile(data: { fullName?: string; email?: string; avatar?: string; password?: string }): Promise<AuthUser> {
  if (USE_MOCK) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) throw new Error("Chưa đăng nhập.");
    const user = { ...JSON.parse(raw), ...data };
    localStorage.setItem("auth_user", JSON.stringify(user));
    return user as AuthUser;
  }
  const response = await axiosClient.put("/api/users/me", data);
  return unwrap<AuthUser>(response);
}

export async function uploadAvatar(file: File): Promise<AuthUser> {
  if (USE_MOCK) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) throw new Error("Chưa đăng nhập.");
    const user = { ...JSON.parse(raw), avatar: URL.createObjectURL(file) };
    localStorage.setItem("auth_user", JSON.stringify(user));
    return user as AuthUser;
  }

  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post("/api/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap<AuthUser>(response);
}
