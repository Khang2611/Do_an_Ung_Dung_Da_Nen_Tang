import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { deleteLessonResource, uploadLessonResource } from "../../api/resourceApi";
import type { LessonResource } from "../../types/course";
import { Button } from "../common/Button";

interface ResourceUploadWidgetProps {
  lessonId: string;
  resources?: LessonResource[];
  pendingFiles?: File[];
  onResourcesChange: (resources: LessonResource[]) => void;
  onPendingFilesChange?: (files: File[]) => void;
}

export function ResourceUploadWidget({
  lessonId,
  resources = [],
  pendingFiles = [],
  onResourcesChange,
  onPendingFilesChange,
}: ResourceUploadWidgetProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isNewLesson = lessonId.startsWith("ls-");

  const addFiles = async (files: FileList | File[] | null) => {
    const selected = Array.from(files || []);
    if (!selected.length || uploading) return;

    setError("");
    if (isNewLesson) {
      onPendingFilesChange?.([...pendingFiles, ...selected]);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(selected.map((file) => uploadLessonResource(lessonId, file)));
      onResourcesChange([...resources, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải lên tài liệu thất bại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePending = (index: number) => {
    onPendingFilesChange?.(pendingFiles.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeResource = async (resourceId: string) => {
    try {
      await deleteLessonResource(resourceId);
      onResourcesChange(resources.filter((item) => item.id !== resourceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa tài liệu.");
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileText size={16} className="text-indigo-600" />
          Tài liệu bài học
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud size={14} />}
          Tải tài liệu
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => void addFiles(event.target.files)}
      />

      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

      <div className="mt-3 space-y-2">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="min-w-0 truncate font-medium text-slate-700">{resource.name}</span>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="ghost" size="sm" className="text-rose-600" onClick={() => void removeResource(resource.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}

        {pendingFiles.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm">
            <span className="min-w-0 truncate font-medium text-indigo-800">{file.name}</span>
            <Button type="button" variant="ghost" size="sm" className="text-rose-600" onClick={() => removePending(index)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}

        {!resources.length && !pendingFiles.length && (
          <p className="text-xs font-medium text-slate-400">Chưa có tài liệu đính kèm.</p>
        )}
      </div>
    </div>
  );
}
