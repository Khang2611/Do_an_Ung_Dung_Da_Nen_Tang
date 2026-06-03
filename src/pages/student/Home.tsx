import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  FileQuestion,
  GraduationCap,
  Headphones,
  Laptop,
  LockKeyhole,
  Mail,
  Map,
  Menu,
  MessageCircle,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courseApi";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { showToast } from "../../components/common/Toast";
import { CourseCard } from "../../components/course/CourseCard";
import { mockUsers } from "../../data/mockData";
import type { Course } from "../../types/course";

type CounselingForm = {
  fullName: string;
  phone: string;
  email: string;
  goal: string;
  course: string;
  timeSlot: string;
};

const problems: Array<[string, string, LucideIcon]> = [
  ["Không biết bắt đầu từ đâu", "Nhiều khóa học nhưng thiếu định hướng khiến bạn mất thời gian chọn sai.", Target],
  ["Học lan man, không có lộ trình", "Không có thứ tự bài học rõ ràng nên dễ bỏ dở giữa chừng.", Map],
  ["Không theo dõi được tiến độ", "Bạn không biết mình đã học đến đâu và còn thiếu phần nào.", BarChart3],
  ["Thiếu bài kiểm tra/thi thử", "Không có dữ liệu để tự đánh giá mức độ hiểu bài.", FileQuestion],
  ["Không được hỗ trợ khi gặp bài khó", "Khi vướng bài tập, bạn cần phản hồi nhanh hơn.", Headphones],
];

const solutions: Array<[string, string, LucideIcon]> = [
  ["Lộ trình học rõ ràng", "Mỗi khóa học được chia thành chương, bài và mục tiêu cụ thể.", Map],
  ["Video bài giảng theo chương", "Học bằng video HLS chất lượng cao, phù hợp backend Spring Boot.", Video],
  ["Quiz sau mỗi bài", "Đánh giá nhanh mức độ hiểu bài sau từng phần học.", FileQuestion],
  ["Theo dõi tiến độ", "Progress cá nhân giúp bạn duy trì nhịp học ổn định.", BarChart3],
  ["Thanh toán và kích hoạt", "Mua khóa học demo tạo enrollment ACTIVE để vào học ngay.", ShieldCheck],
  ["HLS bảo mật", "Video streaming theo JWT/enrollment để bảo vệ nội dung.", LockKeyhole],
];

const tools: Array<[string, LucideIcon]> = [
  ["Công cụ lập kế hoạch học tập", CalendarCheck],
  ["Phòng tự học online", Laptop],
  ["Quiz & bài kiểm tra mô phỏng", FileQuestion],
  ["AI Study Assistant demo", BrainCircuit],
  ["Nhóm hỗ trợ học tập", MessageCircle],
  ["Báo cáo tiến độ cá nhân", BarChart3],
  ["Video HLS bảo mật", LockKeyhole],
  ["Chứng chỉ hoàn thành", Award],
];

const phases = [
  ["Giai đoạn nền tảng", ["Học kiến thức cơ bản", "Xem video bài giảng", "Làm quiz từng bài"]],
  ["Giai đoạn luyện tập", ["Làm bài tập/chuyên đề", "Theo dõi tiến độ", "Sửa lỗi kiến thức"]],
  ["Giai đoạn hoàn thiện", ["Làm bài kiểm tra tổng hợp", "Hoàn thành khóa học", "Nhận chứng chỉ"]],
];

const tracks = ["Frontend Developer", "Backend Developer", "Mobile App Developer", "Fullstack Developer"];

const testimonials = [
  ["Nguyễn Minh Anh", "ReactJS từ cơ bản", "Lộ trình rõ nên mình học đều hơn, biết bài nào cần quay lại để ôn.", 5],
  ["Phạm Gia Bảo", "Spring Boot REST API", "Checkout demo và learning page giúp nhóm mình demo sản phẩm rất mượt.", 5],
  ["Lê Thị Mai", "UI/UX Dashboard", "Giao diện dễ theo dõi, phần tiến độ giúp mình không bị bỏ ngang.", 4.8],
];

