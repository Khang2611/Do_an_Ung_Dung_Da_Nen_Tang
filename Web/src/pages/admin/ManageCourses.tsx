import { useEffect, useMemo, useState } from "react";
import { deleteCourse, getCourses, updateCourse } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import type { Course } from "../../types/course";

export function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())), [courses, search]);
  const changeStatus = async (course: Course, status: string) => {
    try {
      await updateCourse(course.id, { status });
      setCourses((items) => items.map((item) => item.id === course.id ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật khóa học.");
    }
  };
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
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold text-slate-950">Quản lý khóa học</h1><Input placeholder="Tìm khóa học" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Khóa học</th><th>Giảng viên</th><th>Danh mục</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((course) => <tr key={course.id}><td className="p-4 font-semibold">{course.title}</td><td>{course.instructorName}</td><td>{course.category}</td><td>{course.status}</td><td className="space-x-2 pr-4 text-right"><Button variant="secondary" onClick={() => changeStatus(course, "approved")}>Duyệt</Button><Button variant="ghost" onClick={() => changeStatus(course, "hidden")}>Ẩn</Button><Button variant="danger" onClick={() => remove(course.id)}>Xóa</Button></td></tr>)}</tbody></table></div>}
    </div>
  );
}
