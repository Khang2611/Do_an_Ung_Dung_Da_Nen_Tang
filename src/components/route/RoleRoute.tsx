import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { FrontendRole } from "../../types/auth";
import { normalizeRole } from "../../utils/format";
import { Loading } from "../common/Loading";

export function RoleRoute({ allowed }: { allowed: FrontendRole[] }) {
  const { role, user, isLoading } = useAuth();
  if (isLoading) return <Loading />;

  const current = normalizeRole(role || user?.role);
  if (!allowed.includes(current)) {
    return <Navigate to="/forbidden" replace state={{ message: "Bạn không có quyền truy cập trang này." }} />;
  }

  return <Outlet />;
}
