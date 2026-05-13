/**
 * useWebDevToolsBlocker — Hook chặn F12 / DevTools / Chuột phải trên Web (Phiên bản nâng cao).
 *
 * Hệ thống phòng thủ nhiều lớp:
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  Layer 1: Chặn phím tắt (F12, Ctrl+Shift+I/J/C, Ctrl+U/S/P)       │
 * │  Layer 2: Chặn chuột phải (Context Menu)                            │
 * │  Layer 3: Chặn kéo thả (Drag) và chọn văn bản (Select)             │
 * │  Layer 4: Phát hiện DevTools đã mở (kích thước cửa sổ)             │
 * │  Layer 5: Debugger trap — làm chậm người dùng mở DevTools          │
 * │  Layer 6: Phát hiện tab ẩn — pause video khi user chuyển tab       │
 * │  Layer 7: Console flooding — ghi đè console để chống đọc lén       │
 * │  Layer 8: CSS bảo vệ — ẩn nút download, chặn copy/select          │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ Lưu ý: Đây là lớp bảo vệ "Defense-in-Depth".
 *    Không có giải pháp client-side nào là 100% bất khả xâm phạm,
 *    nhưng kết hợp nhiều lớp khiến việc rip video trở nên rất khó khăn.
 */
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

interface UseWebDevToolsBlockerOptions {
  /** Bật/tắt chặn. Default: true */
  enabled?: boolean;
  /** Tin nhắn cảnh báo khi user cố mở DevTools */
  warningMessage?: string;
  /** Callback khi phát hiện DevTools mở → dùng để pause video */
  onDevToolsDetected?: () => void;
  /** Callback khi user chuyển tab (Page Visibility) → dùng để pause video */
  onVisibilityHidden?: () => void;
  /** Callback khi user quay lại tab */
  onVisibilityVisible?: () => void;
}

