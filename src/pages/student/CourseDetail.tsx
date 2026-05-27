import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, CheckCircle2, Clock, FileText, Globe2, PlayCircle, Star, UserRound, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { checkMyEnrollment, enrollCourse } from "../../api/enrollmentApi";
import { createPayment } from "../../api/paymentApi";
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        setError("");
        const [courseData, enrolledData] = await Promise.all([getCourseById(id), isAuthenticated ? checkMyEnrollment(id) : Promise.resolve(false)]);
        setCourse(courseData);
        setEnrolled(enrolledData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải chi tiết khóa học.");
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id, isAuthenticated]);

  const lessons = useMemo(() => course?.chapters.flatMap((chapter) => chapter.lessons) || [], [course]);

  if (loading) return <Loading />;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorMessage message={error} /></div>;
  if (!course) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorMessage message="Không tìm thấy khóa học." /></div>;

  const startCourse = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (enrolled) {
      navigate(`/student/learning/${course.id}`);
      return;
    }
    if (course.price > 0) {
      setEnrollError("");
      setActionLoading(true);
      try {
        const payment = await createPayment(course.id, "VNPAY");
        if (payment.paymentUrl || payment.gatewayUrl) {
          window.location.href = payment.paymentUrl || payment.gatewayUrl || "";
          return;
        }
        setEnrollError("Payment gateway chưa trả về URL thanh toán. Kiểm tra service cổng 8090.");
      } catch (err) {
        setEnrollError(err instanceof Error ? err.message : "Không thể tạo giao dịch thanh toán.");
      } finally {
        setActionLoading(false);
      }
      return;
    }

    setEnrollError("");
    setActionLoading(true);
    try {
      await enrollCourse(course.id);
      setEnrolled(true);
      navigate(`/student/learning/${course.id}`);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Không thể đăng ký khóa học.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_390px] lg:items-start">
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="indigo">{course.category}</Badge>
              <Badge>{course.level}</Badge>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">{course.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2"><Star size={17} className="fill-amber-400 text-amber-400" />{course.rating} đánh giá</span>
              <span className="flex items-center gap-2"><Users size={17} />{course.studentsCount.toLocaleString("vi-VN")} học viên</span>
              <span className="flex items-center gap-2"><UserRound size={17} />{course.instructorName}</span>
              <span className="flex items-center gap-2"><Clock size={17} />Cập nhật gần đây</span>
            </div>
          </div>

          <aside className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-slate-950/30">
            <div className="relative aspect-video bg-slate-100">
              <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-slate-950/20">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-indigo-700 shadow-lg"><PlayCircle size={28} /></span>
              </div>
            </div>
            <div className="p-5">
              <div className="text-3xl font-extrabold text-indigo-700">{formatCurrency(course.discountPrice ?? course.price)}</div>
              {course.discountPrice != null && course.discountPrice < course.price && <div className="mt-1 text-sm font-semibold text-slate-400 line-through">{formatCurrency(course.price)}</div>}
              {enrollError && <div className="mt-4"><ErrorMessage title="Không thể đăng ký" message={enrollError} /></div>}
              <Button className="mt-5 h-12 w-full" onClick={startCourse} loading={actionLoading}>
                {enrolled ? "Tiếp tục học" : course.price > 0 ? "Mua khóa học" : "Đăng ký học miễn phí"}
              </Button>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-600" />Truy cập trọn đời</div>
                <div className="flex items-center gap-2"><Award size={17} className="text-emerald-600" />Có chứng chỉ hoàn thành</div>
                <div className="flex items-center gap-2"><Globe2 size={17} className="text-emerald-600" />Học trên web/app</div>
                <div className="flex items-center gap-2"><FileText size={17} className="text-emerald-600" />Tài liệu đi kèm nếu có</div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Bạn sẽ học được gì</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Nắm chắc nền tảng và quy trình thực hành.", "Làm bài học theo lộ trình có thứ tự.", "Theo dõi tiến độ học trong hệ thống.", "Sẵn sàng áp dụng vào dự án thực tế."].map((item) => (
                <div key={item} className="flex gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Nội dung khóa học</h2>
              <span className="text-sm font-semibold text-slate-500">{course.chapters.length} chương · {lessons.length} bài học · {course.duration}</span>
            </div>
            <div className="mt-5 space-y-4">
              {course.chapters.map((chapter, index) => (
                <div key={chapter.id} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-bold text-slate-900">Chương {index + 1}: {chapter.title}</h3>
                  <div className="mt-3 divide-y divide-slate-100">
                    {chapter.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600">
                        <span className="flex min-w-0 items-center gap-2 font-medium"><PlayCircle size={16} className="shrink-0 text-indigo-600" />{lesson.title}</span>
                        <span className="shrink-0">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Mô tả chi tiết</h2>
            <p className="mt-3 leading-7 text-slate-600">{course.description}</p>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h3 className="font-bold text-slate-950">Thông tin khóa học</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Giảng viên</span><strong className="text-right text-slate-950">{course.instructorName}</strong></div>
            <div className="flex items-center justify-between"><span>Bài học</span><strong className="text-slate-950">{course.totalLessons}</strong></div>
            <div className="flex items-center justify-between"><span>Thời lượng</span><strong className="text-slate-950">{course.duration}</strong></div>
            <div className="flex items-center justify-between"><span>Học viên</span><strong className="text-slate-950">{course.studentsCount.toLocaleString("vi-VN")}</strong></div>
          </div>
          <Link to="/courses" className="mt-5 block">
            <Button variant="secondary" className="w-full">Quay lại danh sách</Button>
          </Link>
        </aside>
      </main>
    </div>
  );
}
