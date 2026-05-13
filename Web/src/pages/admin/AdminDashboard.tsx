import { useEffect, useState } from "react";
import { getCourses } from "../../api/courseApi";
import { getEnrollments } from "../../api/enrollmentApi";
import { getUsers } from "../../api/userApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import type { Course, Enrollment } from "../../types/course";
import type { User } from "../../types/user";
import { formatCurrency } from "../../utils/format";

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getUsers(), getCourses(), getEnrollments()])
      .then(([userData, courseData, enrollmentData]) => {
        setUsers(userData);
        setCourses(courseData);
        setEnrollments(enrollmentData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const revenue = courses.reduce((sum, c) => sum + c.price * Math.min(c.studentsCount, 30), 0);
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950">Dashboard quản trị</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[["Người dùng", users.length], ["Khóa học", courses.length], ["Đăng ký", enrollments.length], ["Doanh thu", formatCurrency(revenue)]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold text-slate-950">{value}</div></div>)}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b p-5 font-bold">Khóa học mới nhất</div>{courses.slice(0, 5).map((c) => <div key={c.id} className="flex justify-between border-b border-slate-100 p-4 text-sm"><span>{c.title}</span><strong>{c.status}</strong></div>)}</section>
        <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b p-5 font-bold">Người dùng mới nhất</div>{users.slice(0, 5).map((u) => <div key={u.id} className="flex justify-between border-b border-slate-100 p-4 text-sm"><span>{u.fullName}</span><strong>{u.role}</strong></div>)}</section>
      </div>
    </div>
  );
}
