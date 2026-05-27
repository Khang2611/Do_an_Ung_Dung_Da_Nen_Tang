import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { getCourses } from "../../api/courseApi";
import { getMyCourses } from "../../api/enrollmentApi";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { CourseCard } from "../../components/course/CourseCard";
import { useAuth } from "../../context/AuthContext";
import type { Course, CourseFilters } from "../../types/course";

export function CourseList() {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({ category: "Tất cả", level: "Tất cả", price: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((value) => ({ ...value, search })), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");
        const [courseData, enrolledData] = await Promise.all([
          getCourses(filters),
          isAuthenticated && role === "student" ? getMyCourses() : Promise.resolve([]),
        ]);
        setCourses(courseData);
        setMyCourses(enrolledData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải khóa học.");
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [filters, isAuthenticated, role]);

  const categories = useMemo(() => ["Tất cả", ...Array.from(new Set(courses.map((course) => course.category)))], [courses]);
  const levels = ["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"];
  const enrolledMap = useMemo(() => new Map(myCourses.map((course) => [course.id, course])), [myCourses]);

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-indigo-700">EduFlow Marketplace</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">Khám phá khóa học phù hợp với bạn</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Tìm khóa học theo mục tiêu, trình độ và ngân sách. Khóa đã đăng ký sẽ hiển thị tiến độ để bạn tiếp tục học nhanh hơn.</p>
            <div className="mt-7 max-w-2xl">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                icon={<Search size={18} />}
                placeholder="Tìm React, Spring Boot, MySQL..."
                className="h-13 text-base"
              />
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
            alt="Online course discussion"
            className="hidden aspect-[4/3] rounded-3xl object-cover shadow-xl shadow-slate-200 lg:block"
          />
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <SlidersHorizontal size={17} />
            Bộ lọc khóa học
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filters.category} onChange={(event) => setFilters((value) => ({ ...value, category: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select value={filters.level} onChange={(event) => setFilters((value) => ({ ...value, level: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600">
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <select value={filters.price} onChange={(event) => setFilters((value) => ({ ...value, price: event.target.value as CourseFilters["price"] }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600">
              <option value="all">Tất cả giá</option>
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : courses.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const enrolledCourse = enrolledMap.get(course.id);
              return <CourseCard key={course.id} course={course} enrolled={Boolean(enrolledCourse)} progress={enrolledCourse?.progress ?? course.progress} />;
            })}
          </div>
        ) : (
          <EmptyState title="Không tìm thấy khóa học" description="Hãy thử đổi từ khóa, danh mục, trình độ hoặc bộ lọc giá." />
        )}
      </main>
    </div>
  );
}
