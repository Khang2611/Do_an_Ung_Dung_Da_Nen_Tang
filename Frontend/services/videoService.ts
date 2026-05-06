/**
 * Video Service — Bảo mật MinIO ở tầng Frontend.
 *
 * Luồng bảo mật:
 * 1. Frontend gửi JWT token → Backend xác thực user
 * 2. Backend kiểm tra enrollment (user có đăng ký khóa học chưa)
 * 3. Backend tạo Presigned URL có thời hạn từ MinIO
 * 4. Frontend nhận URL đã ký → phát video (URL tự hết hạn)
 *
 * ⚠️ Frontend KHÔNG BAO GIỜ truy cập trực tiếp MinIO.
 *    Mọi request đều qua Backend proxy.
 */
import { authFetch } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface SignedUrlResponse {
  url: string;
  expiresIn: number; // seconds
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Lấy Signed URL cho video MP4 đơn lẻ.
 *
 * @param lessonId - ID bài học
 * @param token    - JWT token người dùng
 * @returns Signed URL có thời hạn 15 phút
 */
export async function getSignedVideoUrl(
  lessonId: number,
  token: string
): Promise<string> {
  const res = await authFetch(`/api/videos/signed-url/${lessonId}`, token);

  if (!res.ok) {
    const errorText = await res.text();
    throw new VideoAccessError(
      `Không thể lấy link video: ${errorText}`,
      res.status
    );
  }

  // Backend trả về plain text URL
  return res.text();
}

/**
 * Lấy HLS Playlist đã được ký tên (proxy).
 * Mỗi segment .ts trong playlist đều có signed URL riêng.
 *
 * @param lessonId - ID bài học
 * @param token    - JWT token người dùng
 * @returns Nội dung playlist m3u8 đã được ký
 */
export async function getHlsPlaylist(
  lessonId: number,
  token: string
): Promise<string> {
  const res = await authFetch(
    `/api/videos/stream/${lessonId}/playlist.m3u8`,
    token,
    {
      headers: {
        Accept: "application/x-mpegURL",
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new VideoAccessError(
      `Không thể tải playlist HLS: ${errorText}`,
      res.status
    );
  }

  return res.text();
}

/**
 * Tạo URI cho HLS playlist có kèm JWT (dùng cho native video player).
 * Player sẽ gọi trực tiếp URL này, backend sẽ xác thực qua header.
 */
export function getHlsStreamUri(lessonId: number): string {
  // Trả về endpoint, token sẽ được gắn trong header bởi custom loader
  return `/api/videos/stream/${lessonId}/playlist.m3u8`;
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class VideoAccessError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "VideoAccessError";
    this.statusCode = statusCode;
  }

  /** User chưa enroll khóa học */
  get isNotEnrolled(): boolean {
    return this.statusCode === 403;
  }

  /** Token hết hạn */
  get isTokenExpired(): boolean {
    return this.statusCode === 401;
  }
}
