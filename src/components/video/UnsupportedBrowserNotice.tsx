import { AlertTriangle } from "lucide-react";

interface UnsupportedBrowserNoticeProps {
  className?: string;
}

export function UnsupportedBrowserNotice({ className }: UnsupportedBrowserNoticeProps) {
  return (
    <div className={`grid aspect-video place-items-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center ${className || ""}`}>
      <div className="max-w-md">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-600" />
        <h3 className="mt-4 text-lg font-bold text-slate-950">
          Trình duyệt Cốc Cốc không được hỗ trợ để xem video
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          Vui lòng mở bài học bằng Chrome, Edge hoặc Firefox để tiếp tục học.
        </p>
      </div>
    </div>
  );
}
