import { useEffect, useState } from "react";
import { AlertCircle, Loader2, LogIn, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSignedVideoUrl } from "../../api/videoApi";
import { Button } from "../common/Button";

interface SignedVideoPlayerProps {
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

export function SignedVideoPlayer({ lessonId, title, className, onError }: SignedVideoPlayerProps) {
  const navigate = useNavigate();
  const [signedUrl, setSignedUrl] = useState("");
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
    let active = true;
    setError("");
    setSignedUrl("");
    setLoading(true);

    getSignedVideoUrl(lessonId)
      .then((url) => {
        if (!active) return;
        if (!url) {
          fail("Backend chưa trả về link video.");
          return;
        }
        setSignedUrl(url);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        fail(getFriendlyError(err?.status));
      });

    return () => {
      active = false;
    };
  }, [lessonId]);

  if (error) {
    return (
      <div className={`grid aspect-video place-items-center rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center ${className || ""}`}>
        <div>
          <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
          <h3 className="mt-4 text-lg font-bold text-slate-950">{error}</h3>
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
      {signedUrl && (
        <video
          src={signedUrl}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          className="aspect-video w-full bg-slate-950"
          onContextMenu={(event) => event.preventDefault()}
          title={title}
        />
      )}
    </div>
  );
}
