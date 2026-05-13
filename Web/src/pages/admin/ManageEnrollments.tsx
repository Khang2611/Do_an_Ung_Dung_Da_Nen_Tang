import { useEffect, useState } from "react";
import { approveEnrollment, getEnrollments, rejectEnrollment } from "../../api/enrollmentApi";
import { Button } from "../../components/common/Button";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loading } from "../../components/common/Loading";
import type { Enrollment } from "../../types/course";

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
      <h1 className="text-3xl font-bold text-slate-950">Quản lý đăng ký</h1>
      {loading ? <Loading /> : error ? <div className="mt-6"><ErrorMessage message={error} /></div> : <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Học viên</th><th>Khóa học</th><th>Ngày đăng ký</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id}><td className="p-4"><div className="font-semibold">{item.studentName}</div><div className="text-slate-500">{item.studentEmail}</div></td><td>{item.courseTitle}</td><td>{item.createdAt}</td><td>{item.status}</td><td className="space-x-2 pr-4 text-right"><Button variant="secondary" onClick={() => setStatus(item.id, "approved")}>Duyệt</Button><Button variant="danger" onClick={() => setStatus(item.id, "rejected")}>Từ chối</Button></td></tr>)}</tbody></table></div>}
    </div>
  );
}
