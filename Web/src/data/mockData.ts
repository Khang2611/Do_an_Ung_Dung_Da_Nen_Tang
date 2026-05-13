import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";
import type { Course, Enrollment } from "../types/course";
import type { User } from "../types/user";

export const mockUsers: User[] = [
  { id: "u1", fullName: "Nguyễn Minh Anh", email: "student@eduflow.vn", username: "student", role: "student", status: "active", createdAt: "2026-04-02" },
  { id: "u2", fullName: "Trần Quốc Huy", email: "instructor@eduflow.vn", username: "instructor", role: "instructor", status: "active", createdAt: "2026-03-12" },
  { id: "u3", fullName: "Lê Thanh Admin", email: "admin@eduflow.vn", username: "admin", role: "admin", status: "active", createdAt: "2026-02-18" },
  { id: "u4", fullName: "Phạm Gia Bảo", email: "bao@student.vn", username: "bao", role: "student", status: "active", createdAt: "2026-05-01" },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "ReactJS từ cơ bản đến thực chiến",
    description: "Xây dựng nền tảng React vững chắc, làm việc với component, state, routing và gọi API trong dự án thực tế.",
    category: "Lập trình Web",
    level: "Cơ bản",
    price: 499000,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Trần Quốc Huy",
    totalLessons: 18,
    duration: "12 giờ",
    rating: 4.8,
    studentsCount: 1260,
    status: "published",
    progress: 58,
    chapters: [
      { id: "ch1", title: "Khởi động với React", lessons: [{ id: "l1", title: "React là gì?", duration: "12 phút", content: "Tổng quan React và cách tổ chức giao diện theo component." }, { id: "l2", title: "JSX và Props", duration: "18 phút", content: "Cách truyền dữ liệu và tái sử dụng UI." }] },
      { id: "ch2", title: "State và API", lessons: [{ id: "l3", title: "useState, useEffect", duration: "22 phút", content: "Quản lý trạng thái và vòng đời component." }, { id: "l4", title: "Gọi API với Axios", duration: "20 phút", content: "Kết nối backend và xử lý lỗi." }] },
    ],
    lessons: [],
  },
  {
    id: "c2",
    title: "Spring Boot REST API cho hệ thống khóa học",
    description: "Thiết kế API, JWT authentication, phân quyền và CRUD dữ liệu phục vụ hệ thống học online.",
    category: "Backend",
    level: "Trung cấp",
    price: 699000,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Nguyễn Hải Nam",
    totalLessons: 24,
    duration: "18 giờ",
    rating: 4.7,
    studentsCount: 840,
    status: "published",
    progress: 20,
    chapters: [
      { id: "ch3", title: "RESTful API", lessons: [{ id: "l5", title: "Controller và DTO", duration: "25 phút", content: "Tổ chức request/response rõ ràng." }, { id: "l6", title: "JWT Security", duration: "30 phút", content: "Bảo vệ API bằng token." }] },
    ],
    lessons: [],
  },
  {
    id: "c3",
    title: "UI/UX Dashboard quản trị hiện đại",
    description: "Thiết kế giao diện dashboard rõ ràng, responsive, tối ưu cho thao tác quản trị và theo dõi dữ liệu.",
    category: "Thiết kế",
    level: "Cơ bản",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
    instructorName: "Hoàng Linh",
    totalLessons: 14,
    duration: "8 giờ",
    rating: 4.6,
    studentsCount: 520,
    status: "pending",
    chapters: [
      { id: "ch4", title: "Nền tảng dashboard", lessons: [{ id: "l7", title: "Layout và hierarchy", duration: "16 phút", content: "Xây dựng bố cục dễ quét thông tin." }] },
    ],
    lessons: [],
  },
];

mockCourses.forEach((course) => {
  course.lessons = course.chapters.flatMap((chapter) => chapter.lessons);
});

