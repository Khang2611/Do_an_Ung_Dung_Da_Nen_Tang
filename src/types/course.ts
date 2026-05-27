export type CourseStatus = "draft" | "published" | "pending" | "hidden" | "approved" | "rejected" | "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type?: "video" | "quiz" | "reading";
  content?: string;
  description?: string;
  isPreview?: boolean;
  hasVideo?: boolean;
  videoStatus?: "missing" | "processing" | "ready" | "error";
  videoUrl?: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  instructorName: string;
  totalLessons: number;
  duration: string;
  rating: number;
  studentsCount: number;
  status: CourseStatus | string;
  progress?: number;
  chapters: Chapter[];
  lessons: Lesson[];
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  price?: "all" | "free" | "paid";
}

export interface Enrollment {
  id: string;
  userId?: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  status: "pending" | "approved" | "rejected" | "ACTIVE" | "CANCELLED" | "PENDING";
  paymentStatus?: "PAID" | "PENDING" | "FAILED";
  paymentMethod?: "VNPAY" | "MOMO" | "BANK_TRANSFER" | "DEMO";
  amount?: number;
  enrolledAt?: string;
  progress?: number;
  completedLessons?: string[];
  createdAt: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  method: "VNPAY" | "MOMO" | "BANK_TRANSFER" | "DEMO";
  status: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
}
