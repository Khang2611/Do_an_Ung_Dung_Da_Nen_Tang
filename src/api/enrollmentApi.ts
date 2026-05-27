import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { ENROLLMENTS, ENROLLMENTS_ME, LEARNING_PROGRESS } from "./endpoints";
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

async function getMyEnrollment(courseId: string) {
  const response = await axiosClient.get(ENROLLMENTS_ME);
  const enrollment = unwrap<any[]>(response).find(
    (item) => String(item.courseId) === String(courseId) && String(item.status || "").toUpperCase() !== "REJECTED",
  );
  if (!enrollment) throw new Error("Bạn chưa đăng ký khóa học này.");
  return enrollment;
}

export async function enrollCourse(courseId: string) {
  if (USE_MOCK) return addMockEnrollment(courseId);
  const userId = getStoredUserId();
  if (!userId) throw new Error("Backend chưa trả userId.");
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
  return unwrap<any[]>(response).some(
    (item) => String(item.courseId) === String(courseId) && String(item.status || "").toUpperCase() !== "REJECTED",
  );
}

export async function updateProgress(courseId: string, lessonId: string) {
  if (USE_MOCK) return { courseId, lessonId, progress: 75 };

  const enrollment = await getMyEnrollment(courseId);
  const enrollmentId = enrollment.enrollmentId ?? enrollment.id;
  const progressResponse = await axiosClient.get(`${LEARNING_PROGRESS}/enrollment/${enrollmentId}`);
  const existing = unwrap<any[]>(progressResponse).find((item) => String(item.lessonId) === String(lessonId));

  if (existing?.progressId) {
    const response = await axiosClient.put(`${LEARNING_PROGRESS}/${existing.progressId}`, { isCompleted: true });
    return unwrap(response);
  }

  const response = await axiosClient.post(LEARNING_PROGRESS, {
    enrollmentId: Number(enrollmentId),
    lessonId: Number(lessonId),
    isCompleted: true,
  });
  return unwrap(response);
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
