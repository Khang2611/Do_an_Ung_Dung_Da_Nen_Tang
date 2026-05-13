import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCourse, getCourses } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import type { Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    try {
      await deleteCourse(id);
      setCourses((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa khóa học.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold text-slate-950">Quản lý khóa học</h1><Link to="/instructor/courses/create"><Button>Tạo khóa học</Button></Link></div>
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Khóa học</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => <tr key={course.id}><td className="p-4 font-semibold">{course.title}</td><td>{course.category}</td><td>{formatCurrency(course.price)}</td><td><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{course.status}</span></td><td className="space-x-2 pr-4 text-right"><Link to={`/instructor/courses/${course.id}/edit`}><Button variant="secondary">Sửa</Button></Link><Button variant="danger" onClick={() => remove(course.id)}>Xóa</Button></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
