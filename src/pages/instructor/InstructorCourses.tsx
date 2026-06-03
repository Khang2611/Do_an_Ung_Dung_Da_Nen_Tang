import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, Edit3, Filter, PlusCircle, Search, Trash2, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteCourse, getTeachingCourses } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { showToast } from "../../components/common/Toast";
import type { Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";

function videoStats(course: Course) {
  const lessons = course.lessons?.length ? course.lessons : course.chapters.flatMap((chapter) => chapter.lessons);
  const total = lessons.length;
  const uploaded = lessons.filter((lesson) => lesson.hasVideo || lesson.videoStatus === "ready" || lesson.videoUrl).length;
  return { total, uploaded, percent: total ? Math.round((uploaded / total) * 100) : 0 };
}

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  useEffect(() => {
    getTeachingCourses()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["all", ...Array.from(new Set(courses.map((course) => course.category)))], [courses]);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchSearch = !keyword || `${course.title} ${course.description}`.toLowerCase().includes(keyword);
      const matchCategory = categoryFilter === "all" || course.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [courses, search, categoryFilter]);

  const stats = useMemo(() => ({
    total: courses.length,
    lessons: courses.reduce((sum, course) => sum + (course.totalLessons || 0), 0),
    videos: courses.reduce((sum, course) => sum + videoStats(course).uploaded, 0),
    students: courses.reduce((sum, course) => sum + course.studentsCount, 0),
  }), [courses]);

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id);
      setCourses((items) => items.filter((item) => item.id !== deleteTarget.id));
      showToast("Đã xóa khóa học.", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể xóa khóa học.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa học của tôi"
        description="Quản lý khóa học, bài học và video. Khóa học của giảng viên được hiển thị ngay sau khi lưu."
        action={<Link to="/instructor/courses/create"><Button><PlusCircle size={18} />Tạo khóa học</Button></Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng khóa học" value={stats.total} icon={<BookOpen size={20} />} />
        <StatCard label="Bài học" value={stats.lessons} icon={<Edit3 size={20} />} tone="sky" />
        <StatCard label="Video đã upload" value={stats.videos} icon={<Upload size={20} />} tone="emerald" />
        <StatCard label="Tổng học viên" value={stats.students.toLocaleString("vi-VN")} icon={<Users size={20} />} tone="indigo" />
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md flex-1"><Input icon={<Search size={16} />} placeholder="Tìm theo tên khóa học..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><Filter size={16} />Lọc</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none">
            {categories.map((category) => <option key={category} value={category}>{category === "all" ? "Tất cả danh mục" : category}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : filtered.length === 0 ? (
        <div>
          <EmptyState title="Bạn chưa tạo khóa học nào" description="Tạo khóa học đầu tiên để bắt đầu xây dựng nội dung giảng dạy." />
          <div className="mt-4 text-center"><Link to="/instructor/courses/create"><Button>Tạo khóa học đầu tiên</Button></Link></div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((course) => {
            const videos = videoStats(course);
            return (
              <article key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <img src={course.thumbnail} alt={course.title} className="h-full min-h-56 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="success">Đang hiển thị</Badge>
                      <Badge variant="slate">{course.category}</Badge>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-xl font-extrabold text-slate-950">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-2"><BookOpen size={16} />{course.totalLessons} bài học</span>
                      <span className="flex items-center gap-2"><Users size={16} />{course.studentsCount.toLocaleString("vi-VN")} học viên</span>
                      <span className="flex items-center gap-2"><Clock size={16} />{course.duration}</span>
                      <strong className="text-indigo-700">{formatCurrency(course.price)}</strong>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-500"><span>Hoàn thiện video</span><span>{videos.uploaded}/{videos.total}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${videos.percent}%` }} /></div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link to={`/instructor/courses/${course.id}/edit`}><Button variant="secondary" size="sm"><Edit3 size={14} />Sửa</Button></Link>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(course)}><Trash2 size={14} />Xóa</Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xóa khóa học"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.title}" không?`}
        type="danger"
        confirmText="Xóa"
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
