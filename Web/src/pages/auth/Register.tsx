import { BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, UserRound, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

type RegisterForm = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "student" | "instructor";
};

export function Register() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: { fullName: "", email: "", username: "", password: "", confirmPassword: "", role: "student" },
    mode: "onBlur",
  });

  const submit = async ({ confirmPassword, ...values }: RegisterForm) => {
    void confirmPassword;
    try {
      await registerAccount(values);
      navigate("/login");
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Đăng ký thất bại." });
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
        <Link className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900" to="/login">
          Quay về đăng nhập
        </Link>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-92px)] items-center justify-center px-4 pb-10 sm:px-6">
        <form
          onSubmit={handleSubmit(submit)}
          className="w-full max-w-4xl rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur sm:p-8 lg:p-10"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
              <GraduationCap size={17} />
              EduFlow
            </div>
            <h1 className="text-3xl font-bold text-slate-950">Tạo tài khoản EduFlow</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Bắt đầu học tập hoặc giảng dạy trên nền tảng EduFlow.</p>
          </div>

          {errors.root?.message && <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Họ tên"
              placeholder="Nhập họ tên"
              autoComplete="name"
              icon={<UserRound size={17} />}
              error={errors.fullName?.message}
              {...register("fullName", { required: "Vui lòng nhập họ tên." })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Nhập email"
              autoComplete="email"
              icon={<Mail size={17} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Vui lòng nhập email.",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không đúng định dạng." },
              })}
            />
            <Input
              label="Username"
              placeholder="Nhập username"
              autoComplete="username"
              icon={<UserRound size={17} />}
              error={errors.username?.message}
              {...register("username", { required: "Vui lòng nhập username." })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <UsersRound size={17} />
                </span>
                <select
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                  {...register("role", { required: "Vui lòng chọn vai trò." })}
                >
                  <option value="student">Người học</option>
                  <option value="instructor">Giảng viên</option>
                </select>
              </span>
              {errors.role?.message && <span className="mt-1 block text-sm text-rose-600">{errors.role.message}</span>}
            </label>
            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
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
            <Input
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              icon={<LockKeyhole size={17} />}
              error={errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu.",
                validate: (value) => value === watch("password") || "Mật khẩu xác nhận không khớp.",
              })}
            />
          </div>

          <Button
            className="mt-7 h-12 w-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm hover:from-indigo-700 hover:to-violet-700 hover:shadow-md md:col-span-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
