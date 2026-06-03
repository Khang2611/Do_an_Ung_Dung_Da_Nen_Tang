import { useEffect, useState } from "react";
import { BookOpen, CreditCard, Users } from "lucide-react";
import { getCourses } from "../../api/courseApi";
import { getUsers } from "../../api/userApi";
import { Badge } from "../../components/common/Badge";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import type { Course } from "../../types/course";
import type { User } from "../../types/user";
import { formatCurrency, formatRole, formatStatus, getRoleBadgeVariant, getStatusBadgeVariant } from "../../utils/format";

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getUsers(), getCourses()])
      .then(([userData, courseData]) => {
        setUsers(userData);
        setCourses(courseData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const revenue = courses.reduce((sum, c) => sum + c.price * Math.min(c.studentsCount, 30), 0);
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader title="Dashboard quản trị" description="Tổng quan người dùng, khóa học và doanh thu." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Người dùng" value={users.length} icon={<Users size={20} />} />
        <StatCard label="Khóa học" value={courses.length} icon={<BookOpen size={20} />} tone="sky" />
        <StatCard label="Doanh thu" value={formatCurrency(revenue)} icon={<CreditCard size={20} />} tone="amber" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 font-bold">Khóa học mới nhất</div>
          <div className="divide-y divide-slate-100">
            {courses.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-slate-50">
                <span className="font-medium text-slate-900">{c.title}</span>
                <Badge variant={getStatusBadgeVariant(c.status)}>{formatStatus(c.status)}</Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 font-bold">Người dùng mới nhất</div>
          <div className="divide-y divide-slate-100">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">{u.fullName}</div>
                  <div className="text-slate-500">{u.email}</div>
                </div>
                <Badge variant={getRoleBadgeVariant(u.role)}>{formatRole(u.role)}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
