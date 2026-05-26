import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";
import { getRoleHome, normalizeRole } from "../utils/format";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<string>;
  register: (data: RegisterPayload) => Promise<void>;
  updateProfile: (data: { fullName?: string; email?: string; password?: string }) => Promise<void>;
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
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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
    localStorage.setItem("auth_token", result.token);
    if (result.refreshToken) localStorage.setItem("auth_refresh_token", result.refreshToken);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return getRoleHome(result.user.role);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    await authApi.register(data);
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string; email?: string; password?: string }) => {
    const updatedUser = await authApi.updateProfile(data);
    const nextUser = { ...user, ...updatedUser };
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, [user]);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("auth_refresh_token") || undefined;
    void authApi.logout(refreshToken);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
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
    logout,
  }), [user, token, isLoading, login, register, updateProfile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider.");
  return context;
}
