import { Clock, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img src={course.thumbnail} alt={course.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="indigo">{course.category}</Badge>
          <Badge>{course.level}</Badge>
        </div>
        <h3 className="line-clamp-2 min-h-14 text-lg font-bold leading-7 text-slate-950">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Star size={16} className="fill-amber-400 text-amber-400" />{course.rating}</span>
          <span className="flex items-center gap-1"><Users size={16} />{course.studentsCount.toLocaleString("vi-VN")}</span>
          <span className="flex items-center gap-1"><Clock size={16} />{course.duration}</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <strong className="text-lg text-indigo-700">{formatCurrency(course.price)}</strong>
          <Link to={`/courses/${course.id}`}><Button>Xem chi tiết</Button></Link>
        </div>
      </div>
    </article>
  );
}
