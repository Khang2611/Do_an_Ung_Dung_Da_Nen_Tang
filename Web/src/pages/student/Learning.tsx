import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
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

  const progress = useMemo(() => Math.round((completed.length / Math.max(course?.lessons.length || 1, 1)) * 100), [completed.length, course]);
  if (error) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!course || !lesson) return <Loading />;

  const markDone = async () => {
    await updateProgress(course.id, lesson.id);
    setCompleted((items) => items.includes(lesson.id) ? items : [...items, lesson.id]);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-slate-950">{course.title}</h2>
        <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-sm text-slate-500">Tiến độ: {progress}%</p>
        <div className="mt-5 space-y-4">
          {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <div className="mb-2 text-sm font-semibold text-slate-900">{chapter.title}</div>
              <div className="space-y-1">
                {chapter.lessons.map((item) => (
                  <button key={item.id} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${lesson.id === item.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`} onClick={() => setLesson(item)}>
                    {completed.includes(item.id) ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                    <span className="min-w-0 flex-1">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid aspect-video place-items-center rounded-xl bg-slate-950 text-white">
          <div className="text-center">
            <PlayCircle className="mx-auto mb-3 h-14 w-14 text-cyan-300" />
            <div className="text-xl font-semibold">Video bài học</div>
            <div className="mt-1 text-sm text-slate-300">Placeholder cho player HLS/video thật</div>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-950">{lesson.title}</h1>
        <p className="mt-3 text-slate-600">{lesson.content || "Nội dung bài học sẽ được hiển thị tại đây."}</p>
        <Button className="mt-6" onClick={markDone}><CheckCircle2 size={18} />Đánh dấu đã học</Button>
      </section>
    </div>
  );
}
