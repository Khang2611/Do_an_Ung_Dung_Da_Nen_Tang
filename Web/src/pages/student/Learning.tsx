import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { checkMyEnrollment, updateProgress } from "../../api/enrollmentApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import type { Course, Lesson } from "../../types/course";

export function Learning() {
  const { courseId = "" } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    checkMyEnrollment(courseId)
      .then((enrolled) => {
        if (!enrolled) {
          navigate(`/courses/${courseId}`, { replace: true });
          return null;
        }
        return getCourseById(courseId);
      })
      .then((item) => {
        if (!item) return;
        setCourse(item);
        setLesson(item.lessons[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải bài học."));
  }, [courseId, navigate]);

  const currentIndex = useMemo(() => course?.lessons.findIndex((item) => item.id === lesson?.id) ?? -1, [course, lesson]);
  const progress = useMemo(() => Math.round((completed.length / Math.max(course?.lessons.length || 1, 1)) * 100), [completed.length, course]);
  if (error) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!course || !lesson) return <Loading />;

  const markDone = async () => {
    await updateProgress(course.id, lesson.id);
    setCompleted((items) => items.includes(lesson.id) ? items : [...items, lesson.id]);
  };

  const goTo = (index: number) => {
    const next = course.lessons[index];
    if (next) setLesson(next);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[340px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-bold leading-6 text-slate-950">{course.title}</h2>
        <div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">Tiến độ</span><strong>{progress}%</strong></div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="mt-5 space-y-5">
          {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <div className="mb-2 text-sm font-semibold text-slate-900">{chapter.title}</div>
              <div className="space-y-1">
                {chapter.lessons.map((item) => (
                  <button key={item.id} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${lesson.id === item.id ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100" : "hover:bg-slate-50"}`} onClick={() => setLesson(item)}>
                    {completed.includes(item.id) ? <CheckCircle2 size={17} className="text-emerald-600" /> : <PlayCircle size={17} />}
                    <span className="min-w-0 flex-1">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
              <PlayCircle className="h-12 w-12 text-indigo-200" />
            </div>
            <div className="text-xl font-semibold">Video bài học</div>
            <div className="mt-1 text-sm text-slate-300">Khu vực phát video bài học</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-700">Bài {currentIndex + 1}/{course.lessons.length}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{lesson.title}</h1>
          </div>
          <Button onClick={markDone}><CheckCircle2 size={18} />Đánh dấu đã học</Button>
        </div>
        <p className="mt-4 leading-7 text-slate-600">{lesson.content || "Nội dung bài học sẽ được hiển thị tại đây."}</p>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" disabled={currentIndex <= 0} onClick={() => goTo(currentIndex - 1)}><ChevronLeft size={18} />Bài trước</Button>
          <Button type="button" variant="secondary" disabled={currentIndex >= course.lessons.length - 1} onClick={() => goTo(currentIndex + 1)}>Bài tiếp<ChevronRight size={18} /></Button>
        </div>
      </section>
    </div>
  );
}
