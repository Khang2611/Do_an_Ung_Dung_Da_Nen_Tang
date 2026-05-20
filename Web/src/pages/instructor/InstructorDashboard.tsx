import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Layers, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import type { Course } from "../../types/course";
import { formatStatus, getStatusBadgeVariant } from "../../utils/format";

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => { getCourses().then(setCourses); }, []);
  const lessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const students = courses.reduce((sum, course) => sum + course.studentsCount, 0);
  return (
    <div>
      <PageHeader
        title="Dashboard giảng viên"
        description="Theo dõi khóa học, học viên và nội dung giảng dạy."
        action={<Link to="/instructor/courses/create"><Button><PlusCircle size={18} />Tạo khóa học</Button></Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Khóa học đã tạo" value={courses.length} icon={<BookOpen size={20} />} />
        <StatCard label="Tổng học viên" value={students.toLocaleString("vi-VN")} icon={<GraduationCap size={20} />} tone="emerald" />
        <StatCard label="Tổng bài học" value={lessons} icon={<Layers size={20} />} tone="sky" />
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 font-bold">Khóa học gần đây</div>
        <div className="divide-y divide-slate-100">
          {courses.slice(0, 5).map((course) => (
            <div key={course.id} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50">
              <div>
                <div className="font-semibold text-slate-950">{course.title}</div>
                <div className="mt-1 text-sm text-slate-500">{course.totalLessons} bài học · {course.studentsCount.toLocaleString("vi-VN")} học viên</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusBadgeVariant(course.status)}>{formatStatus(course.status)}</Badge>
                <Link to={`/instructor/courses/${course.id}/edit`}><Button variant="secondary">Sửa</Button></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
