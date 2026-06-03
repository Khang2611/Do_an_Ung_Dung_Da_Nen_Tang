import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
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
    defaultValues: { fullName: "", email: "", username: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const submit = async ({ confirmPassword, ...values }: RegisterForm) => {
    void confirmPassword;
    try {
      await registerAccount({ ...values, role: "STUDENT" });
      navigate("/login", { replace: true });
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Đăng ký thất bại." });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />

      <div className="relative w-full max-w-xl">
        <form onSubmit={handleSubmit(submit)} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/80 backdrop-blur sm:p-8">
          <div className="text-center">
            <Link to="/" className="mx-auto inline-flex items-center gap-3 text-xl font-extrabold text-slate-950">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
                <BookOpen size={22} />
              </span>
              EduFlow
            </Link>
            <h1 className="mt-7 text-2xl font-extrabold text-slate-950">Tạo tài khoản EduFlow</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Bắt đầu học tập trên nền tảng EduFlow.</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">Tài khoản mới mặc định là Người học. Admin có thể nâng cấp thành Giảng viên sau.</p>
          </div>

          {errors.root?.message && <div className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errors.root.message}</div>}

          <div className="mt-6 grid gap-4">
            <Input
              label="Họ tên"
              placeholder="Nguyễn Minh Anh"
              autoComplete="name"
              icon={<UserRound size={17} />}
              error={errors.fullName?.message}
              {...register("fullName", { required: "Vui lòng nhập họ tên." })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@email.com"
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
              placeholder="minhanh"
              autoComplete="username"
              icon={<UserRound size={17} />}
              error={errors.username?.message}
              {...register("username", { required: "Vui lòng nhập username." })}
            />
            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="VD: EduFlow@123"
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
                minLength: { value: 8, message: "Mật khẩu tối thiểu 8 ký tự." },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt.",
                },
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

          <Button className="mt-6 h-12 w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700" disabled={isSubmitting} loading={isSubmitting}>
            {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
        <p className="mt-5 text-center text-xs font-medium text-slate-500">© 2026 EduFlow. Nền tảng học trực tuyến.</p>
      </div>
    </div>
  );
}
