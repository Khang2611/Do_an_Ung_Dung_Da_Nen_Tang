import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, Lock, Search, Trash2, Unlock, UserCog, UserPlus, Users } from "lucide-react";
import { deleteUser, getUsers, updateUserRole, updateUserStatus } from "../../api/userApi";
import { getCourses } from "../../api/courseApi";
import { getEnrollments } from "../../api/enrollmentApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { showToast } from "../../components/common/Toast";
import { UserDetailModal } from "../../components/user/UserDetailModal";
import { useAuth } from "../../context/AuthContext";
import type { Course, Enrollment } from "../../types/course";
import type { User } from "../../types/user";
import { formatRole, formatStatus, getRoleBadgeVariant, getStatusBadgeVariant, normalizeRole, normalizeStatus } from "../../utils/format";

type ConfirmConfig = {
  title: string;
  message: string;
  type: "info" | "warning" | "danger";
  confirmText: string;
  onConfirm: () => Promise<void>;
};

export function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [userData, courseData, enrollmentData] = await Promise.all([getUsers(), getCourses(), getEnrollments()]);
        setUsers(userData);
        setCourses(courseData);
        setEnrollments(enrollmentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const byRole = (role: string) => users.filter((item) => normalizeRole(item.role) === role).length;
    return {
      total: users.length,
      students: byRole("student"),
      instructors: byRole("instructor"),
      admins: byRole("admin"),
      locked: users.filter((item) => normalizeStatus(item.status) === "locked").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchSearch = `${user.fullName} ${user.email} ${user.username}`.toLowerCase().includes(keyword);
      const matchRole = roleFilter === "all" || normalizeRole(user.role) === roleFilter;
      const matchStatus = statusFilter === "all" || normalizeStatus(user.status) === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const currentUserId = currentUser?.id == null ? "" : String(currentUser.id);
  const isSelf = (user: User) => String(user.id) === currentUserId;
  const isAdmin = (user: User) => normalizeRole(user.role) === "admin";

  const runConfirmed = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
      setConfirmConfig(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể thực hiện thao tác.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = (target: User, nextRole: "student" | "instructor" | "admin") => {
    if (isSelf(target)) {
      showToast("Bạn không thể tự đổi vai trò của chính mình.", "error");
      return;
    }
    const currentRole = normalizeRole(target.role);
    if (currentRole === nextRole) return;
    const fromText = formatRole(currentRole);
    const toText = formatRole(nextRole);

    setConfirmConfig({
      title: "Xác nhận đổi vai trò",
      message: `Bạn có chắc muốn chuyển ${target.fullName} từ ${fromText} sang ${toText} không?`,
      type: "warning",
      confirmText: "Xác nhận",
      onConfirm: () =>
        runConfirmed(async () => {
          await updateUserRole(target.id, nextRole);
          setUsers((prev) => prev.map((item) => (item.id === target.id ? { ...item, role: normalizeRole(nextRole) } : item)));
          showToast(`Đã chuyển ${target.fullName} thành ${toText}.`, "success");
        }),
    });
  };

  const handleToggleStatus = (target: User) => {
    if (isSelf(target)) {
      showToast("Bạn không thể tự khóa chính mình.", "error");
      return;
    }
    if (isAdmin(target)) {
      showToast("Không thể khóa tài khoản quản trị viên.", "error");
      return;
    }

    const nextStatus = normalizeStatus(target.status) === "active" ? "LOCKED" : "ACTIVE";
    const actionText = nextStatus === "LOCKED" ? "Khóa" : "Mở";

    setConfirmConfig({
      title: `${actionText} tài khoản`,
      message: `Bạn có chắc muốn ${actionText.toLowerCase()} tài khoản ${target.fullName} (@${target.username}) không?`,
      type: nextStatus === "LOCKED" ? "danger" : "info",
      confirmText: actionText,
      onConfirm: () =>
        runConfirmed(async () => {
          await updateUserStatus(target.id, nextStatus);
          setUsers((prev) => prev.map((item) => (item.id === target.id ? { ...item, status: normalizeStatus(nextStatus) } : item)));
          showToast(`${actionText} tài khoản ${target.fullName} thành công.`, "success");
        }),
    });
  };

  const handleDeleteUser = (target: User) => {
    if (isSelf(target)) {
      showToast("Bạn không thể tự xóa chính mình.", "error");
      return;
    }
    if (isAdmin(target)) {
      showToast("Không thể xóa tài khoản quản trị viên.", "error");
      return;
    }

    setConfirmConfig({
      title: "Xóa tài khoản",
      message: `Bạn có chắc muốn xóa tài khoản ${target.fullName} (@${target.username}) không? Hành động này không thể hoàn tác.`,
      type: "danger",
      confirmText: "Xóa",
      onConfirm: () =>
        runConfirmed(async () => {
          await deleteUser(target.id);
          setUsers((prev) => prev.filter((item) => item.id !== target.id));
          showToast(`Đã xóa tài khoản ${target.fullName}.`, "success");
        }),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý vai trò, trạng thái tài khoản và dữ liệu người dùng toàn hệ thống."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Tổng người dùng" value={stats.total} icon={<Users size={20} />} />
        <StatCard label="Người học" value={stats.students} icon={<Users size={20} />} tone="emerald" />
        <StatCard label="Giảng viên" value={stats.instructors} icon={<UserCog size={20} />} tone="indigo" />
        <StatCard label="Admin" value={stats.admins} icon={<UserPlus size={20} />} tone="rose" />
        <StatCard label="Tạm khóa" value={stats.locked} icon={<Lock size={20} />} tone="amber" />
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="max-w-md flex-1">
          <Input
            placeholder="Tìm tên, email hoặc username..."
            icon={<Search size={16} />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Filter size={14} /> Lọc
          </span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="student">Người học</option>
            <option value="instructor">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Tạm khóa</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <Loading />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="Không tìm thấy người dùng phù hợp" />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4 pl-6">Avatar</th>
                  <th>Họ tên</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th className="pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const role = normalizeRole(item.role);
                  const status = normalizeStatus(item.status);
                  const self = isSelf(item);
                  const admin = isAdmin(item);
                  const canEditRole = !self;

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="p-4 pl-6">
                        <img
                          src={item.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                          alt={item.fullName}
                          className="h-10 w-10 rounded-xl border border-slate-100 bg-slate-100 object-cover"
                        />
                      </td>
                      <td>
                        <button onClick={() => setSelectedUser(item)} className="text-left font-bold text-slate-950 hover:text-indigo-700 hover:underline">
                          {item.fullName}
                        </button>
                        {self && <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">Bạn</span>}
                      </td>
                      <td className="font-semibold text-slate-500">@{item.username}</td>
                      <td className="font-medium text-slate-500">{item.email}</td>
                      <td>
                        <Badge variant={getRoleBadgeVariant(role)}>{formatRole(role)}</Badge>
                      </td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(status)}>{formatStatus(status)}</Badge>
                      </td>
                      <td className="pr-6">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedUser(item)}>
                            <Eye size={14} /> Xem
                          </Button>
                          <label className="relative inline-flex h-8 items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 transition hover:bg-slate-200 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                            <UserCog size={14} className="pointer-events-none absolute left-3 text-slate-500" />
                            <select
                              value={role}
                              disabled={!canEditRole || actionLoading}
                              onChange={(event) => handleChangeRole(item, event.target.value as "student" | "instructor" | "admin")}
                              className="h-8 cursor-pointer appearance-none rounded-xl border-0 bg-transparent py-0 pl-8 pr-8 text-xs font-bold outline-none disabled:cursor-not-allowed"
                              title="Đổi vai trò"
                            >
                              <option value="student">Người học</option>
                              <option value="instructor">Giảng viên</option>
                              <option value="admin">Quản trị viên</option>
                            </select>
                            <span className="pointer-events-none absolute right-3 text-slate-400">▾</span>
                          </label>
                          <Button variant={status === "active" ? "secondary" : "primary"} size="sm" disabled={self || admin} onClick={() => handleToggleStatus(item)}>
                            {status === "active" ? <Lock size={14} /> : <Unlock size={14} />}
                            {status === "active" ? "Khóa" : "Mở"}
                          </Button>
                          <Button variant="danger" size="sm" disabled={self || admin} onClick={() => handleDeleteUser(item)}>
                            <Trash2 size={14} /> Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold text-slate-500">
            Hiển thị {filteredUsers.length} trên tổng số {users.length} tài khoản
          </div>
        </div>
      )}

      {confirmConfig && (
        <ConfirmDialog
          isOpen={Boolean(confirmConfig)}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
          confirmText={confirmConfig.confirmText}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
          isLoading={actionLoading}
        />
      )}

      <UserDetailModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        allCourses={courses}
        allEnrollments={enrollments}
      />
    </div>
  );
}
