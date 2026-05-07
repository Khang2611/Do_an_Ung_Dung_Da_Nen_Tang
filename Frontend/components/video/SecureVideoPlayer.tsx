/**
 * SecureVideoPlayer — Component phát video bảo mật từ MinIO.
 *
 * Luồng bảo mật hoàn chỉnh:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  User bấm Play                                                 │
 * │       ↓                                                        │
 * │  Frontend gửi JWT token → Backend                              │
 * │       ↓                                                        │
 * │  Backend kiểm tra JWT + Enrollment                             │
 * │       ↓                                                        │
 * │  Backend tạo Presigned URL từ MinIO (hết hạn sau 15-30 phút)  │
 * │       ↓                                                        │
 * │  Frontend nhận URL đã ký → Phát video                          │
 * │       ↓                                                        │
 * │  URL hết hạn → Phải gọi lại API để lấy URL mới                │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ Video KHÔNG BAO GIỜ được tải trực tiếp từ MinIO.
 *
 * Bảo mật Client-side:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  📱 Mobile: Chặn quay/chụp màn hình (FLAG_SECURE / iOS API)   │
 * │  🌐 Web: Chặn F12, Ctrl+Shift+I, chuột phải, kéo thả, copy   │
 * └─────────────────────────────────────────────────────────────────┘
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { useScreenSecurity } from "../../hooks/useScreenSecurity";
import { useWebDevToolsBlocker } from "../../hooks/useWebDevToolsBlocker";
import {
  getSignedVideoUrl,
  getHlsPlaylist,
  VideoAccessError,
} from "../../services/videoService";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SecureVideoPlayerProps {
  /** ID của bài học cần xem video */
  lessonId: number;
  /** Tiêu đề bài học (hiển thị trên player) */
  title?: string;
  /** Loại video: 'mp4' dùng Signed URL, 'hls' dùng proxy playlist */
  type?: "mp4" | "hls";
}

type PlayerState = "idle" | "loading" | "ready" | "error" | "expired";

