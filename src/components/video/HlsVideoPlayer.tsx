import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, LogIn, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/axiosClient";
import { getVideoPlaylistUrl } from "../../api/videoApi";
import { Button } from "../common/Button";

interface HlsVideoPlayerProps {
  lessonId: string | number;
  title?: string;
  className?: string;
  onError?: (message: string) => void;
}

function getFriendlyError(status?: number) {
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn chưa đăng ký khóa học này nên không thể xem video.";
  if (status === 404) return "Bài học chưa có video.";
  return "Không thể tải video. Vui lòng thử lại.";
}

export function HlsVideoPlayer({
  lessonId,
  title,
  className,
  onError,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fail = (message: string) => {
    setError(message);
    setLoading(false);
    onError?.(message);
  };

  const loginAgain = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.dispatchEvent(new Event("auth:logout"));
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const token = localStorage.getItem("auth_token") || "";
    const playlistUrl = getVideoPlaylistUrl(lessonId);

    setError("");
    setLoading(true);

    if (!token) {
      fail("Bạn cần đăng nhập để xem video.");
      return;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.removeAttribute("src");
    video.load();

    if (!Hls.isSupported()) {
      fail("Trình duyệt không hỗ trợ HLS.");
      return;
    }

    const apiOrigin = new URL(API_BASE_URL).origin;
    const hls = new Hls({
      xhrSetup: (xhr, url) => {
        const requestUrl = new URL(url, window.location.href);
        if (requestUrl.origin === apiOrigin && requestUrl.pathname.startsWith("/api/videos/")) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
      },
    });

    hlsRef.current = hls;

    hls.loadSource(playlistUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setLoading(false);
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      console.log("HLS ERROR:", data);

      if (!data.fatal) return;

      const status = data.response?.code;
      fail(getFriendlyError(status));
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;

      video.removeAttribute("src");
      video.load();
    };
  }, [lessonId, onError]);

  if (error) {
    return (
      <div className={`grid aspect-video place-items-center rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center ${className || ""}`}>
        <div>
          <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />

          <h3 className="mt-4 text-lg font-bold text-slate-950">
            {error}
          </h3>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {error.includes("hết hạn") ? (
              <Button onClick={loginAgain}>
                <LogIn size={16} /> Đăng nhập lại
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>
                <RotateCcw size={16} /> Thử lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 ${className || ""}`}>
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải video...
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        className="aspect-video w-full bg-slate-950"
        title={title}
      />
    </div>
  );
}