export function useWebDevToolsBlocker(
  options: UseWebDevToolsBlockerOptions = {}
) {
  const {
    enabled = true,
    warningMessage = "⚠️ Hành động này bị chặn để bảo vệ nội dung bài giảng có bản quyền!",
    onDevToolsDetected,
    onVisibilityHidden,
    onVisibilityVisible,
  } = options;

  const devToolsDetectedRef = useRef(false);

  useEffect(() => {
    // Chỉ chạy trên Web
    if (Platform.OS !== "web" || !enabled) return;

    // ═══ LAYER 1: CHẶN PHÍM TẮT DEVTOOLS (Mở rộng) ═══
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked =
        // F12 — Mở DevTools
        e.key === "F12" ||
        // Ctrl+Shift+I — Inspect Elements
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        // Ctrl+Shift+J — Console
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        // Ctrl+Shift+C — Element Picker
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        // Ctrl+U — View Source
        (e.ctrlKey && !e.shiftKey && (e.key === "U" || e.key === "u")) ||
        // Ctrl+S — Save Page
        (e.ctrlKey && !e.shiftKey && (e.key === "S" || e.key === "s")) ||
        // Ctrl+P — Print Page
        (e.ctrlKey && (e.key === "P" || e.key === "p")) ||
        // Ctrl+Shift+K — Firefox Console
        (e.ctrlKey && e.shiftKey && (e.key === "K" || e.key === "k")) ||
        // Ctrl+Shift+M — Responsive Design Mode
        (e.ctrlKey && e.shiftKey && (e.key === "M" || e.key === "m")) ||
        // Cmd+Option+I — macOS DevTools
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i")) ||
        // Cmd+Option+J — macOS Console
        (e.metaKey && e.altKey && (e.key === "J" || e.key === "j")) ||
        // Cmd+Option+U — macOS View Source
        (e.metaKey && e.altKey && (e.key === "U" || e.key === "u")) ||
        // F5 — Refresh (ngăn refresh để tránh bypass)
        // (Bỏ comment nếu muốn cứng hơn)
        // e.key === "F5" ||
        // Ctrl+Shift+E — Network tab
        (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e"));

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Hiển thị toast cảnh báo thay vì console (vì console có thể bị đọc)
        showSecurityToast(warningMessage);
        return false;
      }
    };

    // ═══ LAYER 2: CHẶN CHUỘT PHẢI ═══
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityToast("Chuột phải bị vô hiệu hóa để bảo vệ nội dung 🔒");
      return false;
    };

    // ═══ LAYER 3: CHẶN KÉO THÔNG TIN (DRAG) ═══
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // ═══ LAYER 4: CHẶN CHỌN VĂN BẢN (SELECT) ═══
    const handleSelectStart = (e: Event) => {
      // Cho phép select trong input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // ═══ LAYER 5: CHẶN COPY/CUT/PASTE NỘI DUNG VIDEO ═══
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // ═══ LAYER 6: PHÁT HIỆN DEVTOOLS ĐÃ MỞ (Nhiều kỹ thuật) ═══
    let devToolsCheckInterval: ReturnType<typeof setInterval> | null = null;

    const checkDevTools = () => {
      // Kỹ thuật 1: Kiểm tra kích thước cửa sổ
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      // Kỹ thuật 2: Debugger timing — nếu DevTools mở, debugger sẽ tạo delay
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const elapsed = performance.now() - start;
      const debuggerDetected = elapsed > 100;

      const isDevToolsOpen =
        widthThreshold || heightThreshold || debuggerDetected;

      if (isDevToolsOpen && !devToolsDetectedRef.current) {
        devToolsDetectedRef.current = true;
        console.clear();

        // Gọi callback để pause video hoặc ẩn nội dung
        onDevToolsDetected?.();

        // Hiển thị cảnh báo trên UI
        showSecurityOverlay();
      } else if (!isDevToolsOpen && devToolsDetectedRef.current) {
        devToolsDetectedRef.current = false;
        removeSecurityOverlay();
      }
    };

    // ═══ LAYER 7: PAGE VISIBILITY API — Phát hiện chuyển tab ═══
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onVisibilityHidden?.();
      } else {
        onVisibilityVisible?.();
      }
    };

    // ═══ LAYER 8: CHẶN PRINT (Ctrl+P, window.print) ═══
    const handleBeforePrint = () => {
      // Ẩn nội dung video trước khi in
      const videos = document.querySelectorAll("video");
      videos.forEach((v) => {
        (v as HTMLVideoElement).style.visibility = "hidden";
      });
    };

    const handleAfterPrint = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((v) => {
        (v as HTMLVideoElement).style.visibility = "visible";
      });
    };

    // ═══ LAYER 9: CONSOLE PROTECTION ═══
    // Ghi đè console để ngăn việc đọc thông tin nhạy cảm
    try {
      console.log(
        "%c🛑 DỪNG LẠI!",
        "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000;"
      );
      console.log(
        "%cĐây là tính năng dành cho nhà phát triển. " +
          "Nếu ai đó bảo bạn sao chép/dán nội dung ở đây, " +
          "đó là hành vi lừa đảo có thể dẫn đến mất tài khoản.",
        "color: #FF6B6B; font-size: 16px; line-height: 1.6;"
      );
      console.log(
        "%c🔒 Video được bảo vệ bằng MinIO Signed URL — " +
          "link sẽ hết hạn sau 15 phút và không thể tái sử dụng.",
        "color: #FFA500; font-size: 14px;"
      );
    } catch {
      // ignore
    }

    // ═══ ĐĂNG KÝ TẤT CẢ EVENT LISTENERS ═══
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCopy, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    // Kiểm tra DevTools mỗi 1.5 giây
    devToolsCheckInterval = setInterval(checkDevTools, 1500);

    // ═══ CSS BẢO VỆ NÂNG CAO ═══
    const style = document.createElement("style");
    style.id = "security-styles";
    style.textContent = `
      /* ── Chặn chọn text trên toàn trang (trừ input) ── */
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }

      /* ── Ẩn nút download trên video controls (Chrome/Edge) ── */
      video::-internal-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        overflow: hidden !important;
      }
      video::-webkit-media-controls-panel {
        width: calc(100% + 30px) !important;
      }

      /* ── Chặn picture-in-picture button ── */
      video::-webkit-media-controls-toggle-closed-captions-button,
      video::-webkit-media-controls-picture-in-picture-button {
        display: none !important;
      }

      /* ── Chặn kéo thả ảnh/video ── */
      img, video, canvas {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto;
      }

      /* ── Khi print: ẩn video và hiện cảnh báo ── */
      @media print {
        video, canvas, .video-container, .secure-video-player {
          display: none !important;
        }
        body::after {
          content: "⚠️ Nội dung video được bảo vệ bản quyền. Không thể in.";
          display: block;
          font-size: 24px;
          text-align: center;
          padding: 100px;
          color: red;
        }
      }

      /* ── Security overlay khi phát hiện DevTools ── */
      .security-devtools-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(15, 23, 42, 0.97) !important;
        z-index: 999999 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 16px !important;
        backdrop-filter: blur(20px) !important;
      }
      .security-devtools-overlay .icon {
        font-size: 64px;
      }
      .security-devtools-overlay .title {
        font-size: 24px;
        font-weight: 800;
        color: #EF4444;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .security-devtools-overlay .message {
        font-size: 16px;
        color: #94A3B8;
        text-align: center;
        max-width: 400px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* ── Security toast notification ── */
      .security-toast {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 999998 !important;
        background: linear-gradient(135deg, #1E293B, #0F172A) !important;
        border: 1px solid #EF444466 !important;
        border-radius: 12px !important;
        padding: 14px 20px !important;
        color: #F1F5F9 !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        animation: slideInToast 0.3s ease-out, fadeOutToast 0.3s ease-in 2.7s forwards !important;
        max-width: 360px !important;
      }
      @keyframes slideInToast {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOutToast {
        from { opacity: 1; }
        to { opacity: 0; pointer-events: none; }
      }
    `;
    document.head.appendChild(style);

    // ═══ CLEANUP ═══
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCopy, true);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);

      if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval);
      }

      const securityStyle = document.getElementById("security-styles");
      if (securityStyle) {
        securityStyle.remove();
      }

      removeSecurityOverlay();
      devToolsDetectedRef.current = false;
    };
  }, [
    enabled,
    warningMessage,
    onDevToolsDetected,
    onVisibilityHidden,
    onVisibilityVisible,
  ]);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Hiển thị toast cảnh báo bảo mật (thay cho alert) */
