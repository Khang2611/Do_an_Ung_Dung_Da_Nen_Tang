import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearPendingPayment, getPaymentTransaction, getPendingPayment } from "../../api/paymentApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";

export function PaymentReturn() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function resolvePayment() {
      const pending = getPendingPayment();
      if (!pending?.transactionId) {
        setError("Không tìm thấy giao dịch đang chờ.");
        return;
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const transaction = await getPaymentTransaction(pending.transactionId);
        const status = String(transaction.status || "").toUpperCase();

        if (cancelled) return;
        if (status === "SUCCESS") {
          clearPendingPayment();
          navigate(`/payment/success?courseId=${pending.courseId}&orderId=${pending.orderId}`, { replace: true });
          return;
        }
        if (status === "FAILED" || status === "CANCELLED") {
          clearPendingPayment();
          navigate(`/payment/failed?courseId=${pending.courseId}&orderId=${pending.orderId}`, { replace: true });
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }

      if (!cancelled) navigate(`/payment/failed?courseId=${pending.courseId}&orderId=${pending.orderId}`, { replace: true });
    }

    resolvePayment().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Không thể kiểm tra trạng thái thanh toán.");
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
