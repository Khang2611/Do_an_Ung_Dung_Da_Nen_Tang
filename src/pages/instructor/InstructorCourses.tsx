import { useEffect, useState } from "react";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteCourse, getCourses } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import type { Course } from "../../types/course";
import { formatCurrency, formatStatus, getStatusBadgeVariant } from "../../utils/format";

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
      <PageHeader title="Quản lý khóa học" description="Theo dõi trạng thái xuất bản, giá và thao tác chỉnh sửa khóa học." action={<Link to="/instructor/courses/create"><Button><PlusCircle size={18} />Tạo khóa học</Button></Link>} />
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : courses.length === 0 ? <EmptyState title="Chưa có khóa học" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Khóa học</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th className="pr-4 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="p-4"><div className="font-semibold text-slate-950">{course.title}</div><div className="text-slate-500">{course.totalLessons} bài học</div></td>
                  <td>{course.category}</td>
                  <td className="font-semibold text-slate-900">{formatCurrency(course.price)}</td>
                  <td><Badge variant={getStatusBadgeVariant(course.status)}>{formatStatus(course.status)}</Badge></td>
                  <td className="space-x-2 pr-4 text-right">
                    <Link to={`/instructor/courses/${course.id}/edit`}><Button variant="secondary"><Pencil size={16} />Sửa</Button></Link>
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
