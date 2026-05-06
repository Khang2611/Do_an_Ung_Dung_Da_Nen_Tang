/**
 * Auth Service — Xử lý đăng nhập, đăng ký, lưu JWT token an toàn.
 *
 * Token được lưu trong expo-secure-store (mã hóa trên device),
 * fallback sang AsyncStorage cho web.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { API_BASE_URL } from "./api";

// ─── Constants ───────────────────────────────────────────────────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface AuthUser {
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ─── Secure Storage helpers ──────────────────────────────────────────────────
// Sử dụng SecureStore trên native, AsyncStorage trên web
let SecureStore: typeof import("expo-secure-store") | null = null;

async function loadSecureStore() {
  if (Platform.OS !== "web" && !SecureStore) {
    try {
      SecureStore = await import("expo-secure-store");
    } catch {
      // Nếu chưa cài expo-secure-store, fallback sang AsyncStorage
      SecureStore = null;
    }
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  await loadSecureStore();
  if (SecureStore && Platform.OS !== "web") {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  await loadSecureStore();
  if (SecureStore && Platform.OS !== "web") {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function secureDelete(key: string): Promise<void> {
  await loadSecureStore();
  if (SecureStore && Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

// ─── API calls ───────────────────────────────────────────────────────────────

/** Đăng nhập và lưu token. */
export async function login(payload: LoginPayload): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || "Đăng nhập thất bại");
  }

  const data: ApiResponse<AuthUser> = await res.json();
  const user = data.result;

  // Lưu token và thông tin user an toàn
  await secureSet(TOKEN_KEY, user.accessToken);
  await secureSet(USER_KEY, JSON.stringify(user));

  return user;
}

/** Đăng ký tài khoản mới. */
export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || "Đăng ký thất bại");
  }
}

/** Lấy token đã lưu. */
export async function getStoredToken(): Promise<string | null> {
  return secureGet(TOKEN_KEY);
}

/** Lấy thông tin user đã lưu. */
export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await secureGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Xóa toàn bộ dữ liệu auth (logout). */
export async function clearAuth(): Promise<void> {
  await secureDelete(TOKEN_KEY);
  await secureDelete(USER_KEY);
}
