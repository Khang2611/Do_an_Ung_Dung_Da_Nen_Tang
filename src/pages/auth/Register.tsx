import { BookOpen, LockKeyhole, Mail, UserRound } from "lucide-react";
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
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: { fullName: "", email: "", username: "", password: "", confirmPassword: "" },
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
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BookOpen size={20} /></span>
          EduFlow
        </Link>
        <Link className="text-sm font-semibold text-indigo-700 hover:text-indigo-800" to="/login">Quay về đăng nhập</Link>
      </div>
      <form onSubmit={handleSubmit(submit)} className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-950">Tạo tài khoản EduFlow</h1>
          <p className="mt-2 text-sm text-slate-500">Đăng ký tài khoản người học.</p>
        </div>
        {errors.root?.message && <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Họ tên" icon={<UserRound size={17} />} error={errors.fullName?.message} {...register("fullName", { required: "Vui lòng nhập họ tên." })} />
          <Input
            label="Email"
            type="email"
            icon={<Mail size={17} />}
            error={errors.email?.message}
            {...register("email", {
              required: "Vui lòng nhập email.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không đúng định dạng." },
            })}
          />
          <Input label="Username" icon={<UserRound size={17} />} error={errors.username?.message} {...register("username", { required: "Vui lòng nhập username." })} />
          <Input
            label="Mật khẩu"
            type="password"
            icon={<LockKeyhole size={17} />}
            error={errors.password?.message}
            {...register("password", {
              required: "Vui lòng nhập mật khẩu.",
              minLength: { value: 8, message: "Mật khẩu tối thiểu 8 ký tự." },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt.",
              },
            })}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            icon={<LockKeyhole size={17} />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Vui lòng xác nhận mật khẩu.",
              validate: (value) => value === watch("password") || "Mật khẩu xác nhận không khớp.",
            })}
          />
        </div>
        <Button className="mt-7 w-full md:w-auto" disabled={isSubmitting}>{isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}</Button>
      </form>
    </div>
  );
}
