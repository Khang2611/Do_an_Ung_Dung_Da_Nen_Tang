import { useState } from "react";
import { Play, Upload, X } from "lucide-react";
import { uploadLessonVideo } from "../../api/videoApi";
import { Button } from "../common/Button";
import { showToast } from "../common/Toast";
import { LessonVideoPlayer } from "./LessonVideoPlayer";

interface UploadVideoModalProps {
  lessonId: string;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (videoUrl: string) => void;
}

const MAX_SIZE = 500 * 1024 * 1024;

function getUploadedPath(response: any) {
  return response?.result?.videoUrl || response?.result || response?.data?.videoUrl || response?.data || "";
}

export function UploadVideoModal({ lessonId, lessonTitle, isOpen, onClose, onUploaded }: UploadVideoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isOpen) return null;

  const selectFile = (value: File | null) => {
    setError("");
    setUploadedUrl("");
    if (!value) {
      setFile(null);
      return;
    }
    if (value.type !== "video/mp4" && !value.name.toLowerCase().endsWith(".mp4")) {
      setError("Chỉ hỗ trợ file MP4.");
      setFile(null);
      return;
    }
    if (value.size > MAX_SIZE) {
      setError("File tối đa 500MB.");
      setFile(null);
      return;
    }
    setFile(value);
  };

  const upload = async () => {
    if (!file) {
      setError("Vui lòng chọn file MP4.");
      return;
    }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      if (false) {
        for (let value = 10; value <= 100; value += 15) {
          await new Promise((resolve) => window.setTimeout(resolve, 120));
          setProgress(Math.min(value, 100));
        }
        const mockPath = `courses/lesson-${lessonId}.mp4`;
        setUploadedUrl(mockPath);
        onUploaded?.(mockPath);
      } else {
        const response = await uploadLessonVideo(lessonId, file, setProgress);
        const path = getUploadedPath(response);
        if (!path) throw new Error("Backend chưa trả về đường dẫn video.");
        setUploadedUrl(path);
        onUploaded?.(path);
      }
      showToast("Upload video thành công. Bạn có thể xem trước ngay.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload thất bại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={uploading ? undefined : onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} disabled={uploading} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={18} />
        </button>
        <h3 className="text-lg font-bold text-slate-950">Upload video bài học</h3>
        <p className="mt-1 text-sm text-slate-500">{lessonTitle}</p>

        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:bg-slate-100">
          <Upload className="h-9 w-9 text-indigo-600" />
          <span className="mt-3 text-sm font-bold text-slate-900">{file ? file.name : "Chọn file MP4"}</span>
          <span className="mt-1 text-xs font-medium text-slate-500">Tối đa 500MB</span>
          <input type="file" accept="video/mp4" className="hidden" onChange={(event) => selectFile(event.target.files?.[0] || null)} />
        </label>

        {file && <p className="mt-3 text-xs font-semibold text-slate-500">Dung lượng: {(file.size / (1024 * 1024)).toFixed(1)} MB</p>}
        {error && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

        {uploading && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>Đang upload</span><span>{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 text-xs font-medium text-slate-500">{progress >= 100 ? "Backend đang lưu video vào MinIO." : "Đang tải file lên máy chủ."}</p>
          </div>
        )}

        {uploadedUrl && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-bold text-emerald-800">Video đã tải lên thành công</div>
            <div className="mt-1 truncate font-mono text-xs text-slate-500">{uploadedUrl}</div>
            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => setPreviewOpen(true)}>
              <Play size={14} /> Xem trước video
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>{uploadedUrl ? "Đóng" : "Hủy"}</Button>
          <Button onClick={upload} loading={uploading}>{uploadedUrl ? "Thay video" : "Upload video"}</Button>
        </div>
      </div>

      {previewOpen && uploadedUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl">
            <button className="absolute right-4 top-4 z-10 rounded-lg bg-white/90 p-1.5 text-slate-500 shadow hover:text-slate-900" onClick={() => setPreviewOpen(false)}>
              <X size={18} />
            </button>
            <LessonVideoPlayer lessonId={lessonId} videoUrl={uploadedUrl} title={lessonTitle} />
          </div>
        </div>
      )}
    </div>
  );
}
