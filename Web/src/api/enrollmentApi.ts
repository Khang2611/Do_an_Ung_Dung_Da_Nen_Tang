import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { ENROLLMENTS, ENROLLMENTS_ME } from "./endpoints";
import { normalizeCourse } from "./courseApi";
import { addMockEnrollment, getAllMockEnrollments, getMockMyCourses, isMockCourseEnrolled, mockEnrollments } from "../data/mockData";
import type { Course, Enrollment } from "../types/course";

function getStoredUserId() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return user?.id || user?.userId || null;
  } catch {
    return null;
  }
}

function normalizeEnrollment(raw: any): Enrollment {
  const backendStatus = String(raw?.status || "ACTIVE").toUpperCase();
  const status: Enrollment["status"] =
    backendStatus === "REJECTED" ? "rejected" : backendStatus === "PENDING" ? "pending" : "approved";

  return {
    id: String(raw?.enrollmentId ?? raw?.id),
    courseId: String(raw?.courseId),
    courseTitle: raw?.courseTitle || `Khóa học #${raw?.courseId}`,
    studentName: raw?.studentName || `User #${raw?.userId}`,
    studentEmail: raw?.studentEmail || "",
    status,
    createdAt: raw?.createdDate || raw?.enrolledAt || "",
  };
}

function normalizeMyEnrollmentCourse(raw: any): Course {
  return normalizeCourse({
    courseId: raw.courseId,
    title: raw.courseTitle,
    description: raw.courseDescription,
    price: raw.coursePrice,
    progress: raw.progress,
    status: raw.status,
  });
}

export async function enrollCourse(courseId: string) {
  if (USE_MOCK) return addMockEnrollment(courseId);
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error("Backend login hiện chưa trả userId nên Web chưa thể gọi POST /api/enrollments. Cần bổ sung userId vào LoginResponse hoặc thêm endpoint enroll theo current user.");
  }
  const response = await axiosClient.post(ENROLLMENTS, { userId: Number(userId), courseId: Number(courseId) });
  return unwrap(response);
}

export async function getMyCourses(): Promise<Course[]> {
  if (USE_MOCK) return getMockMyCourses();
  const response = await axiosClient.get(ENROLLMENTS_ME);
  return unwrap<any[]>(response).map(normalizeMyEnrollmentCourse);
}

export async function checkMyEnrollment(courseId: string): Promise<boolean> {
  if (USE_MOCK) return isMockCourseEnrolled(courseId);
  const response = await axiosClient.get(ENROLLMENTS_ME);
  return unwrap<any[]>(response).some((item) => String(item.courseId) === String(courseId) && String(item.status || "").toUpperCase() !== "REJECTED");
}

export async function updateProgress(courseId: string, lessonId: string) {
  if (USE_MOCK) return { courseId, lessonId, progress: 75 };
  throw new Error("Backend hiện chỉ có /api/learning-progresses theo enrollmentId/progressId, chưa có API update progress theo courseId + lessonId.");
}

export async function getEnrollments(): Promise<Enrollment[]> {
  if (USE_MOCK) return getAllMockEnrollments();
  const response = await axiosClient.get(ENROLLMENTS);
  return unwrap<any[]>(response).map(normalizeEnrollment);
}

export async function approveEnrollment(id: string) {
  if (USE_MOCK) {
    const enrollment = getAllMockEnrollments().find((item) => item.id === id) || mockEnrollments.find((item) => item.id === id);
    if (enrollment) enrollment.status = "approved";
    return enrollment;
  }
  const response = await axiosClient.put(`${ENROLLMENTS}/${id}`, { status: "APPROVED" });
  return unwrap(response);
}

export async function rejectEnrollment(id: string) {
  if (USE_MOCK) {
    const enrollment = getAllMockEnrollments().find((item) => item.id === id) || mockEnrollments.find((item) => item.id === id);
    if (enrollment) enrollment.status = "rejected";
    return enrollment;
  }
  const response = await axiosClient.put(`${ENROLLMENTS}/${id}`, { status: "REJECTED" });
  return unwrap(response);
}
