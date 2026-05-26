import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, CheckCircle2, LockKeyhole, Mail, Pencil, Save, Target, UserRound, X } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { StatCard } from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import { formatRole, formatStatus, getRoleBadgeVariant } from "../../utils/format";

type ProfileForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function Profile() {
  const { user, role, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const displayRole = role || undefined;
  const status = String(user?.status || "active");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [reset, user]);

  const cancelEdit = () => {
    reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setSuccessMessage("");
    setIsEditing(false);
  };

  const submit = async ({ confirmPassword, password, ...values }: ProfileForm) => {
    void confirmPassword;
    setSuccessMessage("");
    try {
      await updateProfile({
        ...values,
        password: password.trim() ? password : undefined,
      });
      setSuccessMessage("Cập nhật hồ sơ thành công.");
      setIsEditing(false);
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Cập nhật hồ sơ thất bại." });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-indigo-100 text-indigo-700"><UserRound size={44} /></div>
          <div className="min-w-0 flex-1">
            <Badge variant={getRoleBadgeVariant(displayRole)}>{formatRole(displayRole)}</Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{user?.fullName || user?.username}</h1>
            <p className="mt-1 text-slate-500">{user?.email || "student@eduflow.vn"}</p>
          </div>
          {!isEditing && (
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Khóa đã đăng ký" value="2" icon={<BookOpen size={20} />} />
          <StatCard label="Tiến độ trung bình" value="39%" icon={<Target size={20} />} tone="emerald" />
          <StatCard label="Trạng thái tài khoản" value={formatStatus(status)} icon={<CheckCircle2 size={20} />} tone="sky" />
        </div>

        {successMessage && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit(submit)} className="mt-6">
            {errors.root?.message && <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root.message}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Họ tên"
                icon={<UserRound size={17} />}
                error={errors.fullName?.message}
                {...register("fullName", { required: "Vui lòng nhập họ tên." })}
              />
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
              <Input
                label="Mật khẩu mới"
                type="password"
                icon={<LockKeyhole size={17} />}
                error={errors.password?.message}
                placeholder="Để trống nếu không đổi mật khẩu"
                {...register("password", {
                  validate: (value) => !value || value.length >= 6 || "Mật khẩu tối thiểu 6 ký tự.",
                })}
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                icon={<LockKeyhole size={17} />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  validate: (value) => value === watch("password") || "Mật khẩu xác nhận không khớp.",
                })}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} disabled={isSubmitting}>
                <X size={16} />
                Hủy
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Username</span><div className="mt-1 font-semibold text-slate-950">{user?.username}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Vai trò</span><div className="mt-1 font-semibold text-slate-950">{formatRole(displayRole)}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}
