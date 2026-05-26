import { BookOpen, LogOut, Menu, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><BookOpen size={20} /></span>
          EduFlow
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <NavLink to="/courses" className={({ isActive }) => isActive ? "text-indigo-700" : "hover:text-indigo-700"}>Khóa học</NavLink>
          {isAuthenticated && <NavLink to="/student/my-courses" className={({ isActive }) => isActive ? "text-indigo-700" : "hover:text-indigo-700"}>Khóa của tôi</NavLink>}
          {isAuthenticated && <NavLink to="/student/profile" className={({ isActive }) => isActive ? "text-indigo-700" : "hover:text-indigo-700"}>Hồ sơ</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 text-sm text-slate-600 sm:flex"><User size={16} />{user?.fullName || user?.username}</span>
              <Button variant="ghost" onClick={signOut}><LogOut size={16} />Đăng xuất</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Đăng nhập</Button></Link>
              <Link to="/register"><Button>Đăng ký</Button></Link>
            </>
          )}
          <Menu className="md:hidden" size={22} />
        </div>
      </div>
    </header>
  );
}