// ─── Component ───────────────────────────────────────────────────────────────
export default function SecureVideoPlayer({
  lessonId,
  title = "Đang tải bài học...",
  type = "hls",
}: SecureVideoPlayerProps) {
  const { token, isAuthenticated, signOut } = useAuth();
  const [state, setState] = useState<PlayerState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hlsContent, setHlsContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ═══ BẢO MẬT CLIENT-SIDE ═══

  // 📱 Mobile: Chặn quay/chụp màn hình khi đang xem video
  useScreenSecurity({
    enabled: state === "ready" || state === "loading",
    alertOnScreenshot: true,
    alertMessage:
      "Việc chụp/quay màn hình bị cấm để bảo vệ bản quyền nội dung bài giảng.",
  });

  // 🌐 Web: Chặn F12, DevTools, chuột phải
  useWebDevToolsBlocker({
    enabled: true,
    warningMessage:
      "⚠️ Hành động này bị chặn để bảo vệ nội dung video có bản quyền!",
  });

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  /**
   * Tải video URL bảo mật từ backend.
   * Backend sẽ kiểm tra JWT + enrollment trước khi trả signed URL.
   */
  const loadSecureVideo = useCallback(async () => {
    if (!token) {
      setState("error");
      setError("Bạn cần đăng nhập để xem video.");
      return;
    }

    setState("loading");
    setError(null);

    try {
      if (type === "mp4") {
        // Lấy Presigned URL cho MP4
        const url = await getSignedVideoUrl(lessonId, token);
        setVideoUrl(url);
        setState("ready");

        // Tự động refresh trước khi URL hết hạn (14 phút)
        refreshTimerRef.current = setTimeout(() => {
          setState("expired");
        }, 14 * 60 * 1000);
      } else {
        // Lấy HLS Playlist đã ký
        const playlist = await getHlsPlaylist(lessonId, token);
        setHlsContent(playlist);
        setState("ready");

        // HLS segments hết hạn sau 30 phút, refresh sau 25 phút
        refreshTimerRef.current = setTimeout(() => {
          setState("expired");
        }, 25 * 60 * 1000);
      }
    } catch (err) {
      if (err instanceof VideoAccessError) {
        if (err.isTokenExpired) {
          setState("error");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          // Tự động logout
          signOut();
          return;
        }
        if (err.isNotEnrolled) {
          setState("error");
          setError("Bạn chưa đăng ký khóa học này. Vui lòng mua khóa học để xem video.");
          return;
        }
      }
      setState("error");
      setError(
        err instanceof Error ? err.message : "Lỗi không xác định khi tải video"
      );
    }
  }, [lessonId, token, type, signOut]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Ionicons name="lock-closed" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Yêu cầu đăng nhập</Text>
          <Text style={styles.errorText}>
            Bạn cần đăng nhập để xem video bài học.
          </Text>
        </View>
      </View>
    );
  }

  if (state === "idle") {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Ionicons name="shield-checkmark" size={32} color="#22C55E" />
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.playButton} onPress={loadSecureVideo}>
            <Ionicons name="play-circle" size={64} color="#3B82F6" />
          </Pressable>
          <Text style={styles.securityNote}>
            🔒 Video được bảo mật bằng Signed URL
          </Text>
        </View>
      </View>
    );
  }

  if (state === "loading") {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            Đang xác thực và tải video bảo mật...
          </Text>
          <View style={styles.securitySteps}>
            <Text style={styles.stepText}>✅ Kiểm tra JWT Token</Text>
            <Text style={styles.stepText}>✅ Xác nhận đăng ký khóa học</Text>
            <Text style={styles.stepText}>⏳ Tạo Signed URL từ MinIO...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Không thể phát video</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadSecureVideo}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (state === "expired") {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Ionicons name="time" size={48} color="#F59E0B" />
          <Text style={styles.errorTitle}>Link video đã hết hạn</Text>
          <Text style={styles.errorText}>
            Signed URL đã hết hạn để đảm bảo bảo mật. Nhấn để tải lại.
          </Text>
          <Pressable style={styles.refreshButton} onPress={loadSecureVideo}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.refreshButtonText}>Tải lại video</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // state === "ready"
  return (
    <View style={styles.container}>
      {/* Phần hiển thị video */}
      <View style={styles.videoContainer}>
        {type === "mp4" && videoUrl ? (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={40} color="#22C55E" />
            <Text style={styles.readyTitle}>Video đã sẵn sàng</Text>
            <Text style={styles.readySubtitle} numberOfLines={2}>
              URL: {videoUrl.substring(0, 60)}...
            </Text>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="film" size={40} color="#22C55E" />
            <Text style={styles.readyTitle}>HLS Stream đã sẵn sàng</Text>
            <Text style={styles.readySubtitle}>
              Playlist đã ký tên với {hlsContent?.split("\n").length ?? 0} dòng
            </Text>
          </View>
        )}

        {/* ═══ WATERMARK BẢO MẬT ═══ */}
        {/* Lớp Watermark ẩn dưới cùng/trên cùng để đánh dấu bản quyền và user đang xem */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.watermarkRow}>
              <Text style={styles.watermarkText}>
                {user?.username} • DO NOT RECORD
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Security info bar */}
      <View style={styles.securityBar}>
        <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
        <Text style={styles.securityBarText}>
          🔒 JWT + Enrollment + Signed URL + Chặn quay màn hình + Chặn DevTools
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  playButton: {
    marginTop: 8,
  },
  securityNote: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
  },
  loadingText: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 12,
  },
  securitySteps: {
    marginTop: 16,
    gap: 6,
  },
  stepText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  errorTitle: {
    color: "#F87171",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  errorText: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  refreshButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F59E0B",
    borderRadius: 12,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-evenly",
    alignItems: "center",
    opacity: 0.12,
    overflow: "hidden",
    zIndex: 2,
  },
  watermarkRow: {
    transform: [{ rotate: "-20deg" }],
    width: "200%",
    alignItems: "center",
  },
  watermarkText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  readyTitle: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "700",
  },
  readySubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  securityBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1E293B",
  },
  securityBarText: {
    color: "#94A3B8",
    fontSize: 12,
  },
});
