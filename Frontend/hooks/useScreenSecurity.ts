/**
 * useScreenSecurity — Hook chặn quay/chụp màn hình trên Mobile.
 *
 * Cơ chế hoạt động:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  Android: Sử dụng FLAG_SECURE trên Window                   │
 * │    → Khi user quay màn hình, video sẽ hiện khung ĐEN        │
 * │    → Khi user chụp ảnh, ảnh chụp sẽ bị ĐEN hoàn toàn       │
 * │                                                              │
 * │  iOS: Chặn screen recording & phát hiện screenshot           │
 * │    → Cảnh báo khi phát hiện hành vi chụp ảnh                 │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Sử dụng: Gọi hook này trong component xem video.
 * Khi component unmount (thoát khỏi video), sẽ tự động bỏ chặn.
 */
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

// Chỉ import trên native, không import trên web
let ScreenCapture: typeof import("expo-screen-capture") | null = null;

async function loadScreenCapture() {
  if (Platform.OS !== "web" && !ScreenCapture) {
    try {
      ScreenCapture = await import("expo-screen-capture");
    } catch {
      ScreenCapture = null;
    }
  }
}

interface UseScreenSecurityOptions {
  /** Bật/tắt chặn quay màn hình. Default: true */
  enabled?: boolean;
  /** Hiển thị cảnh báo khi phát hiện chụp ảnh màn hình (iOS). Default: true */
  alertOnScreenshot?: boolean;
  /** Tin nhắn cảnh báo */
  alertMessage?: string;
}

export function useScreenSecurity(options: UseScreenSecurityOptions = {}) {
  const {
    enabled = true,
    alertOnScreenshot = true,
    alertMessage = "Việc chụp/quay màn hình bị cấm để bảo vệ bản quyền nội dung bài giảng.",
  } = options;

  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    let isMounted = true;

    (async () => {
      await loadScreenCapture();
      if (!ScreenCapture || !isMounted) return;

      // ═══ CHẶN QUAY MÀN HÌNH ═══
      // Android: Thêm FLAG_SECURE vào Window → màn hình đen khi quay
      // iOS: Ngăn chặn screen recording
      try {
        await ScreenCapture.preventScreenCaptureAsync("video-protection");
        console.log("🔒 Đã kích hoạt chặn quay màn hình");
      } catch (err) {
        console.warn("⚠️ Không thể chặn quay màn hình:", err);
      }

      // ═══ PHÁT HIỆN CHỤP ẢNH MÀN HÌNH (iOS) ═══
      if (alertOnScreenshot) {
        try {
          subscriptionRef.current =
            ScreenCapture.addScreenshotListener(() => {
              Alert.alert(
                "⚠️ Cảnh báo bảo mật",
                alertMessage,
                [{ text: "Tôi hiểu", style: "cancel" }]
              );
              console.log("🚨 Phát hiện chụp ảnh màn hình!");
            });
        } catch (err) {
          console.warn("⚠️ Không thể theo dõi screenshot:", err);
        }
      }
    })();

    // ═══ CLEANUP: Bỏ chặn khi thoát khỏi video ═══
    return () => {
      isMounted = false;

      (async () => {
        await loadScreenCapture();
        if (!ScreenCapture) return;

        try {
          await ScreenCapture.allowScreenCaptureAsync("video-protection");
          console.log("🔓 Đã tắt chặn quay màn hình");
        } catch (err) {
          console.warn("⚠️ Lỗi khi tắt chặn:", err);
        }
      })();

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, alertOnScreenshot, alertMessage]);
}