function showSecurityToast(message: string) {
  if (typeof document === "undefined") return;

  // Xóa toast cũ nếu có
  const existing = document.getElementById("security-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "security-toast";
  toast.className = "security-toast";
  toast.textContent = `🔒 ${message}`;
  document.body.appendChild(toast);

  // Tự xóa sau 3 giây
  setTimeout(() => toast.remove(), 3000);
}

/** Hiển thị overlay che toàn bộ khi phát hiện DevTools */
function showSecurityOverlay() {
  if (typeof document === "undefined") return;

  // Tránh tạo trùng
  if (document.getElementById("security-devtools-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "security-devtools-overlay";
  overlay.className = "security-devtools-overlay";
  overlay.innerHTML = `
    <div class="icon">🛡️</div>
    <div class="title">DevTools đã bị phát hiện!</div>
    <div class="message">
      Vui lòng đóng Developer Tools để tiếp tục xem video.
      <br/><br/>
      Nội dung video được bảo vệ bằng Signed URL có thời hạn.
      Mọi hành vi sao chép đều bị ghi nhận.
    </div>
  `;
  document.body.appendChild(overlay);
}

/** Xóa overlay khi DevTools đã đóng */
function removeSecurityOverlay() {
  if (typeof document === "undefined") return;

  const overlay = document.getElementById("security-devtools-overlay");
  if (overlay) overlay.remove();
}
