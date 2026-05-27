import { BookOpen, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import type { LoginPayload } from "../../types/auth";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
  });

  const submit = async (values: LoginPayload) => {
    try {
      const path = await login(values);
      navigate(path, { replace: true });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Sai username/email hoặc mật khẩu." });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative w-full max-w-md">
        <form onSubmit={handleSubmit(submit)} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/80 backdrop-blur sm:p-8">
          <div className="text-center">
            <Link to="/" className="mx-auto inline-flex items-center gap-3 text-xl font-extrabold text-slate-950">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
                <BookOpen size={22} />
              </span>
              EduFlow
            </Link>
            <h1 className="mt-7 text-2xl font-extrabold text-slate-950">Đăng nhập EduFlow</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Tiếp tục học tập và quản lý khóa học của bạn.</p>
          </div>

          {errors.root?.message && <div className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errors.root.message}</div>}

          <div className="mt-6 space-y-4">
            <Input
              label="Username hoặc email"
              placeholder="student, instructor, admin"
              autoComplete="username"
              icon={<Mail size={17} />}
              error={errors.username?.message}
              {...register("username", { required: "Vui lòng nhập username hoặc email." })}
            />
            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              icon={<LockKeyhole size={17} />}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register("password", {
                required: "Vui lòng nhập mật khẩu.",
                minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự." },
              })}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 font-medium text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Ghi nhớ đăng nhập
            </label>
            <button type="button" className="font-semibold text-indigo-700 hover:text-indigo-900">Quên mật khẩu?</button>
          </div>

          <Button className="mt-6 h-12 w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700" disabled={isSubmitting} loading={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to="/register">
              Đăng ký
            </Link>
          </p>
        </form>
        <p className="mt-5 text-center text-xs font-medium text-slate-500">© 2026 EduFlow. Nền tảng học trực tuyến.</p>
      </div>
    </div>
  );
}
