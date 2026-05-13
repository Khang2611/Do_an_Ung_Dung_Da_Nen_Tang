import { AlertTriangle } from "lucide-react";

export function ErrorMessage({ message, title = "Không thể tải dữ liệu" }: { message?: string; title?: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm">{message || "Có lỗi xảy ra khi kết nối máy chủ."}</p>
        </div>
      </div>
    </div>
  );
}
