import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import type { Course } from "../../types/course";

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => { getCourses().then(setCourses); }, []);
  const lessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const students = courses.reduce((sum, course) => sum + course.studentsCount, 0);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-slate-950">Dashboard giảng viên</h1><p className="mt-2 text-slate-600">Theo dõi khóa học, học viên và nội dung giảng dạy.</p></div>
        <Link to="/instructor/courses/create"><Button>Tạo khóa học</Button></Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[["Khóa học đã tạo", courses.length], ["Tổng học viên", students], ["Tổng bài học", lessons]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold text-slate-950">{value}</div></div>)}
      </div>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5 font-bold">Khóa học gần đây</div>
        <div className="divide-y divide-slate-100">{courses.map((course) => <div key={course.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><div className="font-semibold text-slate-950">{course.title}</div><div className="text-sm text-slate-500">{course.totalLessons} bài học · {course.studentsCount} học viên</div></div><Link to={`/instructor/courses/${course.id}/edit`}><Button variant="secondary">Sửa</Button></Link></div>)}</div>
      </div>
    </div>
  );
}
