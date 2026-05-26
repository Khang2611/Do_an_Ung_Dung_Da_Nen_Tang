import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-bold text-indigo-600">404</div>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Không tìm thấy trang</h1>
      <p className="mt-3 text-slate-600">Đường dẫn không tồn tại hoặc đã được thay đổi.</p>
      <Link to="/" className="mt-6"><Button>Về trang chủ</Button></Link>
    </div>
  );
}
