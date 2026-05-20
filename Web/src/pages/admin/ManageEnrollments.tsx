import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { approveEnrollment, getEnrollments, rejectEnrollment } from "../../api/enrollmentApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import type { Enrollment } from "../../types/course";
import { formatStatus, getStatusBadgeVariant } from "../../utils/format";

export function ManageEnrollments() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEnrollments()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải danh sách đăng ký."))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      status === "approved" ? await approveEnrollment(id) : await rejectEnrollment(id);
      setItems((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật đăng ký.");
    }
  };

  return (
    <div>
      <PageHeader title="Quản lý đăng ký" description="Duyệt hoặc từ chối yêu cầu đăng ký khóa học của học viên." />
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : items.length === 0 ? <EmptyState title="Chưa có đăng ký" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Học viên</th><th>Khóa học</th><th>Ngày đăng ký</th><th>Trạng thái</th><th className="pr-4 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4"><div className="font-semibold text-slate-950">{item.studentName}</div><div className="text-slate-500">{item.studentEmail}</div></td>
                  <td>{item.courseTitle}</td>
                  <td>{item.createdAt}</td>
                  <td><Badge variant={getStatusBadgeVariant(item.status)}>{formatStatus(item.status)}</Badge></td>
                  <td className="space-x-2 pr-4 text-right">
                    <Button variant="secondary" onClick={() => setStatus(item.id, "approved")}><CheckCircle2 size={16} />Duyệt</Button>
                    <Button variant="danger" onClick={() => setStatus(item.id, "rejected")}><XCircle size={16} />Từ chối</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
