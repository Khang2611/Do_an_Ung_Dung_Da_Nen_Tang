import React from "react";
import { BookOpen, Calendar, Mail, Shield, User, X, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";
import { Badge } from "../common/Badge";
import type { User as UserType } from "../../types/user";
import type { Course, Enrollment } from "../../types/course";
import { formatRole, formatStatus, getRoleBadgeVariant, getStatusBadgeVariant, normalizeRole } from "../../utils/format";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  allCourses?: Course[];
  allEnrollments?: Enrollment[];
}

export function UserDetailModal({
  isOpen,
  onClose,
  user,
  allCourses = [],
  allEnrollments = [],
}: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  const role = normalizeRole(user.role);
  const isStudent = role === "student";
  const isInstructor = role === "instructor";
  const isAdmin = role === "admin";

  // Compute student's courses and progress
  const studentEnrollments = allEnrollments.filter(
    (e) => e.studentEmail.toLowerCase() === user.email.toLowerCase() && e.status === "approved"
  );
  
  const enrolledCourses = studentEnrollments.map((enrollment) => {
    const course = allCourses.find((c) => c.id === enrollment.courseId);
    return {
      id: enrollment.courseId,
      title: enrollment.courseTitle,
      thumbnail: course?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      instructor: course?.instructorName || "Giảng viên",
      progress: course?.progress ?? Math.floor(Math.random() * 80) + 10,
    };
  });

  // Compute instructor's courses
  const teachingCourses = allCourses.filter(
    (c) => c.instructorName.toLowerCase() === user.fullName.toLowerCase()
  );

  // Simulated activities timeline
  const activities = user.recentActivities?.length
    ? user.recentActivities.map((activity, index) => ({ id: index + 1, action: activity, time: index === 0 ? "Gần đây" : "Trước đó", desc: "Dữ liệu hoạt động từ hồ sơ người dùng." }))
    : [
    { id: 1, action: "Đăng nhập hệ thống", time: "10 phút trước", desc: "Đăng nhập thành công qua trình duyệt Chrome." },
    { id: 2, action: isStudent ? "Hoàn thành bài học" : isInstructor ? "Cập nhật bài học mới" : "Phê duyệt khóa học", time: "2 giờ trước", desc: isStudent ? "Hoàn thành bài học 'Gọi API với Axios' trong khóa ReactJS." : isInstructor ? "Thêm bài học 'JWT Security' vào chương Security." : "Duyệt khóa học 'UI/UX Dashboard quản trị hiện đại' thành APPROVED." },
    { id: 3, action: isStudent ? "Đăng ký khóa học" : isInstructor ? "Tạo bản nháp khóa học" : "Khóa tài khoản vi phạm", time: "1 ngày trước", desc: isStudent ? "Đăng ký thành công khóa học Java Core." : isInstructor ? "Tạo khóa học Docker & Kubernetes." : "Tạm khóa người dùng Vũ Hoàng Long do có hoạt động spam." },
    { id: 4, action: "Cập nhật ảnh đại diện", time: "3 ngày trước", desc: "Cập nhật ảnh đại diện mới từ thư viện ảnh." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      {/* Drawer Body */}
      <div className="relative h-full w-full max-w-2xl transform overflow-y-auto bg-white shadow-2xl transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <User size={20} className="text-slate-400" />
            Chi tiết tài khoản
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8">
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left border-b border-slate-100 pb-6">
            <img
              src={user.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`}
              alt={user.fullName}
              className="h-24 w-24 rounded-2xl border-4 border-slate-50 object-cover shadow-sm bg-slate-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 items-center">
                <Badge variant={getRoleBadgeVariant(user.role)}>{formatRole(user.role)}</Badge>
                <Badge variant={getStatusBadgeVariant(user.status)}>{formatStatus(user.status)}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 truncate">{user.fullName}</h1>
              <p className="mt-1 text-sm text-slate-500 font-medium truncate flex justify-center sm:justify-start items-center gap-1.5">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên tài khoản</span>
              <div className="mt-1 font-bold text-slate-900">@{user.username}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50 flex items-center gap-3">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Ngày tham gia</span>
                <span className="mt-1 font-bold text-slate-900">{user.createdAt || "2026-04-02"}</span>
              </div>
            </div>
          </div>

          {/* Statistics & Related Data */}
          <div>
            {isStudent && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-500" />
                  Khóa học đã đăng ký ({enrolledCourses.length})
                </h4>
                {enrolledCourses.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-100 py-8 text-center text-slate-400">
                    Chưa đăng ký khóa học nào.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {enrolledCourses.map((c) => (
                      <div key={c.id} className="flex gap-4 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                        <img src={c.thumbnail} alt={c.title} className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <h5 className="font-semibold text-slate-900 text-sm truncate">{c.title}</h5>
                          <span className="text-xs text-slate-500">{c.instructor}</span>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{c.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isInstructor && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-500" />
                  Khóa học đang giảng dạy ({teachingCourses.length})
                </h4>
                {teachingCourses.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-100 py-8 text-center text-slate-400">
                    Chưa đăng tải khóa học nào.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {teachingCourses.map((c) => (
                      <div key={c.id} className="flex gap-4 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                        <img src={c.thumbnail} alt={c.title} className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <h5 className="font-semibold text-slate-900 text-sm truncate">{c.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{c.totalLessons} bài học</span>
                            <span>•</span>
                            <span>{c.studentsCount.toLocaleString("vi-VN")} học viên</span>
                          </div>
                          <div className="mt-1">
                            <Badge variant={getStatusBadgeVariant(c.status)}>{formatStatus(c.status)}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Shield size={18} className="text-rose-500" />
                  Quyền hạn & Quản trị
                </h4>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Tài khoản có toàn quyền truy cập, chỉnh sửa, khóa/xóa tài khoản người dùng, duyệt/từ chối xuất bản nội dung khóa học trên toàn bộ hệ thống EduFlow.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-950">Hoạt động gần đây</h4>
            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 py-2">
              {activities.map((act) => (
                <div key={act.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">{act.action}</span>
                    <span className="text-[11px] font-medium text-slate-400">{act.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
