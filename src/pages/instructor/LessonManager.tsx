import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, FileVideo, Trash2, Upload } from "lucide-react";
import { useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { UploadVideoModal } from "../../components/video/UploadVideoModal";
import { LessonVideoPlayer } from "../../components/video/LessonVideoPlayer";
import type { Course, Lesson } from "../../types/course";
import { formatStatus, getStatusBadgeVariant, normalizeCourseStatus } from "../../utils/format";

function videoBadge(lesson: Lesson) {
  const status = lesson.videoStatus || (lesson.hasVideo ? "ready" : "missing");
  if (status === "ready") return <Badge variant="success">Đã sẵn sàng</Badge>;
  if (status === "processing") return <Badge variant="warning">Đang xử lý</Badge>;
  if (status === "error") return <Badge variant="danger">Lỗi xử lý</Badge>;
  return <Badge variant="slate">Chưa có video</Badge>;
}

export function LessonManager() {
  const { courseId = "" } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const [uploadLesson, setUploadLesson] = useState<Lesson | null>(null);
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    getCourseById(courseId).then(setCourse).catch((err) => setError(err instanceof Error ? err.message : "Không thể tải khóa học."));
  }, [courseId]);

  const stats = useMemo(() => {
    const lessons = course?.chapters.flatMap((chapter) => chapter.lessons) || [];
    return {
      total: lessons.length,
      uploaded: lessons.filter((lesson) => lesson.hasVideo || lesson.videoStatus === "ready").length,
    };
  }, [course]);

  if (error) return <ErrorMessage message={error} />;
  if (!course) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Bài học / Video" description="Quản lý bài học, trạng thái video và upload MP4 cho từng lesson." />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
          <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-2xl object-cover" />
          <div>
            <Badge variant={getStatusBadgeVariant(normalizeCourseStatus(course.status))}>{formatStatus(normalizeCourseStatus(course.status))}</Badge>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-950">{course.title}</h1>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              <span>{stats.total} bài học</span>
              <span>{stats.uploaded} video đã upload</span>
              <span>{course.chapters.length} chương</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {course.chapters.map((chapter, chapterIndex) => (
          <div key={chapter.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Chương {chapterIndex + 1}: {chapter.title}</h2>
              <Badge>{chapter.lessons.length} bài</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {chapter.lessons.map((lesson) => (
                <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileVideo size={17} className="text-indigo-600" />
                      <h3 className="font-bold text-slate-950">{lesson.title}</h3>
                      {lesson.isPreview && <Badge variant="indigo">Học thử</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{lesson.duration} · {lesson.content || lesson.description || "Chưa có mô tả"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {videoBadge(lesson)}
                    <Button variant="secondary" size="sm" onClick={() => setUploadLesson(lesson)}><Upload size={14} />Upload video</Button>
                    <Button variant="secondary" size="sm" disabled={!lesson.videoUrl} onClick={() => setPreviewLesson(lesson)}><Eye size={14} />Xem thử</Button>
                    <Button variant="ghost" size="sm"><Edit3 size={14} />Sửa</Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteLesson(lesson)}><Trash2 size={14} />Xóa</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <UploadVideoModal
        isOpen={Boolean(uploadLesson)}
        lessonId={uploadLesson?.id || ""}
        lessonTitle={uploadLesson?.title || ""}
        onClose={() => setUploadLesson(null)}
        onUploaded={(videoUrl) => {
          setCourse((current) => current && {
            ...current,
            chapters: current.chapters.map((chapter) => ({
              ...chapter,
              lessons: chapter.lessons.map((lesson) => lesson.id === uploadLesson?.id ? { ...lesson, videoUrl, hasVideo: true, videoStatus: "ready" } : lesson),
            })),
          });
        }}
      />
      {previewLesson?.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setPreviewLesson(null)} />
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl">
            <button className="absolute right-4 top-4 z-10 rounded-lg bg-white/90 p-1.5 text-slate-500 shadow hover:text-slate-900" onClick={() => setPreviewLesson(null)}>
              ×
            </button>
            <LessonVideoPlayer lessonId={previewLesson.id} videoUrl={previewLesson.videoUrl} title={previewLesson.title} />
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteLesson)}
        title="Xóa bài học"
        message={`Bạn có chắc muốn xóa "${deleteLesson?.title}" không? Đây là thao tác mock trong giao diện.`}
        type="danger"
        confirmText="Xóa"
        onConfirm={() => setDeleteLesson(null)}
        onCancel={() => setDeleteLesson(null)}
      />
    </div>
  );
}
