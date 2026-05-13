import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { getRoleHome } from "../utils/format";

export function Forbidden() {
  const { role } = useAuth();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="mb-5 h-16 w-16 text-rose-600" />
      <h1 className="text-3xl font-bold text-slate-950">Bạn không có quyền truy cập</h1>
      <p className="mt-3 text-slate-600">Tài khoản hiện tại không được phép mở trang này. Hãy quay về dashboard đúng vai trò hoặc đăng nhập tài khoản khác.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={getRoleHome(role || "student")}><Button>Về dashboard</Button></Link>
        <Link to="/login"><Button variant="secondary">Đăng nhập lại</Button></Link>
      </div>
    </div>
  );
}
