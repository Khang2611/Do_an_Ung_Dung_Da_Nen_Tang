import { BookOpen, CheckCircle2, Target, UserRound } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import { formatRole, getRoleBadgeVariant } from "../../utils/format";

export function Profile() {
  const { user, role } = useAuth();
  const displayRole = role || undefined;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-indigo-100 text-indigo-700"><UserRound size={44} /></div>
          <div className="min-w-0 flex-1">
            <Badge variant={getRoleBadgeVariant(displayRole)}>{formatRole(displayRole)}</Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{user?.fullName || user?.username}</h1>
            <p className="mt-1 text-slate-500">{user?.email || "Chưa cập nhật email"}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Khóa đã đăng ký" value="2" icon={<BookOpen size={20} />} />
          <StatCard label="Tiến độ trung bình" value="39%" icon={<Target size={20} />} tone="emerald" />
          <StatCard label="Trạng thái tài khoản" value="Hoạt động" icon={<CheckCircle2 size={20} />} tone="sky" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Username</span><div className="mt-1 font-semibold text-slate-950">{user?.username}</div></div>
          <div className="rounded-2xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Vai trò</span><div className="mt-1 font-semibold text-slate-950">{formatRole(displayRole)}</div></div>
        </div>
      </div>
    </div>
  );
}
