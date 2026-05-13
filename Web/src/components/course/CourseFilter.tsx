import { Search } from "lucide-react";
import type { CourseFilters } from "../../types/course";

interface Props {
  filters: CourseFilters;
  categories: string[];
  levels: string[];
  onChange: (filters: CourseFilters) => void;
}

export function CourseFilter({ filters, categories, levels, onChange }: Props) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_160px]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="Tìm khóa học..." value={filters.search || ""} onChange={(e) => onChange({ ...filters, search: e.target.value })} />
      </label>
      <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" value={filters.category || "Tất cả"} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>
      <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" value={filters.level || "Tất cả"} onChange={(e) => onChange({ ...filters, level: e.target.value })}>
        {levels.map((item) => <option key={item}>{item}</option>)}
      </select>
    </div>
  );
}