const faqs = [
  ["Tôi học trên EduFlow như thế nào?", "Bạn chọn khóa học, thanh toán hoặc đăng ký miễn phí, sau đó học theo danh sách bài học và theo dõi tiến độ."],
  ["Sau khi thanh toán khóa học có được kích hoạt ngay không?", "Trong mock mode, thanh toán demo sẽ tạo enrollment ACTIVE và cho phép vào học ngay."],
  ["Tôi có thể xem video bài học ở đâu?", "Video nằm trong trang learning của từng khóa học và được phát bằng HLS player."],
  ["Nếu chưa mua khóa học có xem được video không?", "Không. Student cần enrollment ACTIVE để vào learning và backend sẽ tiếp tục kiểm tra JWT/enrollment."],
  ["Giảng viên upload video như thế nào?", "Instructor/Admin upload MP4 trong trang sửa khóa học; frontend gửi FormData tới API video upload."],
  ["Có chứng chỉ hoàn thành không?", "EduFlow có thiết kế luồng chứng chỉ demo sau khi hoàn thành khóa học."],
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(3 * 24 * 60 * 60 + 6 * 60 * 60 + 24 * 60 + 18);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CounselingForm>({
    defaultValues: { fullName: "", phone: "", email: "", goal: "", course: "", timeSlot: "" },
  });

  useEffect(() => {
    getCourses().then((items) => setCourses(items.slice(0, 6)));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    return [
      ["Ngày", days],
      ["Giờ", hours],
      ["Phút", minutes],
      ["Giây", seconds],
    ];
  }, [secondsLeft]);

  const instructors = useMemo(
    () =>
      mockUsers
        .filter((user) => String(user.role).toLowerCase() === "instructor")
        .slice(0, 4)
        .map((user, index) => ({
          ...user,
          specialty: ["Frontend & React", "Java Spring Boot", "UI/UX Product Design", "DevOps & Team Workflow"][index] || "Software Engineering",
          years: [8, 10, 7, 6][index] || 5,
          rating: [4.9, 4.8, 4.85, 4.7][index] || 4.8,
        })),
    [],
  );

  const submitCounseling = async (_values: CounselingForm) => {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    showToast("Đã ghi nhận đăng ký tư vấn. EduFlow sẽ liên hệ với bạn.", "success");
    reset();
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 text-left font-extrabold text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BookOpen size={20} /></span>
            EduFlow
          </button>
          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
            {[
              ["Lộ trình", "path"],
              ["Khóa học", "courses"],
              ["Giảng viên", "teachers"],
              ["Học viên chia sẻ", "testimonials"],
              ["Công cụ học tập", "tools"],
              ["Đăng ký tư vấn", "counseling"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="transition hover:text-indigo-700">{label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Đăng nhập</Button></Link>
            <Link to="/register"><Button>Đăng ký</Button></Link>
            <Menu className="lg:hidden" size={22} />
          </div>
        </div>
      </header>

      <section id="hero" className="relative overflow-hidden bg-slate-950 text-white">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80" alt="EduFlow online learning" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950/80" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              {["Nền tảng học trực tuyến", "Lộ trình cá nhân hóa", "Hỗ trợ học tập"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100">{item}</span>
              ))}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">Lộ trình học trực tuyến toàn diện cho sinh viên và người học hiện đại</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Học theo lộ trình, luyện tập bằng bài kiểm tra, theo dõi tiến độ và học video chất lượng cao trên EduFlow.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses"><Button className="h-12 px-6"><Rocket size={18} />Khám phá khóa học</Button></Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              {[["8+", "khóa học"], ["12.000+", "học viên"], ["4.8/5", "đánh giá"], ["100+", "bài học video"]].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white p-5 text-slate-950">
                  <div className="text-3xl font-extrabold text-indigo-700">{value}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="counseling" className="relative z-10 mx-auto -mt-8 max-w-7xl px-4">
        <form onSubmit={handleSubmit(submitCounseling)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 lg:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Đăng ký tư vấn lộ trình miễn phí</h2>
              <p className="mt-1 text-sm text-slate-500">EduFlow sẽ liên hệ tư vấn lộ trình học phù hợp.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Phản hồi trong 24h demo</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Họ tên" icon={<UserRound size={16} />} error={errors.fullName?.message} {...register("fullName", { required: "Vui lòng nhập họ tên." })} />
            <Input label="Số điện thoại" icon={<Phone size={16} />} error={errors.phone?.message} {...register("phone", { required: "Vui lòng nhập số điện thoại." })} />
            <Input label="Email" type="email" icon={<Mail size={16} />} error={errors.email?.message} {...register("email", { required: "Vui lòng nhập email.", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không đúng định dạng." } })} />
            <Input label="Mục tiêu học tập" icon={<Target size={16} />} error={errors.goal?.message} {...register("goal", { required: "Vui lòng nhập mục tiêu." })} />
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600" {...register("course", { required: true })}>
              <option value="">Khóa học quan tâm</option>
              {courses.slice(0, 6).map((course) => <option key={course.id} value={course.title}>{course.title}</option>)}
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600" {...register("timeSlot", { required: true })}>
              <option value="">Khung giờ liên hệ</option>
              <option>8h - 12h</option>
              <option>12h - 16h</option>
              <option>16h - 20h</option>
              <option>20h - 21h</option>
            </select>
          </div>
          <Button className="mt-5 h-12 w-full md:w-auto" loading={isSubmitting}>Đăng ký tư vấn</Button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Thực tế khi tự học" title="Bạn đang gặp khó khăn khi tự học online?" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {problems.map(([title, desc, Icon]) => (
            <InfoCard key={String(title)} icon={Icon} title={String(title)} desc={String(desc)} tone="warning" />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="Giải pháp" title="EduFlow giúp bạn học có chiến lược hơn" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map(([title, desc, Icon]) => (
              <InfoCard key={String(title)} icon={Icon} title={String(title)} desc={String(desc)} />
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Công cụ học tập độc quyền" title="Một hệ sinh thái hỗ trợ học từ đăng ký đến hoàn thành" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(([title, Icon]) => (
            <div key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <Icon className="h-8 w-8 text-indigo-700" />
              <h3 className="mt-4 font-bold text-slate-950">{String(title)}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="path" className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="Lộ trình học theo giai đoạn" title="3 giai đoạn giúp bạn học chắc và hoàn thành khóa học" dark />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {phases.map(([title, items], index) => (
              <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/10 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-xl font-extrabold text-slate-950">{index + 1}</div>
                <h3 className="mt-5 text-xl font-bold">{String(title)}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {(items as string[]).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {tracks.map((track) => <span key={track} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">{track}</span>)}
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow="Khóa học nổi bật" title="Chọn khóa học và bắt đầu lộ trình của bạn" />
          <Link to="/courses"><Button variant="secondary">Xem tất cả khóa học</Button></Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section id="teachers" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="Giảng viên nổi bật" title="Đồng hành cùng đội ngũ giảng viên thực chiến" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {instructors.map((teacher) => (
              <div key={teacher.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <img src={teacher.avatar} alt={teacher.fullName} className="h-20 w-20 rounded-2xl object-cover" />
                <h3 className="mt-4 font-extrabold text-slate-950">{teacher.fullName}</h3>
                <p className="mt-1 text-sm font-semibold text-indigo-700">{teacher.specialty}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-500">
                  <div><strong className="block text-base text-slate-950">{teacher.years}+</strong>năm</div>
                  <div><strong className="block text-base text-slate-950">{teacher.teachingCourses || 2}</strong>khóa</div>
                  <div><strong className="block text-base text-slate-950">{teacher.rating}</strong>rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Học viên chia sẻ" title="Kết quả đến từ việc học đều và đúng lộ trình" />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map(([name, course, text, rating], index) => (
            <div key={String(name)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={mockUsers[index + 1]?.avatar} alt={String(name)} className="h-12 w-12 rounded-2xl object-cover" />
                <div><div className="font-bold text-slate-950">{String(name)}</div><div className="text-xs font-semibold text-slate-500">{String(course)}</div></div>
              </div>
              <p className="mt-4 leading-7 text-slate-600">"{String(text)}"</p>
              <div className="mt-4 flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" />{String(rating)}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-indigo-600 p-6 text-white">
          <div className="grid gap-4 md:grid-cols-3">
            {[["Top hoàn thành nhiều bài nhất", "Nguyễn Minh Anh", Trophy], ["Top tiến độ cao nhất", "Lê Thị Mai", Timer], ["Top học đều nhất", "Phạm Gia Bảo", Sparkles]].map(([label, name, Icon]) => (
              <div key={String(label)} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Icon className="h-8 w-8 text-cyan-200" />
                <div><div className="text-sm text-indigo-100">{String(label)}</div><div className="font-bold">{String(name)}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-indigo-700 to-cyan-700 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">Ưu đãi khóa học tháng này</p>
            <h2 className="mt-3 text-4xl font-extrabold">Giảm đến 40% cho khóa học đầu tiên</h2>
            <p className="mt-4 max-w-2xl text-indigo-50">Tặng quyền truy cập phòng tự học online và bộ quiz mô phỏng. Chỉ còn 19 suất ưu đãi demo.</p>
            <Button className="mt-6 bg-white text-indigo-700 hover:bg-slate-100" onClick={() => scrollTo("counseling")}>Nhận ưu đãi</Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {countdown.map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl bg-white p-4 text-center text-slate-950">
                <div className="text-3xl font-extrabold text-indigo-700">{String(value).padStart(2, "0")}</div>
                <div className="mt-1 text-xs font-bold uppercase text-slate-500">{String(label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <SectionTitle eyebrow="FAQ" title="Câu hỏi thường gặp" center />
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer], index) => (
            <button key={question} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
              <div className="flex items-center justify-between gap-4 font-bold text-slate-950">{question}<ChevronDown className={`h-5 w-5 transition ${openFaq === index ? "rotate-180" : ""}`} /></div>
              {openFaq === index && <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>}
            </button>
          ))}
        </div>
      </section>

      <footer className="bg-slate-950 py-10 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600"><BookOpen size={20} /></span>EduFlow</div>
            <p className="mt-4 max-w-md text-sm leading-6">Nền tảng học trực tuyến hỗ trợ lộ trình, thanh toán demo, enrollment ACTIVE, video HLS và quản trị khóa học.</p>
            <p className="mt-4 text-sm">Email: support@eduflow.demo · Hotline: 1900 0000</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Chính sách</h3>
            <div className="mt-3 grid gap-2 text-sm">
              {["Chính sách bảo mật", "Điều khoản sử dụng", "Hướng dẫn mua khóa học", "Hướng dẫn kích hoạt khóa học", "Chính sách hoàn tiền demo"].map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white">Kết nối</h3>
            <div className="mt-3 grid gap-2 text-sm"><span>Facebook</span><span>YouTube</span><span>Community</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title, dark = false, center = false }: { eyebrow: string; title: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className={`text-sm font-bold uppercase tracking-[0.14em] ${dark ? "text-cyan-200" : "text-indigo-700"}`}>{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-3xl font-extrabold leading-tight md:text-4xl ${dark ? "text-white" : "text-slate-950"} ${center ? "mx-auto" : ""}`}>{title}</h2>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc, tone = "default" }: { icon: LucideIcon; title: string; desc: string; tone?: "default" | "warning" }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tone === "warning" ? "border-amber-100 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <Icon className={`h-8 w-8 ${tone === "warning" ? "text-amber-600" : "text-indigo-700"}`} />
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}
