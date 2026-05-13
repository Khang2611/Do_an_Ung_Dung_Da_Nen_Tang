import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/format";
import { Loading } from "../common/Loading";

export function RoleRoute({ allowed }: { allowed: string[] }) {
  const { role, user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  const current = normalizeRole(role || user?.role);
  if (!allowed.map(normalizeRole).includes(current)) return <Navigate to="/403" replace state={{ message: "Bạn không có quyền truy cập trang này." }} />;
  return <Outlet />;
}
