import { XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";

export function PaymentFailed() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <XCircle className="h-16 w-16 text-rose-600" />
      <h1 className="mt-5 text-3xl font-extrabold text-slate-950">Thanh toán thất bại</h1>
      <p className="mt-3 text-slate-600">Đơn hàng chưa được thanh toán nên hệ thống không tạo enrollment ACTIVE.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {courseId && <Link to={`/courses/${courseId}`}><Button>Thử lại</Button></Link>}
        {courseId && <Link to={`/courses/${courseId}`}><Button variant="secondary">Quay lại khóa học</Button></Link>}
      </div>
    </div>
  );
}
