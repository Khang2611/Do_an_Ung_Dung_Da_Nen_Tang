import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      <h1 className="mt-5 text-3xl font-extrabold text-slate-950">Thanh toán thành công</h1>
      <p className="mt-3 text-slate-600">Enrollment ACTIVE đã được tạo. Khóa học đã xuất hiện trong danh sách của bạn.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {courseId && <Link to={`/student/learning/${courseId}`}><Button>Vào học ngay</Button></Link>}
        <Link to="/student/my-courses"><Button variant="secondary">Khóa học của tôi</Button></Link>
      </div>
    </div>
  );
}
