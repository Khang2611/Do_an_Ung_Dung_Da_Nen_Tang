export function Loading({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
