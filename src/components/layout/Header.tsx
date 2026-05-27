import { BookOpen, LogOut, Menu } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/avatar";
import { getRoleHome } from "../../utils/format";
import { Button } from "../common/Button";

export function Header() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const home = getRoleHome(role || "student");

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={isAuthenticated ? home : "/login"} className="flex items-center gap-2 font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
            <BookOpen size={20} />
          </span>
          EduFlow
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          {role === "student" && (
            <>
              <NavLink to="/courses" className={({ isActive }) => (isActive ? "text-indigo-700" : "hover:text-indigo-700")}>
                Khóa học
              </NavLink>
              <NavLink to="/student/my-courses" className={({ isActive }) => (isActive ? "text-indigo-700" : "hover:text-indigo-700")}>
                Khóa học của tôi
              </NavLink>
            </>
          )}
          {role === "admin" && (
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "text-indigo-700" : "hover:text-indigo-700")}>
              Người dùng
            </NavLink>
          )}
          {role === "instructor" && (
            <NavLink to="/instructor/courses" className={({ isActive }) => (isActive ? "text-indigo-700" : "hover:text-indigo-700")}>
              Khóa học của tôi
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "text-indigo-700" : "hover:text-indigo-700")}>
              Hồ sơ
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-indigo-600 sm:flex">
                <img
                  src={getAvatarUrl(user)}
                  alt="Avatar"
                  className="h-6 w-6 rounded-full border border-slate-200 bg-slate-100 object-cover"
                />
                {user?.fullName || user?.username}
              </Link>
              <Button variant="ghost" onClick={signOut}>
                <LogOut size={16} />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </>
          )}
          <Menu className="md:hidden" size={22} />
        </div>
      </div>
    </header>
  );
}
