import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courseApi";
import { getMyCourses } from "../../api/enrollmentApi";
import { Button } from "../../components/common/Button";
import { CourseCard } from "../../components/course/CourseCard";
import { useAuth } from "../../context/AuthContext";
import type { Course } from "../../types/course";

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then((items) => setCourses(items.slice(0, 3)));
    if (isAuthenticated) getMyCourses().then(setMyCourses);
  }, [isAuthenticated]);

  if (isAuthenticated && user) {
    const avg = Math.round(myCourses.reduce((sum, item) => sum + (item.progress || 0), 0) / Math.max(myCourses.length, 1));
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl bg-indigo-700 p-8 text-white">
          <p className="text-indigo-100">Xin chào,</p>
          <h1 className="mt-1 text-3xl font-bold">{user.fullName || user.username}</h1>
          <p className="mt-3 max-w-2xl text-indigo-100">Tiếp tục lộ trình học tập và theo dõi tiến độ các khóa đã đăng ký.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[["Khóa đã đăng ký", myCourses.length], ["Tiến độ trung bình", `${avg}%`], ["Khóa đang học", myCourses.filter((c) => (c.progress || 0) < 100).length]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-bold text-slate-950">{value}</div></div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">Khóa học của tôi</h2>
          <Link to="/student/my-courses" className="text-sm font-semibold text-indigo-700">Xem tất cả</Link>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{myCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-200">Hệ thống quản lý khóa học online</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Học tập, giảng dạy và quản trị khóa học trong một nền tảng.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">EduFlow hỗ trợ demo đầy đủ JWT authentication, phân quyền theo role, danh sách khóa học, học bài và quản lý vận hành.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses"><Button>Xem khóa học <ArrowRight size={18} /></Button></Link>
              <Link to="/login"><Button variant="secondary">Đăng nhập</Button></Link>
              <Link to="/register"><Button variant="ghost" className="text-white hover:bg-white/10">Đăng ký</Button></Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-2xl">
            <img className="h-[360px] w-full rounded-xl object-cover" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Lớp học online" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {[["Lộ trình rõ ràng", BookOpen], ["Quản lý học viên", Users], ["Giảng viên chủ động", GraduationCap], ["JWT phân quyền", ShieldCheck]].map(([label, Icon]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><Icon className="mb-3 text-indigo-600" /><strong>{String(label)}</strong></div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950">Khóa học nổi bật</h2>
          <Link to="/courses" className="font-semibold text-indigo-700">Xem tất cả</Link>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
        <h2 className="mt-12 text-2xl font-bold text-slate-950">Danh mục khóa học</h2>
        <div className="mt-4 flex flex-wrap gap-3">{["Lập trình Web", "Backend", "Thiết kế", "Dữ liệu", "Mobile"].map((item) => <span key={item} className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">{item}</span>)}</div>
      </section>
    </div>
  );
}
