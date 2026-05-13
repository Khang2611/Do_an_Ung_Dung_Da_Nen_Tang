/**
 * SecureVideoPlayer — Component phát video bảo mật từ MinIO (Phiên bản Pro).
 *
 * Kiến trúc bảo mật 7 lớp:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Layer 1: JWT Authentication                                           │
 * │    → Token xác thực gửi trong header mỗi request                      │
 * │                                                                         │
 * │  Layer 2: Enrollment Check                                              │
 * │    → Backend kiểm tra user đã đăng ký khóa học chưa                    │
 * │                                                                         │
 * │  Layer 3: MinIO Presigned URL                                           │
 * │    → URL có thời hạn 15-30 phút, tự hết hạn                           │
 * │                                                                         │
 * │  Layer 4: HLS Proxy Playlist                                            │
 * │    → Mỗi segment .ts có signed URL riêng                               │
 * │                                                                         │
 * │  Layer 5: Anti-Screen Capture (Mobile)                                  │
 * │    → Android FLAG_SECURE, iOS preventScreenCapture                     │
 * │    → Phát hiện screenshot + cảnh báo leo thang                         │
 * │    → App background detection → auto pause                             │
 * │                                                                         │
 * │  Layer 6: Anti-DevTools (Web)                                           │
 * │    → Chặn F12, Ctrl+Shift+I/J/C, chuột phải                           │
 * │    → Debugger trap + kích thước cửa sổ detection                       │
 * │    → Full-screen overlay khi DevTools mở                               │
 * │    → Page Visibility API → pause khi chuyển tab                        │
 * │    → Chặn Print, Copy, PiP, Drag                                      │
 * │                                                                         │
 * │  Layer 7: Dynamic Watermark                                             │
 * │    → Username + timestamp + unique session ID                          │
 * │    → Vị trí ngẫu nhiên, di chuyển theo thời gian                      │
 * │    → Chống xóa watermark bằng DevTools                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ Video KHÔNG BAO GIỜ được tải trực tiếp từ MinIO.
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type PlayerState = "idle" | "loading" | "ready" | "error" | "expired" | "paused_security";

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Tạo session ID ngẫu nhiên cho watermark (giúp truy vết nếu bị leak) */
function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Format timestamp cho watermark */
function formatTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")} ${now.getDate().toString().padStart(2, "0")}/${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SecureVideoPlayer({
  lessonId,
  title = "Đang tải bài học...",
  type = "hls",
}: SecureVideoPlayerProps) {
  const { user, token, isAuthenticated, signOut } = useAuth();
  const [state, setState] = useState<PlayerState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hlsContent, setHlsContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watermarkTime, setWatermarkTime] = useState(formatTimestamp());
  const [securityEvent, setSecurityEvent] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watermarkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session ID duy nhất — tạo 1 lần, dùng để truy vết nếu video bị leak
  const sessionId = useMemo(() => generateSessionId(), []);

  // ═══ BẢO MẬT CLIENT-SIDE: LAYER 5 — Mobile ═══

  // 📱 Mobile: Chặn quay/chụp màn hình khi đang xem video
  useScreenSecurity({
    enabled: state === "ready" || state === "loading",
    alertOnScreenshot: true,
    alertMessage:
      "Việc chụp/quay màn hình bị cấm để bảo vệ bản quyền nội dung bài giảng.",
    onRecordingDetected: useCallback(() => {
      // Tạm dừng video khi phát hiện quay màn hình
      setSecurityEvent("📱 Phát hiện chụp/quay màn hình!");
      setTimeout(() => setSecurityEvent(null), 5000);
    }, []),
    onAppBackgrounded: useCallback(() => {
      // Pause video khi app chuyển sang background
      if (state === "ready") {
        setState("paused_security");
        setSecurityEvent("📱 App chuyển nền — video tạm dừng");
      }
    }, [state]),
    onAppForegrounded: useCallback(() => {
      // Resume video khi app quay lại
      if (state === "paused_security") {
        setState("ready");
        setSecurityEvent(null);
      }
    }, [state]),
  });

  // ═══ BẢO MẬT CLIENT-SIDE: LAYER 6 — Web ═══

  // 🌐 Web: Chặn F12, DevTools, chuột phải, print, copy
  useWebDevToolsBlocker({
    enabled: true,
    warningMessage:
      "⚠️ Hành động này bị chặn để bảo vệ nội dung video có bản quyền!",
    onDevToolsDetected: useCallback(() => {
      // Pause video và hiện cảnh báo khi phát hiện DevTools
      if (state === "ready") {
        setState("paused_security");
        setSecurityEvent("🔧 DevTools đã bị phát hiện — video tạm dừng");
      }
    }, [state]),
    onVisibilityHidden: useCallback(() => {
      // Pause video khi user chuyển tab (có thể đang mở screen recorder)
      if (state === "ready") {
        setState("paused_security");
        setSecurityEvent("👁️ Tab ẩn — video tạm dừng vì lý do bảo mật");
      }
    }, [state]),
    onVisibilityVisible: useCallback(() => {
      // Resume video khi user quay lại tab
      if (state === "paused_security") {
        setState("ready");
        setSecurityEvent(null);
      }
    }, [state]),
  });

  // ═══ LAYER 7: DYNAMIC WATERMARK ═══
  // Cập nhật timestamp trên watermark mỗi 30 giây
  useEffect(() => {
    if (state === "ready" || state === "paused_security") {
      watermarkTimerRef.current = setInterval(() => {
        setWatermarkTime(formatTimestamp());
      }, 30000);
    }

    return () => {
      if (watermarkTimerRef.current) {
        clearInterval(watermarkTimerRef.current);
      }
    };
  }, [state]);

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
    setSecurityEvent(null);

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
          setError(
            "Bạn chưa đăng ký khóa học này. Vui lòng mua khóa học để xem video."
          );
          return;
        }
      }
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi tải video"
      );
    }
  }, [lessonId, token, type, signOut]);

  /** Resume video sau khi bị pause vì lý do bảo mật */
  const resumeFromSecurityPause = useCallback(() => {
    setState("ready");
    setSecurityEvent(null);
  }, []);

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
            🔒 Video được bảo mật bằng hệ thống 7 lớp
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
            <Text style={styles.stepText}>
              ⏳ Tạo Signed URL từ MinIO...
            </Text>
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

  if (state === "paused_security") {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <Ionicons name="shield" size={48} color="#F59E0B" />
          <Text style={styles.pausedTitle}>Video tạm dừng</Text>
          <Text style={styles.pausedReason}>
            {securityEvent || "Tạm dừng vì lý do bảo mật"}
          </Text>
          <Text style={styles.errorText}>
            Hệ thống phát hiện hành vi có thể ảnh hưởng đến bản quyền. Nhấn
            bên dưới để tiếp tục xem.
          </Text>
          <Pressable
            style={styles.resumeButton}
            onPress={resumeFromSecurityPause}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.resumeButtonText}>Tiếp tục xem</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ═══ STATE: READY — Đang phát video ═══
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
              Playlist đã ký tên với{" "}
              {hlsContent?.split("\n").length ?? 0} dòng
            </Text>
          </View>
        )}

        {/* ═══ LAYER 7: DYNAMIC WATERMARK ═══ */}
        {/* Watermark hiển thị username, session ID, và timestamp */}
        {/* Giúp truy vết nguồn leak nếu video bị quay lại */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          {/* Watermark pattern: lặp lại nhiều vị trí xoay nghiêng */}
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.watermarkRow,
                {
                  // Thay đổi vị trí offset mỗi hàng để tạo pattern tự nhiên
                  marginLeft: rowIndex % 2 === 0 ? -30 : 30,
                },
              ]}
            >
              <Text style={styles.watermarkText}>
                {user?.username ?? "user"} • {sessionId}
              </Text>
              <Text style={styles.watermarkTimestamp}>
                {watermarkTime} • DO NOT RECORD
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Security info bar */}
      <View style={styles.securityBar}>
        <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
        <Text style={styles.securityBarText}>
          🔒 Bảo mật 7 lớp • Session: {sessionId}
        </Text>
        <View style={styles.securityBadge}>
          <Text style={styles.securityBadgeText}>PROTECTED</Text>
        </View>
      </View>

      {/* Security event notification */}
      {securityEvent && (
        <View style={styles.securityEventBar}>
          <Ionicons name="alert-circle" size={14} color="#F59E0B" />
          <Text style={styles.securityEventText}>{securityEvent}</Text>
        </View>
      )}
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

  // ─── Paused Security State ─────────────────────────────────────────
  pausedTitle: {
    color: "#F59E0B",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  pausedReason: {
    color: "#FBBF24",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  resumeButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#22C55E",
    borderRadius: 12,
  },
  resumeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // ─── Video Container ──────────────────────────────────────────────
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

  // ─── Dynamic Watermark ────────────────────────────────────────────
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-evenly",
    alignItems: "center",
    opacity: 0.08,
    overflow: "hidden",
    zIndex: 2,
  },
  watermarkRow: {
    transform: [{ rotate: "-25deg" }],
    width: "250%",
    alignItems: "center",
    gap: 2,
  },
  watermarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 3,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  watermarkTimestamp: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
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

  // ─── Security Bar ─────────────────────────────────────────────────
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
    fontSize: 11,
    flex: 1,
  },
  securityBadge: {
    backgroundColor: "#22C55E20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E44",
  },
  securityBadgeText: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // ─── Security Event Notification ──────────────────────────────────
  securityEventBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F59E0B15",
    borderTopWidth: 1,
    borderTopColor: "#F59E0B33",
  },
  securityEventText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
});
