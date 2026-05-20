import { useEffect, useMemo, useState } from "react";
import { Lock, Search, Trash2, Unlock } from "lucide-react";
import { deleteUser, getUsers, updateUser } from "../../api/userApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import type { User } from "../../types/user";
import { formatRole, formatStatus, getRoleBadgeVariant, getStatusBadgeVariant } from "../../utils/format";

export function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải người dùng."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter((user) => `${user.fullName} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [users, search]);

  const toggle = async (user: User) => {
    const next = user.status === "active" ? "locked" : "active";
    try {
      await updateUser(user.id, { status: next as User["status"] });
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, status: next as User["status"] } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật người dùng.");
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa người dùng.");
    }
  };

  return (
    <div>
      <PageHeader title="Quản lý người dùng" description="Tìm kiếm, khóa/mở và xóa tài khoản trong mock mode." action={<Input placeholder="Tìm tên hoặc email" icon={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />} />
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : filtered.length === 0 ? <EmptyState title="Không có người dùng" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th className="pr-4 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-950">{user.fullName}</td>
                  <td>{user.email}</td>
                  <td><Badge variant={getRoleBadgeVariant(user.role)}>{formatRole(user.role)}</Badge></td>
                  <td><Badge variant={getStatusBadgeVariant(user.status)}>{formatStatus(user.status)}</Badge></td>
                  <td className="space-x-2 pr-4 text-right">
                    <Button variant="secondary" onClick={() => toggle(user)}>{user.status === "active" ? <Lock size={16} /> : <Unlock size={16} />}{user.status === "active" ? "Khóa" : "Mở"}</Button>
                    <Button variant="danger" onClick={() => remove(user.id)}><Trash2 size={16} />Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
