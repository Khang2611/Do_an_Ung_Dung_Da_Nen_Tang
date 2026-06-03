import React, { useEffect, useMemo, useState } from "react";
import { 
  EyeOff, Trash2, Search, Filter, BookOpen, Clock, 
  Layers, X, Eye, FileText, CornerDownRight 
} from "lucide-react";
import { deleteCourse, getCourses, updateCourse } from "../../api/courseApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { PageHeader } from "../../components/common/PageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/Toast";
import type { Course } from "../../types/course";
import { formatCurrency, formatStatus, getStatusBadgeVariant } from "../../utils/format";

export function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Course Preview Modal
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: "info" | "warning" | "danger";
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }

  // Categories list computed from courses
  const categories = useMemo(() => {
    const list = new Set(courses.map((c) => c.category));
    return Array.from(list);
  }, [courses]);

  // Tab Filtering & Search Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Search
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.instructorName.toLowerCase().includes(search.toLowerCase());
      
      // Category
      const matchCategory = categoryFilter === "all" || c.category === categoryFilter;

      const matchStatus = statusFilter === "all" || String(c.status).toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchCategory && matchStatus;
    });
  }, [courses, search, categoryFilter, statusFilter]);

  // Hide course handler (Toggle draft/published)
  const handleHideCourse = async (course: Course) => {
    const nextStatus = course.status === "hidden" ? "published" : "hidden";
    const statusText = nextStatus === "published" ? "hiển thị" : "ẩn";
    try {
      await updateCourse(course.id, { status: nextStatus });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c))
      );
      showToast(`Đã ${statusText} khóa học "${course.title}".`, "success");
    } catch (err) {
      showToast("Không thể cập nhật trạng thái khóa học.", "error");
    }
  };

  // Delete course handler
  const handleDeleteCourse = (course: Course) => {
    setConfirmConfig({
      title: "Xóa vĩnh viễn khóa học",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn khóa học "${course.title}" khỏi hệ thống không? Hành động này sẽ ảnh hưởng tới dữ liệu đăng ký của học viên.`,
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await deleteCourse(course.id);
          setCourses((prev) => prev.filter((c) => c.id !== course.id));
          showToast(`Đã xóa vĩnh viễn khóa học "${course.title}" thành công.`, "success");
          setIsPreviewOpen(false);
        } catch (err) {
          showToast("Xóa khóa học thất bại.", "error");
        } finally {
          setActionLoading(false);
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  const handleOpenPreview = (course: Course) => {
    setPreviewCourse(course);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý khóa học" 
        description="Theo dõi, ẩn hoặc xóa các khóa học trên hệ thống EduFlow."
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Input 
            placeholder="Tìm tên khóa học hoặc giảng viên..." 
            icon={<Search size={16} />} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
            <Filter size={14} /> Bộ lọc:
          </div>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Loading />
          <span className="mt-3 text-sm text-slate-400 font-semibold">Đang tải danh sách khóa học...</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredCourses.length === 0 ? (
        <EmptyState title="Không tìm thấy khóa học nào phù hợp" />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Khóa học</th>
                  <th>Giảng viên</th>
                  <th>Danh mục</th>
                  <th>Giá tiền</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th className="pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => {
                  const isHidden = String(course.status).toLowerCase() === "hidden";
                  
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Course Info */}
                      <td className="p-4 pl-6 font-bold text-slate-900 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-10 w-16 rounded-lg object-cover border border-slate-100 bg-slate-100 shrink-0"
                          />
                          <button
                            onClick={() => handleOpenPreview(course)}
                            className="text-slate-900 font-bold hover:text-indigo-600 hover:underline text-left truncate"
                          >
                            {course.title}
                          </button>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="font-semibold text-slate-600">{course.instructorName}</td>

                      {/* Category */}
                      <td className="font-medium text-slate-500">{course.category}</td>

                      {/* Price */}
                      <td className="font-bold text-slate-900">{formatCurrency(course.price)}</td>

                      {/* Rating */}
                      <td className="font-semibold text-amber-500">★ {course.rating.toFixed(1)}</td>

                      {/* Status */}
                      <td>
                        <Badge variant={getStatusBadgeVariant(course.status)}>
                          {formatStatus(course.status)}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="space-x-1.5 pr-6 text-right">
                        
                        {/* View Preview Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenPreview(course)}
                          title="Xem giáo trình bài học"
                        >
                          <Eye size={15} />
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleHideCourse(course)}
                          title={isHidden ? "Hiện khóa học" : "Ẩn khóa học"}
                        >
                          <EyeOff size={14} />
                          {isHidden ? "Hiện" : "Ẩn"}
                        </Button>

                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={14} />
                        </Button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COURSE SYLLABUS PREVIEW DRAWER */}
      {isPreviewOpen && previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsPreviewOpen(false)} />
          
          <div className="relative h-full w-full max-w-2xl transform overflow-y-auto bg-white shadow-2xl transition-all duration-300 flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Giáo trình khóa học
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 space-y-6">
              
              {/* Course Detail Card */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-sm bg-slate-100 border border-slate-100">
                <img src={previewCourse.thumbnail} alt={previewCourse.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-bold bg-indigo-600/90 text-white px-2 py-0.5 rounded uppercase tracking-wider self-start">{previewCourse.category}</span>
                  <h4 className="mt-2 text-xl font-bold">{previewCourse.title}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-300">Giảng viên: {previewCourse.instructorName} · Cấp độ: {previewCourse.level}</p>
                </div>
              </div>

              {/* Badges / Stats */}
              <div className="flex flex-wrap gap-4 items-center border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Trạng thái</span>
                  <Badge variant={getStatusBadgeVariant(previewCourse.status)} className="mt-0.5">
                    {formatStatus(previewCourse.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Giá bán</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{formatCurrency(previewCourse.price)}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Số bài học</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block flex items-center gap-1"><Layers size={14} /> {previewCourse.totalLessons} bài học</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Thời lượng</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block flex items-center gap-1"><Clock size={14} /> {previewCourse.duration}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-950 text-sm">Mô tả khóa học</h5>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">{previewCourse.description}</p>
              </div>

              {/* Syllabus (Chapters & Lessons) */}
              <div className="space-y-4 pt-2">
                <h5 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" />
                  Cấu trúc chương trình học
                </h5>
                
                {previewCourse.chapters.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 p-6 text-center text-slate-400 text-sm">
                    Khóa học này chưa có nội dung chương học.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewCourse.chapters.map((chap, cIndex) => (
                      <div key={chap.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                        <h6 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          Chương {cIndex + 1}: {chap.title}
                        </h6>
                        
                        <div className="mt-3 ml-2 space-y-2.5 border-l border-slate-100 pl-4">
                          {chap.lessons.map((less) => (
                            <div key={less.id} className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-700 flex items-center gap-1.5">
                                <CornerDownRight size={13} className="text-slate-400 shrink-0" />
                                {less.title}
                              </span>
                              <span className="text-slate-400">{less.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG CONTAINER */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
          confirmText={confirmConfig.confirmText}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmOpen(false)}
          isLoading={actionLoading}
        />
      )}

    </div>
  );
}
