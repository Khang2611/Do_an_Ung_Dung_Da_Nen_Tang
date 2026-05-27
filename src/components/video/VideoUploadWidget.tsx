import { useEffect, useRef, useState } from "react";
import { Film, Loader2, Play, Trash2, UploadCloud, X } from "lucide-react";
import { uploadLessonVideo } from "../../api/videoApi";
import { Button } from "../common/Button";
import { LessonVideoPlayer } from "./LessonVideoPlayer";

interface VideoUploadWidgetProps {
  lessonId: string;
  lessonTitle?: string;
  initialVideoUrl?: string;
  initialPendingFile?: File;
  onUploadSuccess: (videoUrl: string) => void;
  onPendingFileSelected?: (file: File | null) => void;
  onClear?: () => void;
}

const MAX_SIZE = 500 * 1024 * 1024;

function getUploadedPath(response: any) {
  return response?.result?.videoUrl || response?.result || response?.data?.videoUrl || response?.data || "";
}

export function VideoUploadWidget({ lessonId, lessonTitle, initialVideoUrl, initialPendingFile, onUploadSuccess, onPendingFileSelected, onClear }: VideoUploadWidgetProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  const [pendingFile, setPendingFile] = useState<File | null>(initialPendingFile || null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const isNewLesson = lessonId.startsWith("ls-");

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  const validateFile = (file: File) => {
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
      return "Hệ thống chỉ hỗ trợ định dạng video MP4.";
    }
    if (file.size > MAX_SIZE) {
      return "Dung lượng video không được vượt quá 500MB.";
    }
    return "";
  };

  const handleFile = async (file?: File | null) => {
    if (!file || uploading) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (isNewLesson) {
      setPendingFile(file);
      setVideoUrl("");
      onPendingFileSelected?.(file);
      return;
    }

    setProgress(0);
    setUploading(true);
    try {
      const response = await uploadLessonVideo(lessonId, file, setProgress);
      const uploadedPath = getUploadedPath(response);
      if (!uploadedPath) throw new Error("Backend chưa trả về đường dẫn video.");
      setVideoUrl(uploadedPath);
      setPendingFile(null);
      onPendingFileSelected?.(null);
      onUploadSuccess(uploadedPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên video thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const clearVideo = () => {
    setVideoUrl("");
    setPendingFile(null);
    onPendingFileSelected?.(null);
    onClear?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mt-2">
      {error && <p className="mb-2 text-xs font-semibold text-rose-600">{error}</p>}

      {uploading ? (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Đang tải video lên MinIO</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100">
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      ) : videoUrl || pendingFile ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <Film size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-800">{pendingFile ? "Video đã chọn, sẽ upload khi lưu khóa học" : "Video bài giảng đã sẵn sàng"}</p>
              <p className="mt-0.5 max-w-[260px] truncate font-mono text-[10px] text-slate-500">{pendingFile?.name || videoUrl}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
              <Play size={13} /> Xem thử
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              <UploadCloud size={13} /> Thay video
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={clearVideo}>
              <Trash2 size={14} />
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="video/mp4" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 bg-white hover:bg-slate-50"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud className="mb-1 h-6 w-6 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">Kéo thả hoặc nhấp để tải video (.mp4)</span>
          <span className="mt-0.5 text-[10px] text-slate-400">Tối đa 500MB</span>
          <input ref={inputRef} type="file" accept="video/mp4" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
        </label>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl">
            <button className="absolute right-4 top-4 z-10 rounded-lg bg-white/90 p-1.5 text-slate-500 shadow hover:text-slate-900" onClick={() => setPreviewOpen(false)}>
              <X size={18} />
            </button>
            {pendingPreviewUrl ? (
              <video src={pendingPreviewUrl} controls className="aspect-video w-full rounded-xl bg-slate-950" title={lessonTitle || "Video bài học"} />
            ) : (
              <LessonVideoPlayer lessonId={lessonId} videoUrl={videoUrl} title={lessonTitle || "Video bài học"} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
