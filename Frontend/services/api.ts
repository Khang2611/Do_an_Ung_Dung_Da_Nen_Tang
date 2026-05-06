/**
 * Cấu hình API gốc và fetch wrapper có gắn JWT token.
 *
 * Đổi API_BASE_URL khi deploy production.
 */
import { Platform } from "react-native";

// Android emulator dùng 10.0.2.2, iOS simulator và web dùng localhost
const getBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
};

export const API_BASE_URL = getBaseUrl();

/**
 * Gửi fetch request có gắn JWT token tự động.
 * Nếu token hết hạn (401), ném lỗi để AuthContext xử lý logout.
 */
export async function authFetch(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new AuthExpiredError("Token đã hết hạn. Vui lòng đăng nhập lại.");
  }

  return response;
}

/** Lỗi xác thực hết hạn — AuthContext sẽ bắt và logout. */
export class AuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthExpiredError";
  }
}
