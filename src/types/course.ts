export type CourseStatus = "draft" | "published" | "pending" | "hidden" | "approved";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type?: "video" | "quiz" | "reading";
  content?: string;
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
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
