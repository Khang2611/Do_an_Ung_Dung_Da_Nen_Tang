import { BookOpen, CheckCircle2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import type { LoginPayload } from "../../types/auth";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({ defaultValues: { username: "", password: "" } });

  const submit = async (values: LoginPayload) => {
    try {
      const path = await login(values);
      navigate(path, { replace: true });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Đăng nhập thất bại." });
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_85%_30%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><BookOpen /></span>
            EduFlow
          </Link>
        </div>
        <div className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-indigo-50 ring-1 ring-white/20">
            <Sparkles size={16} /> Hệ thống quản lý khóa học online
          </div>
          <h1 className="text-5xl font-bold leading-tight">Nền tảng học tập trực tuyến cho người học, giảng viên và quản trị viên.</h1>
          <div className="mt-8 grid gap-3 text-indigo-50">
            {["Học mọi lúc, mọi nơi", "Theo dõi tiến độ học tập", "Quản lý khóa học dễ dàng"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <CheckCircle2 size={18} className="text-emerald-200" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-7 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-slate-950"><BookOpen className="text-indigo-600" /> EduFlow</Link>
          </div>
          <h2 className="text-2xl font-bold text-slate-950">Đăng nhập</h2>
          <p className="mt-2 text-sm text-slate-500">Nhập username/email và mật khẩu để vào hệ thống.</p>
          {errors.root?.message && <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>}
          <div className="mt-6 space-y-4">
            <Input
              label="Username hoặc email"
              placeholder="admin"
              icon={<Mail size={17} />}
              error={errors.username?.message}
              {...register("username", { required: "Vui lòng nhập username hoặc email." })}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              icon={<LockKeyhole size={17} />}
              error={errors.password?.message}
              {...register("password", { required: "Vui lòng nhập mật khẩu.", minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự." } })}
            />
          </div>
          <Button className="mt-6 w-full" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
          <p className="mt-5 text-center text-sm text-slate-600">
            Chưa có tài khoản? <Link className="font-semibold text-indigo-700 hover:text-indigo-800" to="/register">Đăng ký</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
