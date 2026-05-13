import { useEffect, useState } from "react";
import { deleteUser, getUsers, updateUser } from "../../api/userApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import type { User } from "../../types/user";

export function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải người dùng."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (user: User) => {
    const next = user.status === "active" ? "locked" : "active";
    try {
      await updateUser(user.id, { status: next });
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, status: next } : item));
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
      <h1 className="text-3xl font-bold text-slate-950">Quản lý người dùng</h1>
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Tên</th><th>Email</th><th>Role</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="p-4 font-semibold">{user.fullName}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td><td className="space-x-2 pr-4 text-right"><Button variant="secondary" onClick={() => toggle(user)}>{user.status === "active" ? "Khóa" : "Mở"}</Button><Button variant="danger" onClick={() => remove(user.id)}>Xóa</Button></td></tr>)}</tbody></table></div>}
    </div>
  );
}
