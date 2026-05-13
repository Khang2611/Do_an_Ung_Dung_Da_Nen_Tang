import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../../api/enrollmentApi";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { CourseCard } from "../../components/course/CourseCard";
import type { Course } from "../../types/course";

export function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học đã đăng ký."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-950">Khóa học của tôi</h1>
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : courses.length === 0 ? <div className="mt-6"><EmptyState title="Chưa đăng ký khóa học" description="Hãy chọn một khóa học và đăng ký để bắt đầu học." /></div> : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard course={course} />
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex justify-between text-sm"><span>Tiến độ</span><strong>{course.progress || 0}%</strong></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${course.progress || 0}%` }} /></div>
                <Link to={`/student/learning/${course.id}`}><Button className="mt-4 w-full">Tiếp tục học</Button></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
