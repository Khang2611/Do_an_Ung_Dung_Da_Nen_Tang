import { BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Mail } from "lucide-react";
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
    } catch {
      setError("root", { message: "Sai username/email hoặc mật khẩu." });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-80 w-80 rounded-full bg-violet-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-7rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-3 text-xl font-bold text-slate-950">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <BookOpen size={22} />
          </span>
          EduFlow
        </Link>
        <Link className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900" to="/register">
          Tạo tài khoản
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-92px)] items-center justify-center px-4 pb-10 sm:px-6">
        <form
          onSubmit={handleSubmit(submit)}
          className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl shadow-indigo-950/10 backdrop-blur sm:p-10"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
              <GraduationCap size={17} />
              EduFlow
            </div>
            <h1 className="text-3xl font-bold text-slate-950">Đăng nhập</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Tiếp tục học tập và quản lý khóa học của bạn.</p>
          </div>

          {errors.root?.message && <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>}

          <div className="space-y-4">
            <Input
              label="Username hoặc email"
              placeholder="Nhập username hoặc email"
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

          <Button className="mt-6 h-12 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to="/register">
              Đăng ký
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
