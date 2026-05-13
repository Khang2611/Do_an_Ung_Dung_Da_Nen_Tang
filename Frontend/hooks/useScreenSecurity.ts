/**
 * useScreenSecurity — Hook chặn quay/chụp màn hình trên Mobile (Nâng cấp chuyên nghiệp).
 *
 * Cơ chế hoạt động:
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  Layer 1: FLAG_SECURE (Android)                                     │
 * │    → Khi user quay màn hình, video hiện khung ĐEN                  │
 * │    → Khi user chụp ảnh, ảnh chụp sẽ bị ĐEN hoàn toàn              │
 * │                                                                      │
 * │  Layer 2: Screen Recording Detection (iOS)                           │
 * │    → Phát hiện screen recording → tạm dừng video + cảnh báo        │
 * │                                                                      │
 * │  Layer 3: Screenshot Listener                                        │
 * │    → Cảnh báo khi phát hiện hành vi chụp ảnh                        │
 * │                                                                      │
 * │  Layer 4: App State Detection                                        │
 * │    → Phát hiện app bị chuyển sang nền → callback để pause video     │
 * │                                                                      │
 * │  Layer 5: Re-activation trên focus                                   │
 * │    → Khi app quay lại foreground, kích hoạt lại bảo mật            │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Sử dụng: Gọi hook này trong component xem video.
 * Khi component unmount (thoát khỏi video), sẽ tự động bỏ chặn.
 */
import { useEffect, useRef, useCallback } from "react";
import { Alert, AppState, Platform } from "react-native";
import type { AppStateStatus } from "react-native";

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
  /** Tin nhắn cảnh báo screenshot */
  alertMessage?: string;
  /** Callback khi phát hiện hành vi ghi hình → dùng để pause video */
  onRecordingDetected?: () => void;
  /** Callback khi app bị chuyển sang background → dùng để pause video */
  onAppBackgrounded?: () => void;
  /** Callback khi app quay lại foreground */
  onAppForegrounded?: () => void;
}

export function useScreenSecurity(options: UseScreenSecurityOptions = {}) {
  const {
    enabled = true,
    alertOnScreenshot = true,
    alertMessage = "Việc chụp/quay màn hình bị cấm để bảo vệ bản quyền nội dung bài giảng.",
    onRecordingDetected,
    onAppBackgrounded,
    onAppForegrounded,
  } = options;

  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const screenshotCountRef = useRef(0);

  // ═══ KÍCH HOẠT LẠI BẢO MẬT (dùng khi app quay lại foreground) ═══
  const reactivateProtection = useCallback(async () => {
    await loadScreenCapture();
    if (!ScreenCapture) return;

    try {
      // Bỏ chặn rồi chặn lại để đảm bảo FLAG_SECURE vẫn active
      await ScreenCapture.allowScreenCaptureAsync("video-protection");
      await ScreenCapture.preventScreenCaptureAsync("video-protection");
      console.log("🔒 Đã kích hoạt lại chặn quay màn hình");
    } catch (err) {
      console.warn("⚠️ Không thể kích hoạt lại chặn quay màn hình:", err);
    }
  }, []);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    let isMounted = true;

    (async () => {
      await loadScreenCapture();
      if (!ScreenCapture || !isMounted) return;

      // ═══ LAYER 1: CHẶN QUAY MÀN HÌNH ═══
      // Android: Thêm FLAG_SECURE vào Window → màn hình đen khi quay
      // iOS: Ngăn chặn screen recording
      try {
        await ScreenCapture.preventScreenCaptureAsync("video-protection");
        console.log("🔒 Đã kích hoạt chặn quay màn hình");
      } catch (err) {
        console.warn("⚠️ Không thể chặn quay màn hình:", err);
      }

      // ═══ LAYER 2: PHÁT HIỆN CHỤP ẢNH MÀN HÌNH ═══
      if (alertOnScreenshot) {
        try {
          subscriptionRef.current =
            ScreenCapture.addScreenshotListener(() => {
              screenshotCountRef.current += 1;

              // Cảnh báo mức độ tăng dần
              if (screenshotCountRef.current >= 3) {
                Alert.alert(
                  "🚨 Cảnh báo nghiêm trọng",
                  "Bạn đã chụp màn hình nhiều lần. Hành vi này vi phạm điều khoản sử dụng và có thể dẫn đến khóa tài khoản.",
                  [{ text: "Tôi hiểu", style: "destructive" }]
                );
              } else {
                Alert.alert(
                  "⚠️ Cảnh báo bảo mật",
                  alertMessage,
                  [{ text: "Tôi hiểu", style: "cancel" }]
                );
              }

              // Gọi callback để tạm dừng video
              onRecordingDetected?.();

              console.log(
                `🚨 Phát hiện chụp ảnh màn hình! (lần ${screenshotCountRef.current})`
              );
            });
        } catch (err) {
          console.warn("⚠️ Không thể theo dõi screenshot:", err);
        }
      }
    })();

    // ═══ LAYER 3: PHÁT HIỆN APP BỊ CHUYỂN SANG NỀN ═══
    // Khi user alt-tab hoặc mở app khác (có thể để mở screen recorder)
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          appStateRef.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // App đang chuyển sang background → có thể đang quay màn hình
          console.log("📱 App chuyển sang background — tạm dừng bảo mật");
          onAppBackgrounded?.();
        }

        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App quay lại foreground → kích hoạt lại bảo mật
          console.log("📱 App quay lại foreground — kích hoạt lại bảo mật");
          reactivateProtection();
          onAppForegrounded?.();
        }

        appStateRef.current = nextAppState;
      }
    );

    // ═══ CLEANUP: Bỏ chặn khi thoát khỏi video ═══
    return () => {
      isMounted = false;

      // Bỏ chặn quay màn hình
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

      // Bỏ listener screenshot
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      // Bỏ listener AppState
      appStateSubscription.remove();

      // Reset counter
      screenshotCountRef.current = 0;
    };
  }, [
    enabled,
    alertOnScreenshot,
    alertMessage,
    onRecordingDetected,
    onAppBackgrounded,
    onAppForegrounded,
    reactivateProtection,
  ]);
}
