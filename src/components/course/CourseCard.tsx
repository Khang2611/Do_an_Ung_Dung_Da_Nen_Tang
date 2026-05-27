import { BookOpen, Clock, PlayCircle, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}

export function CourseCard({ course, enrolled = false, progress = course.progress || 0 }: CourseCardProps) {
  const displayPrice = course.discountPrice ?? course.price;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        {enrolled && <Badge className="absolute left-3 top-3 bg-white/95 text-emerald-700 shadow-sm">Đã đăng ký</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="indigo">{course.category}</Badge>
          <Badge>{course.level}</Badge>
        </div>
        <h3 className="line-clamp-2 min-h-14 text-lg font-bold leading-7 text-slate-950">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>
        <p className="mt-3 text-sm font-semibold text-slate-500">Giảng viên: {course.instructorName}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} />
            {course.studentsCount.toLocaleString("vi-VN")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} />
            {course.totalLessons} bài
          </span>
        </div>

        {enrolled && (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs font-bold">
              <span className="text-slate-500">Tiến độ</span>
              <span className="text-indigo-700">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div>
            <strong className="text-lg text-indigo-700">{formatCurrency(displayPrice)}</strong>
            {course.discountPrice != null && course.discountPrice < course.price && <div className="text-xs font-semibold text-slate-400 line-through">{formatCurrency(course.price)}</div>}
          </div>
          {enrolled ? (
            <Link to={`/student/learning/${course.id}`}>
              <Button>
                <PlayCircle size={16} /> Tiếp tục học
              </Button>
            </Link>
          ) : (
            <Link to={`/courses/${course.id}`}>
              <Button variant="secondary">Xem chi tiết</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
