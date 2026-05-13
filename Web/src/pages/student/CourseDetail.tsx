import { useEffect, useState } from "react";
import { BookOpen, Clock, Star, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { checkMyEnrollment, enrollCourse } from "../../api/enrollmentApi";
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
          <img src={course.thumbnail} alt={course.title} className="h-80 w-full rounded-2xl object-cover" />
          <div className="mt-6">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{course.category}</span>
            <h1 className="mt-4 text-4xl font-bold text-slate-950">{course.title}</h1>
            <p className="mt-4 text-lg text-slate-600">{course.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1"><Star size={16} className="text-amber-500" />{course.rating} đánh giá</span>
              <span className="flex items-center gap-1"><Clock size={16} />{course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={16} />{course.totalLessons} bài học</span>
              <span className="flex items-center gap-1"><UserRound size={16} />{course.instructorName}</span>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-950">Nội dung khóa học</h2>
            <div className="mt-4 space-y-4">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">{chapter.title}</h3>
                  <div className="mt-3 space-y-2">
                    {chapter.lessons.map((lesson) => <div key={lesson.id} className="flex items-center justify-between text-sm text-slate-600"><span>{lesson.title}</span><span>{lesson.duration}</span></div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="text-3xl font-bold text-indigo-700">{formatCurrency(course.price)}</div>
          <p className="mt-3 text-sm text-slate-600">Giảng viên: <strong>{course.instructorName}</strong></p>
          {enrollError && <div className="mt-4"><ErrorMessage title="Đăng ký thất bại" message={enrollError} /></div>}
          <div className="mt-5 space-y-3">
            {enrolled ? <Link to={`/student/learning/${course.id}`}><Button className="w-full">Vào học</Button></Link> : <Button className="w-full" onClick={enroll}>Đăng ký khóa học</Button>}
            <Link to="/courses"><Button variant="secondary" className="w-full">Quay lại danh sách</Button></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
