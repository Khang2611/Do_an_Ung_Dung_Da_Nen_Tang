import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkMyEnrollment } from "../../api/enrollmentApi";
import { clearPendingPayment, getPaymentTransaction, getPendingPayment } from "../../api/paymentApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";

export function PaymentReturn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const pendingPayment = useMemo(() => getPendingPayment(), []);

  const courseId = params.get("courseId") || params.get("orderId") || pendingPayment?.courseId || "";
  const orderId = params.get("orderId") || pendingPayment?.orderId || courseId;
  const transactionId = params.get("transactionId") || (pendingPayment?.transactionId ? String(pendingPayment.transactionId) : "");

  useEffect(() => {
    let cancelled = false;

    async function resolvePayment() {
      if (!courseId) {
        setError("Không tìm thấy khóa học cần mở sau thanh toán.");
        return;
      }

      for (let attempt = 0; attempt < 20; attempt += 1) {
        let status = "";

        if (transactionId) {
          const transaction = await getPaymentTransaction(transactionId);
          status = String(transaction.status || "").toUpperCase();

          if (cancelled) return;
          if (status === "FAILED" || status === "CANCELLED") {
            clearPendingPayment();
            navigate(`/payment/failed?courseId=${courseId}&orderId=${orderId}`, { replace: true });
            return;
          }
        }

        const enrolled = await checkMyEnrollment(courseId);
        if (cancelled) return;
        if (enrolled) {
          clearPendingPayment();
          navigate(`/payment/success?courseId=${courseId}&orderId=${orderId}`, { replace: true });
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, status === "SUCCESS" ? 1000 : 1500));
      }

      if (!cancelled) navigate(`/payment/failed?courseId=${courseId}&orderId=${orderId}`, { replace: true });
    }

    resolvePayment().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Không thể kiểm tra trạng thái thanh toán.");
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, navigate, orderId, transactionId]);

  if (error) {
    return <div className="mx-auto max-w-2xl px-4 py-12"><ErrorMessage title="Không thể kiểm tra thanh toán" message={error} /></div>;
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-4 text-center">
      <div>
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
        <h1 className="mt-5 text-2xl font-extrabold text-slate-950">Đang kiểm tra thanh toán</h1>
        <p className="mt-2 text-sm text-slate-500">Vui lòng chờ trong giây lát.</p>
      </div>
    </div>
  );
}
