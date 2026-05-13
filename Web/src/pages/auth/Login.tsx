import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const path = await login(form);
      navigate(path, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold"><BookOpen /> EduFlow</Link>
        <div>
          <h1 className="max-w-xl text-5xl font-bold leading-tight">Đăng nhập để tiếp tục học tập, giảng dạy hoặc quản trị.</h1>
          <p className="mt-5 max-w-lg text-indigo-100">Hệ thống tự nhận role từ JWT hoặc mock account và điều hướng đúng dashboard.</p>
        </div>
        <div className="grid gap-2 text-sm text-indigo-100">
          <span>Student: student@eduflow.vn / 123456</span>
          <span>Instructor: instructor@eduflow.vn / 123456</span>
          <span>Admin: admin@eduflow.vn / 123456</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Đăng nhập</h2>
          <p className="mt-2 text-sm text-slate-500">Nhập username/email và mật khẩu để vào hệ thống.</p>
          {error && <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="mt-6 space-y-4">
            <Input label="Username hoặc email" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="student@eduflow.vn" />
            <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="123456" />
          </div>
          <Button className="mt-6 w-full" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
          <p className="mt-5 text-center text-sm text-slate-600">Chưa có tài khoản? <Link className="font-semibold text-indigo-700" to="/register">Đăng ký</Link></p>
        </form>
      </section>
    </div>
  );
}
