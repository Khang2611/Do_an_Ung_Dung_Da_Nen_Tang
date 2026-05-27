import { API_BASE_URL } from "../api/axiosClient";
import type { AuthUser } from "../types/auth";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";

export function getAvatarUrl(user?: Pick<AuthUser, "id" | "userId" | "avatar"> | null) {
  if (!user?.avatar) return DEFAULT_AVATAR;
  if (/^(https?:|data:|blob:)/i.test(user.avatar)) return user.avatar;

  const id = user.userId ?? user.id;
  if (!id) return DEFAULT_AVATAR;

  return `${API_BASE_URL}/api/users/${id}/avatar?v=${encodeURIComponent(user.avatar)}`;
}
