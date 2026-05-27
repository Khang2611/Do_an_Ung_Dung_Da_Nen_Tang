import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { CHAPTERS, COURSES, LESSONS } from "./endpoints";
import { mockCourses } from "../data/mockData";
import type { Chapter, Course, CourseFilters, Lesson } from "../types/course";

const fallbackThumb = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

function toMinutes(value?: string) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 10;
}

function asArray<T>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function normalizeLesson(raw: any): Lesson {
  return {
    id: String(raw?.lessonId ?? raw?.id),
    title: raw?.title || "Bài học",
    duration: raw?.duration ? `${raw.duration} phút` : "10 phút",
    content: raw?.content || "",
    description: raw?.description || raw?.content || "",
    isPreview: Boolean(raw?.isPreview),
    videoUrl: raw?.videoUrl || "",
    hasVideo: Boolean(raw?.hasVideo || raw?.videoUrl),
    videoStatus: raw?.videoStatus || (raw?.hasVideo || raw?.videoUrl ? "ready" : "missing"),
    type: "video",
  };
}

function normalizeChapter(raw: any, lessons: Lesson[] = []): Chapter {
  return {
    id: String(raw?.chapterId ?? raw?.id),
    title: raw?.title || "Chương học",
    lessons,
  };
}

export function normalizeCourse(raw: any, chapters: Chapter[] = []): Course {
  const category = raw?.category?.name || raw?.categoryName || raw?.category || "Chưa phân loại";
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  return {
    id: String(raw?.courseId ?? raw?.id),
    title: raw?.title || "Khóa học",
    description: raw?.description || "",
    category,
    level: raw?.level || "Cơ bản",
    price: Number(raw?.price || 0),
    thumbnail: raw?.thumbnail || fallbackThumb,
    instructorName: raw?.instructorName || "Giảng viên",
    totalLessons: lessons.length,
    duration: raw?.duration || (lessons.length ? `${lessons.length * 10} phút` : "Đang cập nhật"),
    rating: Number(raw?.rating || 0),
    studentsCount: Number(raw?.studentsCount || 0),
    status: raw?.status || "published",
    progress: raw?.progress,
    chapters,
    lessons,
  };
}

function filterCourses(params?: CourseFilters) {
  const search = params?.search?.toLowerCase() || "";
  return mockCourses.filter((course) => {
    const matchSearch = !search || course.title.toLowerCase().includes(search) || course.description.toLowerCase().includes(search);
    const matchCategory = !params?.category || params.category === "Tất cả" || course.category === params.category;
    const matchLevel = !params?.level || params.level === "Tất cả" || course.level === params.level;
    const matchPrice = !params?.price || params.price === "all" || (params.price === "free" ? course.price === 0 : course.price > 0);
    return matchSearch && matchCategory && matchLevel && matchPrice;
  });
}

async function getBackendChapters(courseId: string): Promise<Chapter[]> {
  const chapterResponse = await axiosClient.get(`${CHAPTERS}/course/${courseId}`);
  const rawChapters = asArray(unwrap<any[] | any>(chapterResponse));
  return Promise.all(
    rawChapters.map(async (chapter) => {
      const lessonResponse = await axiosClient.get(`${LESSONS}/chapter/${chapter.chapterId}`);
      const lessons = asArray(unwrap<any[] | any>(lessonResponse)).map(normalizeLesson);
      return normalizeChapter(chapter, lessons);
    }),
  );
}

export async function getCourses(params?: CourseFilters): Promise<Course[]> {
  if (USE_MOCK) return filterCourses(params);
  const response = await axiosClient.get(COURSES, { params });
  return unwrap<any[]>(response).map((item) => normalizeCourse(item));
}

export async function getCourseById(id: string): Promise<Course> {
  if (USE_MOCK) {
    const course = mockCourses.find((item) => item.id === id);
    if (!course) throw new Error("Không tìm thấy khóa học.");
    return course;
  }
  const [courseResponse, chapters] = await Promise.all([axiosClient.get(`${COURSES}/${id}`), getBackendChapters(id)]);
  return normalizeCourse(unwrap<any>(courseResponse), chapters);
}

export async function createCourse(data: Partial<Course>) {
  if (USE_MOCK) {
    const lessons = data.chapters?.flatMap((chapter) => chapter.lessons) || [];
    const course = {
      ...mockCourses[0],
      ...data,
      id: `c${Date.now()}`,
      lessons,
      totalLessons: lessons.length,
      studentsCount: 0,
      rating: 0,
    } as Course;
    mockCourses.unshift(course);
    return course;
  }

  const courseResponse = await axiosClient.post(COURSES, {
    title: data.title,
    description: data.description,
    price: data.price,
    categoryId: (data as any).categoryId,
  });
  const course = normalizeCourse(unwrap<any>(courseResponse));

  for (const [chapterIndex, chapter] of (data.chapters || []).entries()) {
    const chapterResponse = await axiosClient.post(CHAPTERS, {
      courseId: Number(course.id),
      title: chapter.title,
      orderIndex: chapterIndex + 1,
    });
    const createdChapter = unwrap<any>(chapterResponse);
    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      await axiosClient.post(LESSONS, {
        chapterId: createdChapter.chapterId,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl || "",
        duration: toMinutes(lesson.duration),
        orderIndex: lessonIndex + 1,
      });
    }
  }

  return getCourseById(course.id);
}

export async function updateCourse(id: string, data: Partial<Course>) {
  if (USE_MOCK) {
    const index = mockCourses.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Không tìm thấy khóa học.");
    const lessons = data.chapters?.flatMap((chapter) => chapter.lessons) || data.lessons || mockCourses[index].lessons;
    mockCourses[index] = { ...mockCourses[index], ...data, lessons, totalLessons: lessons.length };
    return mockCourses[index];
  }

  const response = await axiosClient.put(`${COURSES}/${id}`, {
    title: data.title,
    description: data.description,
    price: data.price,
    categoryId: (data as any).categoryId,
  });
  return normalizeCourse(unwrap<any>(response), data.chapters);
}

export async function submitCourseForReview(id: string) {
  if (USE_MOCK) {
    const index = mockCourses.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Không tìm thấy khóa học.");
    mockCourses[index] = { ...mockCourses[index], status: "PENDING_REVIEW" };
    return mockCourses[index];
  }
  const response = await axiosClient.patch(`${COURSES}/${id}/submit-review`);
  return normalizeCourse(unwrap<any>(response));
}

export async function deleteCourse(id: string) {
  if (USE_MOCK) {
    const index = mockCourses.findIndex((item) => item.id === id);
    if (index >= 0) mockCourses.splice(index, 1);
    return;
  }
  await axiosClient.delete(`${COURSES}/${id}`);
}
