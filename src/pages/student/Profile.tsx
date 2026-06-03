import React, { useEffect, useRef, useState } from "react";
import { 
  BookOpen, Target, UserRound, Mail, Calendar, 
  Layers, Star, GraduationCap, Users, DollarSign, ArrowRight,
  TrendingUp, Award, ShieldCheck, Edit3, Settings, Save, X, PlayCircle, Camera, Lock
} from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { getCourses } from "../../api/courseApi";
import { getMyCourses } from "../../api/enrollmentApi";
import { getUsers } from "../../api/userApi";
import { getEnrollments } from "../../api/enrollmentApi";
import type { Course } from "../../types/course";
import { formatCurrency, formatRole, formatStatus, getRoleBadgeVariant, getStatusBadgeVariant } from "../../utils/format";
import { Link } from "react-router-dom";
import { showToast } from "../../components/common/Toast";
import { getAvatarUrl } from "../../utils/avatar";

export function Profile() {
  const { user, role, updateProfile, uploadAvatar } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [teachingCourses, setTeachingCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allUsersCount, setAllUsersCount] = useState(0);
  const [allEnrollmentsCount, setAllEnrollmentsCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Local Edit Form state
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarDragging, setAvatarDragging] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullNameInput(user.fullName || "");
      setEmailInput(user.email || "");
      setAvatarFile(null);
      setAvatarPreview("");
      setPasswordInput("");
      setConfirmPasswordInput("");
    }
  }, [user]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        if (role === "student") {
          const courses = await getMyCourses();
          setEnrolledCourses(courses);
        } else if (role === "instructor") {
          const courses = await getCourses();
          // Filter courses taught by this instructor
          const filtered = courses.filter(
            (c) => c.instructorName.toLowerCase() === (user?.fullName || "").toLowerCase()
          );
          setTeachingCourses(filtered);
        } else if (role === "admin") {
          const [courses, users, enrollments] = await Promise.all([
            getCourses(),
            getUsers(),
            getEnrollments()
          ]);
          setAllCourses(courses);
          setAllUsersCount(users.length);
          setAllEnrollmentsCount(enrollments.length);
        }
      } catch (err) {
        console.error("Lá»—i khi táº£i dá»¯ liá»‡u dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [role, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim()) {
      showToast("Há» tĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.", "error");
      return;
    }

    if (passwordInput && passwordInput.length < 6) {
      showToast("Máº­t kháº©u má»›i pháº£i cĂ³ Ă­t nháº¥t 6 kĂ½ tá»±.", "error");
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      showToast("Máº­t kháº©u xĂ¡c nháº­n khĂ´ng khá»›p.", "error");
      return;
    }

    try {
      setProfileSaving(true);
      await updateProfile({
        fullName: fullNameInput.trim(),
        email: emailInput.trim(),
        ...(passwordInput ? { password: passwordInput } : {}),
      });
      if (avatarFile) await uploadAvatar(avatarFile);
      showToast("ÄĂ£ cáº­p nháº­t há»“ sÆ¡ thĂ nh cĂ´ng.", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "KhĂ´ng thá»ƒ cáº­p nháº­t há»“ sÆ¡.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const selectAvatarFile = (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      showToast("Avatar chá»‰ há»— trá»£ JPG, PNG, WEBP hoáº·c GIF.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Avatar tá»‘i Ä‘a 5MB.", "error");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const displayRole = role || undefined;
  const isStudent = role === "student";
  const isInstructor = role === "instructor";
  const isAdmin = role === "admin";

  // Calculate statistics
  const avgProgress = enrolledCourses.length > 0 
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length) 
    : 0;

  const totalStudyTime = enrolledCourses.length * 4; // simulated average of 4h per course
  const certificatesCount = enrolledCourses.filter(c => c.progress === 100).length;

  // Instructor metrics
  const totalStudents = teachingCourses.reduce((sum, c) => sum + c.studentsCount, 0);
  const avgRating = teachingCourses.length > 0
    ? (teachingCourses.reduce((sum, c) => sum + c.rating, 0) / teachingCourses.length).toFixed(1)
    : "0.0";
  const estimatedRevenue = teachingCourses.reduce((sum, c) => sum + (c.price * Math.min(c.studentsCount, 40)), 0);

  // Admin metrics
  const adminRevenue = allCourses.reduce((sum, c) => sum + (c.price * Math.min(c.studentsCount, 30)), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Loading Skeleton */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-3 h-24" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Hero Bio Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-50/50 blur-3xl" />
            <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-emerald-50/50 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-left">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <img
                  src={getAvatarUrl(user)}
                  alt={user?.fullName}
                  className="h-24 w-24 rounded-2xl border-4 border-slate-50 object-cover shadow-sm bg-slate-100 shrink-0"
                />
                <div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                    <Badge variant={getRoleBadgeVariant(displayRole)}>{formatRole(displayRole)}</Badge>
                    <Badge variant="success">Hoáº¡t Ä‘á»™ng</Badge>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{user?.fullName || user?.username}</h1>
                  <p className="mt-1 text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail size={15} className="text-slate-400" /> {user?.email || "ChÆ°a cáº­p nháº­t email"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                  <Edit3 size={16} /> Cáº­p nháº­t há»“ sÆ¡
                </Button>
                {isAdmin && (
                  <Link to="/admin">
                    <Button>
                      <ShieldCheck size={16} /> Trang quáº£n trá»‹
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* SECTION STATS */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Tá»•ng quan hoáº¡t Ä‘á»™ng</h2>
            
            {/* Student Stats */}
            {isStudent && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <StatCard label="KhĂ³a Ä‘Ă£ Ä‘Äƒng kĂ½" value={enrolledCourses.length} icon={<BookOpen size={20} />} />
                <StatCard label="Tiáº¿n Ä‘á»™ trung bĂ¬nh" value={`${avgProgress}%`} icon={<Target size={20} />} tone="emerald" />
                <StatCard label="Chá»©ng chá»‰ nháº­n Ä‘Æ°á»£c" value={certificatesCount} icon={<Award size={20} />} tone="amber" />
              </div>
            )}

            {/* Instructor Stats */}
            {isInstructor && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <StatCard label="KhĂ³a há»c Ä‘ang dáº¡y" value={teachingCourses.length} icon={<BookOpen size={20} />} tone="indigo" />
                <StatCard label="Tá»•ng há»c viĂªn" value={totalStudents.toLocaleString("vi-VN")} icon={<GraduationCap size={20} />} tone="emerald" />
                <StatCard label="ÄĂ¡nh giĂ¡ trung bĂ¬nh" value={`${avgRating} â˜…`} icon={<Star size={20} />} tone="amber" />
                <StatCard label="Doanh thu táº¡m tĂ­nh" value={formatCurrency(estimatedRevenue)} icon={<DollarSign size={20} />} tone="sky" />
              </div>
            )}

            {/* Admin Stats */}
            {isAdmin && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <StatCard label="Tá»•ng ngÆ°á»i dĂ¹ng" value={allUsersCount} icon={<Users size={20} />} tone="rose" />
                <StatCard label="Tá»•ng khĂ³a há»c" value={allCourses.length} icon={<BookOpen size={20} />} tone="sky" />
                <StatCard label="Tá»•ng lÆ°á»£t há»c" value={allEnrollmentsCount} icon={<GraduationCap size={20} />} tone="emerald" />
                <StatCard label="Tá»•ng doanh thu" value={formatCurrency(adminRevenue)} icon={<DollarSign size={20} />} tone="amber" />
              </div>
            )}
          </div>

          {/* MAIN CONTENT ROW */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* LEFT / 2-COLUMNS AREA */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* STUDENT: Current Courses */}
              {isStudent && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">KhĂ³a há»c cá»§a tĂ´i</h3>
                    <Link to="/student/my-courses" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      Xem táº¥t cáº£ <ArrowRight size={14} />
                    </Link>
                  </div>

                  {enrolledCourses.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400">
                      <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-500">Báº¡n chÆ°a Ä‘Äƒng kĂ½ khĂ³a há»c nĂ o.</p>
                      <Link to="/courses" className="mt-3 inline-block">
                        <Button size="sm">KhĂ¡m phĂ¡ khĂ³a há»c</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {enrolledCourses.slice(0, 4).map((course) => (
                        <div key={course.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col">
                          <div className="relative aspect-video overflow-hidden bg-slate-100">
                            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            {course.progress === 100 && (
                              <div className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 text-white shadow">
                                <Award size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">{course.category}</span>
                              <h4 className="mt-2 font-bold text-slate-950 line-clamp-1 group-hover:text-indigo-600 transition">{course.title}</h4>
                              <p className="mt-1 text-xs text-slate-500 font-medium">Giáº£ng viĂªn: {course.instructorName}</p>
                            </div>
                            
                            <div className="mt-5 pt-4 border-t border-slate-100">
                              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <span className="text-slate-500">Tiáº¿n Ä‘á»™ há»c</span>
                                <span className="text-indigo-600">{course.progress || 0}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress || 0}%` }} />
                              </div>

                              <Link to={`/student/learning/${course.id}`}>
                                <Button className="w-full" size="sm">
                                  <PlayCircle size={16} /> Tiáº¿p tá»¥c há»c
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* INSTRUCTOR: Managed Courses */}
              {isInstructor && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">KhĂ³a há»c Ä‘ang giáº£ng dáº¡y</h3>
                    <Link to="/instructor/courses" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      Xem táº¥t cáº£ <ArrowRight size={14} />
                    </Link>
                  </div>

                  {teachingCourses.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400">
                      <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-500">Báº¡n chÆ°a táº¡o khĂ³a há»c nĂ o.</p>
                      <Link to="/instructor/courses/create" className="mt-3 inline-block">
                        <Button size="sm">Táº¡o khĂ³a há»c ngay</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {teachingCourses.slice(0, 4).map((course) => (
                        <div key={course.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col">
                          <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover bg-slate-100" />
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <Badge variant={getStatusBadgeVariant(course.status)}>{formatStatus(course.status)}</Badge>
                                <span className="text-sm font-bold text-slate-900">{formatCurrency(course.price)}</span>
                              </div>
                              <h4 className="mt-3 font-bold text-slate-950 line-clamp-1">{course.title}</h4>
                              <p className="mt-1.5 text-xs text-slate-500 font-semibold">{course.totalLessons} bĂ i há»c Â· {course.studentsCount.toLocaleString("vi-VN")} há»c viĂªn</p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                              <Link to={`/instructor/courses/${course.id}/edit`} className="flex-1">
                                <Button variant="secondary" className="w-full" size="sm">Chi tiáº¿t & Sá»­a</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: Platform Shortcuts */}
              {isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Lá»‘i táº¯t quáº£n trá»‹ há»‡ thá»‘ng</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    
                    <Link to="/admin/users" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <Users size={22} />
                      </div>
                      <h4 className="mt-4 font-bold text-slate-950 text-base">Quáº£n lĂ½ ngÆ°á»i dĂ¹ng</h4>
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">PhĂª duyá»‡t, Ä‘á»•i vai trĂ² há»c viĂªn/giáº£ng viĂªn, khĂ³a vĂ  xĂ³a ngÆ°á»i dĂ¹ng vi pháº¡m.</p>
                    </Link>

                    <Link to="/admin/courses" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        <BookOpen size={22} />
                      </div>
                      <h4 className="mt-4 font-bold text-slate-950 text-base">Duyá»‡t khĂ³a há»c</h4>
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-semibold">Kiá»ƒm duyá»‡t ná»™i dung bĂ i giáº£ng, video, phĂª duyá»‡t cĂ¡c khĂ³a há»c gá»­i lĂªn.</p>
                    </Link>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDE / PERSONAL INFO & TIMELINE */}
            <div className="space-y-8">
              
              {/* Personal Information Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Settings size={18} className="text-slate-400" />
                  ThĂ´ng tin cĂ¡ nhĂ¢n
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Há» vĂ  tĂªn</span>
                    <div className="mt-1 font-semibold text-slate-900">{user?.fullName || "ChÆ°a cáº­p nháº­t"}</div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email liĂªn láº¡c</span>
                    <div className="mt-1 font-semibold text-slate-900">{user?.email || "ChÆ°a cáº­p nháº­t"}</div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TĂªn Ä‘Äƒng nháº­p</span>
                    <div className="mt-1 font-semibold text-slate-900">@{user?.username}</div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tráº¡ng thĂ¡i</span>
                      <div className="mt-1 font-semibold text-slate-900">
                        <Badge variant="success">Äang hoáº¡t Ä‘á»™ng</Badge>
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">NgĂ y tham gia</span>
                      <div className="mt-1 font-semibold text-slate-900">{user?.createdAt || "2026-04-02"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-slate-400" />
                  Hoáº¡t Ä‘á»™ng gáº§n Ä‘Ă¢y
                </h3>
                <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5 py-1">
                  
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-indigo-600" />
                    <span className="text-xs font-bold text-slate-400 block">5 phĂºt trÆ°á»›c</span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Xem há»“ sÆ¡ cĂ¡ nhĂ¢n</p>
                    <span className="text-xs text-slate-500">Xem thĂ´ng tin vĂ  cáº­p nháº­t giao diá»‡n.</span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-400" />
                    <span className="text-xs font-bold text-slate-400 block">1 ngĂ y trÆ°á»›c</span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {isStudent ? "Tiáº¿p tá»¥c bĂ i há»c 'React Props'" : isInstructor ? "Cáº­p nháº­t bĂ i viáº¿t khĂ³a há»c" : "ÄÄƒng nháº­p há»‡ thá»‘ng admin"}
                    </p>
                    <span className="text-xs text-slate-500">ÄÆ°á»£c ghi nháº­n thĂ nh cĂ´ng tá»« IP: 113.22.45.67</span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-400" />
                    <span className="text-xs font-bold text-slate-400 block">3 ngĂ y trÆ°á»›c</span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">ÄÄƒng nháº­p thĂ nh cĂ´ng</p>
                    <span className="text-xs text-slate-500">Truy cáº­p báº±ng thiáº¿t bá»‹ di Ä‘á»™ng.</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* EDIT PROFILE MODAL */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
              
              <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>

                <h3 className="text-lg font-bold text-slate-950 mb-4">Cáº­p nháº­t thĂ´ng tin cĂ¡ nhĂ¢n</h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div
                    className={`flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition ${
                      avatarDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setAvatarDragging(true);
                    }}
                    onDragLeave={() => setAvatarDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setAvatarDragging(false);
                      selectAvatarFile(event.dataTransfer.files?.[0] || null);
                    }}
                  >
                    <img
                      src={avatarPreview || getAvatarUrl(user)}
                      alt={fullNameInput || user?.username || "Avatar"}
                      className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Camera size={15} /> áº¢nh Ä‘áº¡i diá»‡n
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {avatarFile ? avatarFile.name : "KĂ©o tháº£ áº£nh vĂ o Ä‘Ă¢y hoáº·c chá»n áº£nh tá»« mĂ¡y."}
                      </p>
                      <div className="mt-3">
                        <Button type="button" variant="secondary" size="sm" onClick={() => avatarInputRef.current?.click()}>
                          Chá»n áº£nh
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(event) => selectAvatarFile(event.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">TĂªn Ä‘Äƒng nháº­p</label>
                    <input
                      type="text"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-500 outline-none"
                      value={`@${user?.username}`}
                      disabled
                    />
                    <p className="mt-1 text-[10px] font-medium text-slate-400">TĂªn Ä‘Äƒng nháº­p khĂ´ng thá»ƒ thay Ä‘á»•i.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Há» vĂ  tĂªn</label>
                    <input
                      type="text"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="Nháº­p há» vĂ  tĂªn"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Email liĂªn láº¡c</label>
                    <input
                      type="email"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Nháº­p email"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Lock size={15} /> Máº­t kháº©u má»›i
                      </label>
                      <input
                        type="password"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Äá»ƒ trá»‘ng náº¿u khĂ´ng Ä‘á»•i"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">XĂ¡c nháº­n máº­t kháº©u</label>
                      <input
                        type="password"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Nháº­p láº¡i máº­t kháº©u má»›i"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                      Há»§y
                    </Button>
                    <Button type="submit" loading={profileSaving}>
                      <Save size={16} /> LÆ°u thay Ä‘á»•i
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
