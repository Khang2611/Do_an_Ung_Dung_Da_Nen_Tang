import { useEffect, useMemo, useState } from "react";
import { EyeOff, Search, ShieldCheck, Trash2 } from "lucide-react";
import { deleteCourse, getCourses, updateCourse } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import type { Course } from "../../types/course";
import { formatStatus, getStatusBadgeVariant } from "../../utils/format";

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
      <PageHeader title="Quản lý khóa học" description="Duyệt, ẩn hoặc xóa khóa học trong hệ thống." action={<Input placeholder="Tìm khóa học" icon={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />} />
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : filtered.length === 0 ? <EmptyState title="Không có khóa học" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Khóa học</th><th>Giảng viên</th><th>Danh mục</th><th>Trạng thái</th><th className="pr-4 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-950">{course.title}</td>
                  <td>{course.instructorName}</td>
                  <td>{course.category}</td>
                  <td><Badge variant={getStatusBadgeVariant(course.status)}>{formatStatus(course.status)}</Badge></td>
                  <td className="space-x-2 pr-4 text-right">
                    <Button variant={course.status === "pending" ? "primary" : "secondary"} onClick={() => changeStatus(course, "approved")}><ShieldCheck size={16} />Duyệt</Button>
                    <Button variant="ghost" onClick={() => changeStatus(course, "hidden")}><EyeOff size={16} />Ẩn</Button>
                    <Button variant="danger" onClick={() => remove(course.id)}><Trash2 size={16} />Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
