import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Clock, PlayCircle, Star, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { checkMyEnrollment, enrollCourse } from "../../api/enrollmentApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { useAuth } from "../../context/AuthContext";
import type { Course } from "../../types/course";
import { formatCurrency } from "../../utils/format";

export function CourseDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([getCourseById(id), isAuthenticated ? checkMyEnrollment(id) : Promise.resolve(false)])
      .then(([courseData, enrolledData]) => {
        setCourse(courseData);
        setEnrolled(enrolledData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải chi tiết khóa học."));
  }, [id, isAuthenticated]);

  if (error) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!course) return <Loading />;

  const enroll = async () => {
    if (!isAuthenticated) return navigate("/login");
    setEnrollError("");
    try {
      await enrollCourse(course.id);
      setEnrolled(true);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Không thể đăng ký khóa học.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={course.thumbnail} alt={course.title} className="h-80 w-full object-cover" />
            <div className="p-6">
              <div className="flex flex-wrap gap-2"><Badge variant="indigo">{course.category}</Badge><Badge>{course.level}</Badge></div>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">{course.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{course.description}</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <span className="flex items-center gap-2"><Star size={17} className="fill-amber-400 text-amber-400" />{course.rating} đánh giá</span>
                <span className="flex items-center gap-2"><Clock size={17} />{course.duration}</span>
                <span className="flex items-center gap-2"><BookOpen size={17} />{course.totalLessons} bài học</span>
                <span className="flex items-center gap-2"><UserRound size={17} />{course.instructorName}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Nội dung khóa học</h2>
            <div className="mt-4 space-y-4">
              {course.chapters.map((chapter, index) => {
                const totalMinutes = chapter.lessons.reduce((sum, lesson) => sum + (Number(String(lesson.duration).match(/\d+/)?.[0]) || 0), 0);
                return (
                  <div key={chapter.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">Chương {index + 1}: {chapter.title}</h3>
                      <span className="text-sm text-slate-500">{chapter.lessons.length} bài học · {totalMinutes || "Đang cập nhật"} phút</span>
                    </div>
                    <div className="mt-3 divide-y divide-slate-100">
                      {chapter.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600">
                          <span className="flex min-w-0 items-center gap-2"><PlayCircle size={16} className="shrink-0 text-indigo-600" />{lesson.title}</span>
                          <span className="shrink-0">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="rounded-2xl bg-indigo-50 p-5">
            <div className="text-sm font-medium text-indigo-700">Học phí</div>
            <div className="mt-1 text-3xl font-bold text-indigo-700">{formatCurrency(course.price)}</div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Giảng viên</span><strong className="text-slate-900">{course.instructorName}</strong></div>
            <div className="flex items-center justify-between"><span>Bài học</span><strong className="text-slate-900">{course.totalLessons}</strong></div>
            <div className="flex items-center justify-between"><span>Học viên</span><strong className="text-slate-900">{course.studentsCount.toLocaleString("vi-VN")}</strong></div>
          </div>
          {enrollError && <div className="mt-4"><ErrorMessage title="Đăng ký thất bại" message={enrollError} /></div>}
          <div className="mt-5 space-y-3">
            {enrolled ? <Link to={`/student/learning/${course.id}`}><Button className="w-full"><CheckCircle2 size={18} />Vào học</Button></Link> : <Button className="w-full" onClick={enroll}>Đăng ký khóa học</Button>}
            <Link to="/courses"><Button variant="secondary" className="w-full">Quay lại danh sách</Button></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
