import type { LucideIcon } from "lucide-react";
import { BookOpen, GraduationCap, Home, LogOut, PlusCircle, ShieldCheck, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
}

const items = {
  instructor: [
    { to: "/instructor", label: "Tổng quan", icon: Home },
    { to: "/instructor/courses", label: "Khóa học", icon: BookOpen },
    { to: "/instructor/courses/create", label: "Tạo khóa học", icon: PlusCircle },
  ],
  admin: [
    { to: "/admin", label: "Tổng quan", icon: ShieldCheck },
    { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/courses", label: "Khóa học", icon: BookOpen },
    { to: "/admin/enrollments", label: "Đăng ký", icon: GraduationCap },
  ],
};

export function Sidebar({ role }: { role: "admin" | "instructor" }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const menu: Item[] = items[role];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-white lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500"><BookOpen size={21} /></div>
        <div>
          <div className="font-bold">EduFlow</div>
          <div className="text-xs text-slate-400">{role === "admin" ? "Quản trị viên" : "Giảng viên"}</div>
        </div>
      </div>
      <nav className="space-y-1">
        {menu.map((item) => (
          <NavLink key={item.to} to={item.to} end className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-indigo-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
            <item.icon size={18} />{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-5 left-5 right-5">
        <div className="mb-3 rounded-lg bg-white/10 p-3 text-sm">
          <div className="font-semibold">{user?.fullName || user?.username}</div>
          <div className="text-xs text-slate-400">{user?.email || "demo@eduflow.vn"}</div>
        </div>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10" onClick={() => { logout(); navigate("/login"); }}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
