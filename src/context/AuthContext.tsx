import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";
import { getRoleHome, normalizeRole } from "../utils/format";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: ReturnType<typeof normalizeRole> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<string>;
  register: (data: RegisterPayload) => Promise<void>;
  updateProfile: (data: { fullName?: string; email?: string; avatar?: string; password?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        const normalizedUser = { ...parsed, role: normalizeRole(parsed.role) };
        setToken(storedToken);
        setUser(normalizedUser);
        localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);

    const onLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    const result = await authApi.login(data);
    const normalizedUser = { ...result.user, role: normalizeRole(result.user.role) };
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
    setToken(result.token);
    setUser(normalizedUser);
    return getRoleHome(normalizedUser.role);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    await authApi.register(data);
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string; email?: string; avatar?: string; password?: string }) => {
    const updated = await authApi.updateProfile(data);
    const normalizedUser = { ...user, ...updated, id: updated.id ?? updated.userId ?? user?.id, role: normalizeRole(updated.role || user?.role || "student") } as AuthUser;
    localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    const updated = await authApi.uploadAvatar(file);
    const normalizedUser = { ...user, ...updated, id: updated.id ?? updated.userId ?? user?.id, role: normalizeRole(updated.role || user?.role || "student") } as AuthUser;
    localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    role: user ? normalizeRole(user.role) : null,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    register,
    updateProfile,
    uploadAvatar,
    logout,
  }), [user, token, isLoading, login, register, updateProfile, uploadAvatar, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider.");
  return context;
}
