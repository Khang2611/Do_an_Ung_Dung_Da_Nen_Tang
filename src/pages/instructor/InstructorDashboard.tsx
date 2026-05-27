import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, BookOpen, CheckCircle2, Clock, FileVideo, GraduationCap, Layers, PlusCircle, Send, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import type { Course } from "../../types/course";
import { formatStatus, getStatusBadgeVariant, normalizeCourseStatus } from "../../utils/format";

function getVideoStats(course: Course) {
  const lessons = course.lessons?.length ? course.lessons : course.chapters.flatMap((chapter) => chapter.lessons);
  return {
    total: lessons.length,
    uploaded: lessons.filter((lesson) => lesson.hasVideo || lesson.videoStatus === "ready").length,
  };
}

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const stats = useMemo(() => {
    const byStatus = (status: string) => courses.filter((course) => normalizeCourseStatus(course.status) === status).length;
    const videos = courses.reduce((sum, course) => sum + getVideoStats(course).uploaded, 0);
    return {
      total: courses.length,
      approved: byStatus("approved"),
      pending: byStatus("pending_review"),
      draft: byStatus("draft"),
      students: courses.reduce((sum, course) => sum + course.studentsCount, 0),
      lessons: courses.reduce((sum, course) => sum + course.totalLessons, 0),
      videos,
    };
  }, [courses]);

  const pendingCourses = courses.filter((course) => normalizeCourseStatus(course.status) === "pending_review");
  const draftCourses = courses.filter((course) => normalizeCourseStatus(course.status) === "draft");
  const missingVideoCourses = courses.filter((course) => {
    const videos = getVideoStats(course);
    return videos.uploaded < videos.total;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan giảng viên"
        description="Theo dõi khóa học, học viên và trạng thái nội dung của bạn."
        action={<Link to="/instructor/courses/create"><Button><PlusCircle size={18} />Tạo khóa học</Button></Link>}
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Tổng khóa học" value={stats.total} icon={<BookOpen size={20} />} />
        <StatCard label="Đã xuất bản" value={stats.approved} icon={<CheckCircle2 size={20} />} tone="emerald" />
        <StatCard label="Chờ duyệt" value={stats.pending} icon={<Send size={20} />} tone="amber" />
        <StatCard label="Bản nháp" value={stats.draft} icon={<Clock size={20} />} tone="sky" />
        <StatCard label="Tổng học viên" value={stats.students.toLocaleString("vi-VN")} icon={<GraduationCap size={20} />} tone="indigo" />
        <StatCard label="Bài học/video" value={`${stats.lessons}/${stats.videos}`} icon={<Layers size={20} />} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Khóa học gần đây</h2>
            <Link to="/instructor/courses" className="text-sm font-bold text-indigo-700">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => {
              const videos = getVideoStats(course);
              return (
                <div key={course.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={course.thumbnail} alt={course.title} className="h-14 w-20 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-950">{course.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">{course.totalLessons} bài · {videos.uploaded}/{videos.total} video</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(normalizeCourseStatus(course.status))}>{formatStatus(normalizeCourseStatus(course.status))}</Badge>
                    <Link to={`/instructor/courses/${course.id}/edit`}><Button size="sm" variant="secondary">Sửa</Button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Việc cần làm</h2>
          <div className="mt-4 space-y-3">
            <Todo icon={AlertCircle} label="Hoàn thiện khóa học bản nháp" value={`${draftCourses.length} khóa`} />
            <Todo icon={Upload} label="Upload video cho bài học còn thiếu" value={`${missingVideoCourses.length} khóa`} />
            <Todo icon={Send} label="Gửi khóa học chờ duyệt" value={`${draftCourses.length} khóa`} />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Nội dung chờ duyệt</h2>
          <div className="mt-4 space-y-3">
            {pendingCourses.length ? pendingCourses.slice(0, 4).map((course) => (
              <div key={course.id} className="flex items-center justify-between rounded-2xl bg-amber-50 p-3">
                <div className="font-semibold text-slate-900">{course.title}</div>
                <Badge variant="warning">Chờ duyệt</Badge>
              </div>
            )) : <p className="text-sm text-slate-500">Không có nội dung đang chờ duyệt.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Hoạt động gần đây</h2>
          <div className="mt-4 space-y-4">
            <Activity icon={FileVideo} title="Cập nhật video bài học" time="Hôm nay" />
            <Activity icon={BookOpen} title="Chỉnh sửa nội dung khóa ReactJS" time="1 ngày trước" />
            <Activity icon={Send} title="Gửi khóa học UI/UX chờ duyệt" time="3 ngày trước" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Todo({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={18} /></span>
        <span className="font-semibold text-slate-700">{label}</span>
      </div>
      <strong className="text-slate-950">{value}</strong>
    </div>
  );
}

function Activity({ icon: Icon, title, time }: { icon: LucideIcon; title: string; time: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon size={17} /></span>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{time}</div>
      </div>
    </div>
  );
}
