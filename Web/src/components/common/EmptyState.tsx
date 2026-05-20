import { SearchX } from "lucide-react";

export function EmptyState({ title = "Không có dữ liệu", description = "Thử thay đổi bộ lọc hoặc quay lại sau." }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100">
        <SearchX className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
