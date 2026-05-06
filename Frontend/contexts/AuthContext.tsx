/**
 * AuthContext — Quản lý trạng thái xác thực toàn ứng dụng.
 *
 * Cung cấp:
 * - user: thông tin user đang đăng nhập
 * - token: JWT token hiện tại
 * - isLoading: đang kiểm tra token đã lưu
 * - signIn / signOut: hàm đăng nhập / đăng xuất
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import type { AuthUser, LoginPayload } from "../services/authService";
import {
  login as apiLogin,
  clearAuth,
  getStoredToken,
  getStoredUser,
} from "../services/authService";

// ─── Context Type ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session đã lưu khi mở app
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getStoredToken(),
          getStoredUser(),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (err) {
        console.warn("Không thể khôi phục phiên đăng nhập:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const authUser = await apiLogin(payload);
    setUser(authUser);
    setToken(authUser.accessToken);
    return authUser;
  }, []);

  const signOut = useCallback(async () => {
    await clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return context;
}
