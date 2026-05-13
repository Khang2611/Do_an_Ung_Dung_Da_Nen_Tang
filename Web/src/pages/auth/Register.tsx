import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", username: "", password: "", confirmPassword: "", role: "student" as "student" | "instructor" });
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.username || !form.password) return setError("Vui lòng nhập đầy đủ thông tin.");
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự.");
    if (form.password !== form.confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Tạo tài khoản EduFlow</h1>
        <p className="mt-2 text-sm text-slate-500">Mặc định người học, có thể chọn giảng viên khi demo.</p>
        {error && <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</span>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "student" | "instructor" })}>
              <option value="student">Người học</option>
              <option value="instructor">Giảng viên</option>
            </select>
          </label>
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        </div>
        <Button className="mt-6 w-full">Đăng ký</Button>
        <p className="mt-5 text-center text-sm text-slate-600">Đã có tài khoản? <Link className="font-semibold text-indigo-700" to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
