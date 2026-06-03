import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { getCompletedLessonIds, getMyEnrollment, updateProgress } from "../../api/enrollmentApi";
import { getLessonResources } from "../../api/resourceApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { LessonVideoPlayer } from "../../components/video/LessonVideoPlayer";
import type { Course, Lesson, LessonResource } from "../../types/course";

function hasHlsVideo(lesson: Lesson) {
  return Boolean(lesson.videoUrl && lesson.videoUrl.endsWith(".m3u8"));
}

export function Learning() {
  const { courseId = "", lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLearning() {
      try {
        const [, item, completedLessonIds] = await Promise.all([
          getMyEnrollment(courseId),
          getCourseById(courseId),
          getCompletedLessonIds(courseId),
        ]);
        setCourse(item);
        setLesson(item.lessons.find((entry) => entry.id === lessonId) || item.lessons[0]);
        setCompleted(completedLessonIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải bài học.");
      }
    }
    loadLearning();
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!lesson?.id) {
      setResources([]);
      return;
    }
    getLessonResources(lesson.id).then(setResources).catch(() => setResources([]));
  }, [lesson?.id]);

  const currentIndex = useMemo(() => course?.lessons.findIndex((item) => item.id === lesson?.id) ?? -1, [course, lesson]);
  const progress = useMemo(() => Math.round((completed.length / Math.max(course?.lessons.length || 1, 1)) * 100), [completed.length, course]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorMessage title="Không thể vào học" message={error} />
        <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>Xem thông tin khóa học</Button>
      </div>
    );
  }
  if (!course || !lesson) return <Loading />;

  const markDone = async () => {
    await updateProgress(course.id, lesson.id);
    setCompleted((items) => (items.includes(lesson.id) ? items : [...items, lesson.id]));
  };

  const goTo = (index: number) => {
    const next = course.lessons[index];
    if (!next) return;
    setLesson(next);
    navigate(`/student/learning/${course.id}/lesson/${next.id}`);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[340px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-bold leading-6 text-slate-950">{course.title}</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Tiến độ</span>
          <strong>{progress}%</strong>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-100">
          <div className="h-2.5 rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 space-y-5">
          {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <div className="mb-2 text-sm font-semibold text-slate-900">{chapter.title}</div>
              <div className="space-y-1">
                {chapter.lessons.map((item) => {
                  const index = course.lessons.findIndex((entry) => entry.id === item.id);
                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${lesson.id === item.id ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100" : "hover:bg-slate-50"}`}
                      onClick={() => goTo(index)}
                    >
                      {completed.includes(item.id) ? <CheckCircle2 size={17} className="text-emerald-600" /> : <PlayCircle size={17} />}
                      <span className="min-w-0 flex-1">{item.title}</span>
                      <span className="text-xs text-slate-400">{item.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {hasHlsVideo(lesson) ? (
          <LessonVideoPlayer lessonId={lesson.id} videoUrl={lesson.videoUrl} title={lesson.title} />
        ) : (
          <div className="grid aspect-video place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div>
              <PlayCircle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-950">Bài học chưa có video HLS</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Giảng viên cần upload video MP4 để hệ thống tạo playlist HLS bảo mật.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-700">Bài {currentIndex + 1}/{course.lessons.length}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{lesson.title}</h1>
          </div>
          <Button onClick={markDone}><CheckCircle2 size={18} />Đánh dấu đã học</Button>
        </div>
        <p className="mt-4 leading-7 text-slate-600">{lesson.content || "Nội dung bài học sẽ được hiển thị tại đây."}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 font-bold text-slate-950"><FileText size={18} />Tài liệu bài học</div>
          {resources.length ? (
            <div className="mt-3 space-y-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  <span className="min-w-0 truncate">{resource.name}</span>
                  <span className="shrink-0 text-xs uppercase text-slate-400">{resource.type || "FILE"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Chưa có tài liệu đính kèm cho bài học này.</p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" disabled={currentIndex <= 0} onClick={() => goTo(currentIndex - 1)}><ChevronLeft size={18} />Bài trước</Button>
          <Button type="button" variant="secondary" disabled={currentIndex >= course.lessons.length - 1} onClick={() => goTo(currentIndex + 1)}>Bài tiếp<ChevronRight size={18} /></Button>
        </div>
      </section>
    </div>
  );
}
