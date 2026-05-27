import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, Edit3, Filter, PlusCircle, Search, Send, Trash2, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteCourse, getCourses, submitCourseForReview } from "../../api/courseApi";
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
import { formatCurrency, formatStatus, getStatusBadgeVariant, normalizeCourseStatus } from "../../utils/format";

function videoStats(course: Course) {
  const lessons = course.lessons?.length ? course.lessons : course.chapters.flatMap((chapter) => chapter.lessons);
  const total = lessons.length;
  const uploaded = lessons.filter((lesson) => lesson.hasVideo || lesson.videoStatus === "ready").length;
  return { total, uploaded, percent: total ? Math.round((uploaded / total) * 100) : 0 };
}

export function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["all", ...Array.from(new Set(courses.map((course) => course.category)))], [courses]);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return courses.filter((course) => {
      const status = normalizeCourseStatus(course.status);
      const matchSearch = !keyword || `${course.title} ${course.description}`.toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" || status === statusFilter;
      const matchCategory = categoryFilter === "all" || course.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [courses, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const byStatus = (status: string) => courses.filter((course) => normalizeCourseStatus(course.status) === status).length;
    return {
      total: courses.length,
      approved: byStatus("approved"),
      pending: byStatus("pending_review"),
      draft: byStatus("draft"),
      rejected: byStatus("rejected"),
      students: courses.reduce((sum, course) => sum + course.studentsCount, 0),
    };
  }, [courses]);

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

  const submitReview = async (course: Course) => {
    try {
      await submitCourseForReview(course.id);
      setCourses((items) => items.map((item) => (item.id === course.id ? { ...item, status: "PENDING_REVIEW" } : item)));
      showToast("Đã gửi khóa học chờ duyệt.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể gửi duyệt.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa học của tôi"
        description="Quản lý khóa học, bài học, video và trạng thái xuất bản."
        action={<Link to="/instructor/courses/create"><Button><PlusCircle size={18} />Tạo khóa học</Button></Link>}
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Tổng khóa học" value={stats.total} icon={<BookOpen size={20} />} />
        <StatCard label="Đã xuất bản" value={stats.approved} icon={<BookOpen size={20} />} tone="emerald" />
        <StatCard label="Chờ duyệt" value={stats.pending} icon={<Send size={20} />} tone="amber" />
        <StatCard label="Bản nháp" value={stats.draft} icon={<Edit3 size={20} />} tone="sky" />
        <StatCard label="Bị từ chối" value={stats.rejected} icon={<Trash2 size={20} />} tone="rose" />
        <StatCard label="Tổng học viên" value={stats.students.toLocaleString("vi-VN")} icon={<Users size={20} />} tone="indigo" />
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md flex-1"><Input icon={<Search size={16} />} placeholder="Tìm theo tên khóa học..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-500"><Filter size={16} />Lọc</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Đã xuất bản</option>
            <option value="pending_review">Chờ duyệt</option>
            <option value="draft">Bản nháp</option>
            <option value="rejected">Bị từ chối</option>
          </select>
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
            const status = normalizeCourseStatus(course.status);
            const videos = videoStats(course);
            return (
              <article key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <img src={course.thumbnail} alt={course.title} className="h-full min-h-56 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(status)}>{formatStatus(status)}</Badge>
                      <Badge variant="slate">{course.category}</Badge>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-xl font-extrabold text-slate-950">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>
                    {status === "rejected" && <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Lý do từ chối demo: cần bổ sung video và mô tả bài học.</div>}
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
                      <Link to={`/instructor/courses/${course.id}/lessons`}><Button variant="secondary" size="sm"><BookOpen size={14} />Quản lý bài học</Button></Link>
                      <Link to={`/instructor/courses/${course.id}/lessons`}><Button variant="secondary" size="sm"><Upload size={14} />Upload video</Button></Link>
                      {["draft", "rejected"].includes(status) && <Button size="sm" onClick={() => submitReview(course)}><Send size={14} />Gửi duyệt</Button>}
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
