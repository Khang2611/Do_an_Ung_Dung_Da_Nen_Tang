import { useState } from "react";
import { Upload, X } from "lucide-react";
import { USE_MOCK } from "../../api/axiosClient";
import { uploadLessonVideo } from "../../api/videoApi";
import { Button } from "../common/Button";
import { showToast } from "../common/Toast";

interface UploadVideoModalProps {
  lessonId: string;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_SIZE = 500 * 1024 * 1024;

export function UploadVideoModal({ lessonId, lessonTitle, isOpen, onClose }: UploadVideoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const selectFile = (value: File | null) => {
    setError("");
    if (!value) {
      setFile(null);
      return;
    }
    if (value.type !== "video/mp4") {
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
      if (USE_MOCK) {
        for (let value = 10; value <= 100; value += 15) {
          await new Promise((resolve) => window.setTimeout(resolve, 120));
          setProgress(Math.min(value, 100));
        }
      } else {
        await uploadLessonVideo(lessonId, file, setProgress);
      }
      showToast("Upload thành công. Backend đang xử lý video HLS.", "success");
      onClose();
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
            <p className="mt-2 text-xs font-medium text-slate-500">{progress >= 100 ? "Backend đang xử lý video thành HLS." : "Đang tải file lên máy chủ."}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>Hủy</Button>
          <Button onClick={upload} loading={uploading}>Upload video</Button>
        </div>
      </div>
    </div>
  );
}
