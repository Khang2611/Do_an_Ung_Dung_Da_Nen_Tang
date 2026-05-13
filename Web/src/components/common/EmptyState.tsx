import { SearchX } from "lucide-react";

export function EmptyState({ title = "Không có dữ liệu", description = "Thử thay đổi bộ lọc hoặc quay lại sau." }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <SearchX className="mx-auto mb-3 h-9 w-9 text-slate-400" />
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
