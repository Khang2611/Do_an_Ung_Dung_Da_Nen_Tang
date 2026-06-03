import type { LucideIcon } from "lucide-react";
import { BookOpen, Home, LogOut, PlusCircle, ShieldCheck, UserRound, Users } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatRole } from "../../utils/format";

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}

const items: Record<"admin" | "instructor", Item[]> = {
  admin: [
    { to: "/admin/dashboard", label: "Tổng quan", icon: ShieldCheck },
    { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/courses", label: "Khóa học", icon: BookOpen },
  ],
  instructor: [
    { to: "/instructor/dashboard", label: "Tổng quan giảng viên", icon: Home },
    { to: "/instructor/courses", label: "Khóa học của tôi", icon: BookOpen, match: (path) => path === "/instructor/courses" },
    { to: "/instructor/courses/create", label: "Tạo khóa học", icon: PlusCircle, match: (path) => path === "/instructor/courses/create" },
  ],
};

export function Sidebar({ role }: { role: "admin" | "instructor" }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = items[role];
  const isInstructor = role === "instructor";

  return (
    <aside className={`sticky top-0 hidden h-screen w-72 shrink-0 border-r p-5 text-white lg:block ${isInstructor ? "border-indigo-900/40 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900" : "border-slate-200 bg-slate-950"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-950/30">
          <BookOpen size={22} />
        </div>
        <div>
          <div className="text-lg font-bold">EduFlow</div>
          <div className="text-xs text-slate-300">{formatRole(role)}</div>
        </div>
      </div>

      <nav className="space-y-1.5">
        {menu.map((item) => {
          const active = item.match ? item.match(location.pathname) : location.pathname === item.to;
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-white text-indigo-950 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5">
        <NavLink to="/profile" className="mb-3 block rounded-2xl border border-white/10 bg-white/8 p-3 text-left text-sm transition hover:bg-white/12">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"}
              alt={user?.fullName || "User"}
              className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold leading-tight text-white">{user?.fullName || user?.username}</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{user?.email || "Chưa cập nhật email"}</div>
            </div>
            <UserRound size={16} className="shrink-0 text-slate-400" />
          </div>
          <div className="mt-3 w-fit rounded-full bg-indigo-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-100">{formatRole(role)}</div>
        </NavLink>
        <button
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
