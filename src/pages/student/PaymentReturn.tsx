import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { checkMyEnrollment } from "../../api/enrollmentApi";
import { clearPendingPayment, getPaymentTransaction, getPendingPayment } from "../../api/paymentApi";
import { Button } from "../../components/common/Button";
import { Loading } from "../../components/common/Loading";
import { useAuth } from "../../context/AuthContext";

type PaymentState = "checking" | "success" | "pending" | "failed" | "unauthenticated";

export function PaymentReturn() {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<PaymentState>("checking");
  const pendingPayment = useMemo(() => getPendingPayment(), []);

  const courseId = useMemo(() => {
    return params.get("courseId") || params.get("orderId") || pendingPayment?.courseId || "";
  }, [params, pendingPayment]);

  const transactionId = params.get("transactionId") || (pendingPayment?.transactionId ? String(pendingPayment.transactionId) : "");
  const transactionRef = params.get("transactionRef") || params.get("ref") || pendingPayment?.transactionRef || "";
  const gatewayStatus = String(params.get("status") || pendingPayment?.status || "").toUpperCase();

  useEffect(() => {
    if (!isAuthenticated) {
      setState("unauthenticated");
      return;
    }

    let cancelled = false;

    const resolvePaymentStatus = async () => {
      let currentStatus = gatewayStatus;
      if (transactionId) {
        try {
          const transaction = await getPaymentTransaction(transactionId);
          currentStatus = String(transaction.status || currentStatus).toUpperCase();
        } catch {
          // The return page can still fall back to enrollment polling.
        }
      }

      if (currentStatus === "FAILED" || currentStatus === "CANCELLED") {
        if (!cancelled) setState("failed");
        return;
      }

      if (!courseId) {
        if (!cancelled) setState(currentStatus === "SUCCESS" ? "pending" : "failed");
        return;
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const enrolled = await checkMyEnrollment(courseId);
          if (cancelled) return;
          if (enrolled) {
            clearPendingPayment();
            setState("success");
            return;
          }
        } catch {
          // Webhook may still be processing; retry briefly.
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }

      if (!cancelled) setState(currentStatus === "SUCCESS" ? "pending" : "failed");
    };

    resolvePaymentStatus();
    return () => {
      cancelled = true;
    };
  }, [courseId, gatewayStatus, isAuthenticated, transactionId]);

  if (state === "checking") return <Loading label="Đang kiểm tra kết quả thanh toán..." />;

  const content = {
    success: {
      icon: <CheckCircle2 size={42} className="text-emerald-600" />,
      title: "Thanh toán thành công",
      message: "Khóa học đã được mở cho tài khoản của bạn.",
    },
    pending: {
      icon: <Clock size={42} className="text-amber-600" />,
      title: "Đang chờ xác nhận thanh toán",
      message: "Giao dịch đã được tạo, nhưng webhook chưa xác nhận mở khóa học. Hãy kiểm tra lại sau vài giây.",
    },
    failed: {
      icon: <XCircle size={42} className="text-rose-600" />,
      title: "Thanh toán chưa hoàn tất",
      message: "Giao dịch thất bại, bị hủy hoặc thiếu thông tin khóa học.",
    },
    unauthenticated: {
      icon: <Clock size={42} className="text-slate-500" />,
      title: "Cần đăng nhập để kiểm tra thanh toán",
      message: "Đăng nhập lại bằng tài khoản đã mua khóa học để kiểm tra trạng thái.",
    },
  }[state];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-50">{content.icon}</div>
        <h1 className="mt-6 text-2xl font-bold text-slate-950">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{content.message}</p>
        {transactionRef && <p className="mt-4 text-xs text-slate-500">Mã giao dịch: {transactionRef}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {courseId && <Link to={`/courses/${courseId}`}><Button variant="secondary">Xem khóa học</Button></Link>}
          {state === "success" && courseId && <Link to={`/student/learning/${courseId}`}><Button>Vào học</Button></Link>}
          {state === "pending" && <Button onClick={() => window.location.reload()}>Kiểm tra lại</Button>}
          {state === "unauthenticated" && <Link to="/login"><Button>Đăng nhập</Button></Link>}
        </div>
      </section>
    </div>
  );
}