export const mockEnrollments: Enrollment[] = [
  { id: "e1", courseId: "c1", courseTitle: "ReactJS từ cơ bản đến thực chiến", studentName: "Nguyễn Minh Anh", studentEmail: "student@eduflow.vn", status: "approved", createdAt: "2026-05-02" },
  { id: "e2", courseId: "c2", courseTitle: "Spring Boot REST API cho hệ thống khóa học", studentName: "Phạm Gia Bảo", studentEmail: "bao@student.vn", status: "pending", createdAt: "2026-05-08" },
];

const MOCK_ENROLLMENT_KEY = "mock_enrollments";

function getCurrentMockUser() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readStoredEnrollments(): Enrollment[] {
  const raw = localStorage.getItem(MOCK_ENROLLMENT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Enrollment[];
  } catch {
    return [];
  }
}

function writeStoredEnrollments(items: Enrollment[]) {
  localStorage.setItem(MOCK_ENROLLMENT_KEY, JSON.stringify(items));
}

export function getAllMockEnrollments() {
  const stored = readStoredEnrollments();
  const map = new Map<string, Enrollment>();
  [...mockEnrollments, ...stored].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function isMockCourseEnrolled(courseId: string) {
  const user = getCurrentMockUser();
  if (!user) return false;
  const email = String(user.email || "").toLowerCase();
  return getAllMockEnrollments().some((item) => item.courseId === courseId && item.status === "approved" && item.studentEmail.toLowerCase() === email);
}

export function addMockEnrollment(courseId: string) {
  const user = getCurrentMockUser();
  if (!user) throw new Error("Vui lòng đăng nhập trước khi đăng ký khóa học.");
  const course = mockCourses.find((item) => item.id === courseId);
  if (!course) throw new Error("Không tìm thấy khóa học.");
  if (isMockCourseEnrolled(courseId)) {
    return getAllMockEnrollments().find((item) => item.courseId === courseId && item.studentEmail === user.email);
  }
  const enrollment: Enrollment = {
    id: `e${Date.now()}`,
    courseId,
    courseTitle: course.title,
    studentName: user.fullName || user.name || user.username,
    studentEmail: user.email || user.username,
    status: "approved",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const stored = readStoredEnrollments();
  stored.push(enrollment);
  writeStoredEnrollments(stored);
  return enrollment;
}

export function getMockMyCourses() {
  const user = getCurrentMockUser();
  if (!user) return [];
  const email = String(user.email || "").toLowerCase();
  const ids = new Set(
    getAllMockEnrollments()
      .filter((item) => item.studentEmail.toLowerCase() === email && item.status === "approved")
      .map((item) => item.courseId),
  );
  return mockCourses.filter((course) => ids.has(course.id));
}

const passwords: Record<string, string> = {
  "student@eduflow.vn": "123456",
  student: "123456",
  "instructor@eduflow.vn": "123456",
  instructor: "123456",
  "admin@eduflow.vn": "123456",
  admin: "123456",
};

export async function mockLogin(data: LoginPayload): Promise<{ user: AuthUser; token: string }> {
  const key = data.username.trim().toLowerCase();
  const user = mockUsers.find((item) => item.email.toLowerCase() === key || item.username.toLowerCase() === key);
  if (!user || passwords[key] !== data.password) {
    throw new Error("Sai tài khoản hoặc mật khẩu. Thử student@eduflow.vn / 123456.");
  }
  const token = `mock-token-${user.role}-${Date.now()}`;
  return { user: { ...user, name: user.fullName, accessToken: token }, token };
}

export async function mockRegister(data: RegisterPayload) {
  const exists = mockUsers.some((user) => user.email.toLowerCase() === data.email.toLowerCase() || user.username.toLowerCase() === data.username.toLowerCase());
  if (exists) throw new Error("Email hoặc username đã tồn tại.");
  const user: User = {
    id: `u${mockUsers.length + 1}`,
    fullName: data.fullName,
    email: data.email,
    username: data.username,
    role: data.role || "student",
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  mockUsers.push(user);
  return user;
}
