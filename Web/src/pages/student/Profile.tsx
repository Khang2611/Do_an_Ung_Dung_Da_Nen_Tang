import { UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Profile() {
  const { user, role } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-indigo-700"><UserRound size={30} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{user?.fullName || user?.username}</h1>
            <p className="text-slate-500">{user?.email || "student@eduflow.vn"}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4"><span className="text-sm text-slate-500">Username</span><div className="font-semibold">{user?.username}</div></div>
          <div className="rounded-lg bg-slate-50 p-4"><span className="text-sm text-slate-500">Vai trò</span><div className="font-semibold uppercase">{role}</div></div>
        </div>
      </div>
    </div>
  );
}
