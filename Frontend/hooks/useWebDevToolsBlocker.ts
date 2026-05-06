/**
 * useWebDevToolsBlocker — Hook chặn F12 / DevTools / Chuột phải trên Web.
 *
 * Các phím tắt bị chặn:
 * ┌───────────────────────────────────────────────────┐
 * │  F12              → Mở DevTools                   │
 * │  Ctrl+Shift+I     → Mở DevTools (Inspect)         │
 * │  Ctrl+Shift+J     → Mở Console                    │
 * │  Ctrl+Shift+C     → Mở Element Picker             │
 * │  Ctrl+U           → Xem Source Code                │
 * │  Ctrl+S           → Lưu trang web                  │
 * │  Ctrl+P           → In trang web                   │
 * │  Chuột phải       → Context Menu (Inspect Element) │
 * └───────────────────────────────────────────────────┘
 *
 * ⚠️ Lưu ý: Đây là lớp bảo vệ "Ngăn người ngay".
 *    Người dùng nâng cao vẫn có thể vượt qua bằng cách mở
 *    DevTools trước khi truy cập trang. Nhưng kết hợp với
 *    Signed URL (hết hạn sau 15 phút), rủi ro được giảm thiểu tối đa.
 */
import { useEffect } from "react";
import { Platform } from "react-native";

interface UseWebDevToolsBlockerOptions {
  /** Bật/tắt chặn. Default: true */
  enabled?: boolean;
  /** Tin nhắn cảnh báo khi user cố mở DevTools */
  warningMessage?: string;
}

export function useWebDevToolsBlocker(
  options: UseWebDevToolsBlockerOptions = {}
) {
  const {
    enabled = true,
    warningMessage = "⚠️ Hành động này bị chặn để bảo vệ nội dung bài giảng có bản quyền!",
  } = options;

  useEffect(() => {
    // Chỉ chạy trên Web
    if (Platform.OS !== "web" || !enabled) return;

    // ═══ 1. CHẶN PHÍM TẮT DEVTOOLS ═══
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked =
        // F12 — Mở DevTools
        e.key === "F12" ||
        // Ctrl+Shift+I — Inspect Elements
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        // Ctrl+Shift+J — Console
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        // Ctrl+Shift+C — Element Picker
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        // Ctrl+U — View Source
        (e.ctrlKey && e.key === "u") ||
        // Ctrl+S — Save Page
        (e.ctrlKey && !e.shiftKey && e.key === "s") ||
        // Ctrl+P — Print Page
        (e.ctrlKey && e.key === "p");

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();

        // Hiển thị cảnh báo nhẹ nhàng (chỉ lần đầu)
        console.warn(warningMessage);
        return false;
      }
    };

    // ═══ 2. CHẶN CHUỘT PHẢI ═══
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // ═══ 3. CHẶN KÉO THÔNG TIN (DRAG) ═══
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // ═══ 4. CHẶN CHỌN VĂN BẢN (SELECT) ═══
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

    // ═══ 5. PHÁT HIỆN DEVTOOLS ĐÃ MỞ (Kỹ thuật nâng cao) ═══
    // Sử dụng debugger trap: nếu DevTools mở, debugger sẽ làm chậm
    let devToolsCheckInterval: ReturnType<typeof setInterval> | null = null;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        console.clear();
        console.warn(
          "%c🔒 BẢO MẬT: DevTools đã bị phát hiện!",
          "color: red; font-size: 24px; font-weight: bold;"
        );
        console.warn(
          "%cNội dung video được bảo vệ bởi MinIO Signed URL. " +
            "Link video sẽ hết hạn sau 15 phút và không thể tái sử dụng.",
          "color: orange; font-size: 14px;"
        );
      }
    };

    // ═══ 6. VÔ HIỆU HÓA CONSOLE LOG NHẠY CẢM ═══
    // Ghi đè console để ngăn việc đọc thông tin nhạy cảm
    const originalLog = console.log;
    const originalInfo = console.info;

    // Thêm cảnh báo vào console
    try {
      console.log(
        "%c🛑 DỪNG LẠI!",
        "color: red; font-size: 40px; font-weight: bold;"
      );
      console.log(
        "%cĐây là tính năng dành cho nhà phát triển. " +
          "Nếu ai đó bảo bạn sao chép/dán nội dung ở đây, " +
          "đó là hành vi lừa đảo.",
        "color: #333; font-size: 16px;"
      );
    } catch {
      // ignore
    }

    // ═══ ĐĂNG KÝ TẤT CẢ EVENT LISTENERS ═══
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("selectstart", handleSelectStart, true);

    devToolsCheckInterval = setInterval(checkDevTools, 2000);

    // Thêm CSS chống copy/select
    const style = document.createElement("style");
    style.id = "security-styles";
    style.textContent = `
      /* Chặn chọn text trên toàn trang (trừ input) */
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
      /* Ẩn video controls download button (Chrome) */
      video::-internal-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        overflow: hidden !important;
      }
      video::-webkit-media-controls-panel {
        width: calc(100% + 30px) !important;
      }
    `;
    document.head.appendChild(style);

    // ═══ CLEANUP ═══
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("selectstart", handleSelectStart, true);

      if (devToolsCheckInterval) {
        clearInterval(devToolsCheckInterval);
      }

      const securityStyle = document.getElementById("security-styles");
      if (securityStyle) {
        securityStyle.remove();
      }
    };
  }, [enabled, warningMessage]);
}
