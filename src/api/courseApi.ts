import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { CHAPTERS, COURSES, LESSONS } from "./endpoints";
import { getLessonResources, uploadLessonResource } from "./resourceApi";
import { uploadLessonVideo } from "./videoApi";
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

function isPersistedId(id?: string, temporaryPrefix?: string) {
  return Boolean(id) && (!temporaryPrefix || !String(id).startsWith(temporaryPrefix)) && Number.isFinite(Number(id));
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
    resources: raw?.resources || [],
    pendingResourceFiles: raw?.pendingResourceFiles || [],
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
      const chapterId = String(chapter.chapterId ?? chapter.id);
      const lessonResponse = await axiosClient.get(`${LESSONS}/chapter/${chapterId}`);
      const lessons = await Promise.all(
        asArray(unwrap<any[] | any>(lessonResponse)).map(async (lesson) => {
          const normalized = normalizeLesson(lesson);
          normalized.resources = await getLessonResources(normalized.id);
          return normalized;
        }),
      );
      return normalizeChapter(chapter, lessons);
    }),
  );
}

async function createBackendChapter(courseId: string, chapter: Chapter, orderIndex: number) {
  const response = await axiosClient.post(CHAPTERS, {
    courseId: Number(courseId),
    title: chapter.title,
    orderIndex,
  });
  return normalizeChapter(unwrap<any>(response));
}

async function updateBackendChapter(chapter: Chapter, orderIndex: number) {
  const response = await axiosClient.put(`${CHAPTERS}/${chapter.id}`, {
    title: chapter.title,
    orderIndex,
  });
  return normalizeChapter(unwrap<any>(response));
}

async function createBackendLesson(chapterId: string, lesson: Lesson, orderIndex: number) {
  const response = await axiosClient.post(LESSONS, {
    chapterId: Number(chapterId),
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl || "",
    duration: toMinutes(lesson.duration),
    orderIndex,
  });
  return normalizeLesson(unwrap<any>(response));
}

async function updateBackendLesson(lesson: Lesson, orderIndex: number) {
  const response = await axiosClient.put(`${LESSONS}/${lesson.id}`, {
    title: lesson.title,
    content: lesson.content,
    videoUrl: lesson.videoUrl || "",
    duration: toMinutes(lesson.duration),
    orderIndex,
  });
  return normalizeLesson(unwrap<any>(response));
}

async function syncCourseContent(courseId: string, chapters: Chapter[] = []) {
  const syncedChapters: Chapter[] = [];
  const existingChapters = await getBackendChapters(courseId);

  for (const [chapterIndex, chapter] of chapters.entries()) {
    const savedChapter = isPersistedId(chapter.id, "ch-")
      ? await updateBackendChapter(chapter, chapterIndex + 1)
      : await createBackendChapter(courseId, chapter, chapterIndex + 1);
    const existingLessons = existingChapters.find((item) => item.id === savedChapter.id)?.lessons || [];
    const syncedLessons: Lesson[] = [];

    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      const savedLesson = isPersistedId(lesson.id, "ls-")
        ? await updateBackendLesson(lesson, lessonIndex + 1)
        : await createBackendLesson(savedChapter.id, lesson, lessonIndex + 1);
      if (lesson.pendingVideoFile) {
        const videoResponse = await uploadLessonVideo(savedLesson.id, lesson.pendingVideoFile);
        savedLesson.videoUrl = videoResponse?.result?.videoUrl || videoResponse?.result || videoResponse?.data?.videoUrl || videoResponse?.data || savedLesson.videoUrl;
        savedLesson.hasVideo = Boolean(savedLesson.videoUrl);
        savedLesson.videoStatus = savedLesson.videoUrl ? "ready" : savedLesson.videoStatus;
      }
      if (lesson.pendingResourceFiles?.length) {
        const uploadedResources = await Promise.all(lesson.pendingResourceFiles.map((file) => uploadLessonResource(savedLesson.id, file)));
        savedLesson.resources = [...(savedLesson.resources || []), ...uploadedResources];
      } else {
        savedLesson.resources = await getLessonResources(savedLesson.id);
      }
      syncedLessons.push(savedLesson);
    }

    const keptLessonIds = new Set(syncedLessons.map((lesson) => lesson.id));
    await Promise.all(
      existingLessons
        .filter((lesson) => isPersistedId(lesson.id) && !keptLessonIds.has(lesson.id))
        .map((lesson) => axiosClient.delete(`${LESSONS}/${lesson.id}`)),
    );

    syncedChapters.push({ ...savedChapter, lessons: syncedLessons });
  }

  const keptChapterIds = new Set(syncedChapters.map((chapter) => chapter.id));
  await Promise.all(
    existingChapters
      .filter((chapter) => isPersistedId(chapter.id) && !keptChapterIds.has(chapter.id))
      .map((chapter) => axiosClient.delete(`${CHAPTERS}/${chapter.id}`)),
  );

  return syncedChapters;
}

export async function getCourses(params?: CourseFilters): Promise<Course[]> {
  if (USE_MOCK) return filterCourses(params);
  const response = await axiosClient.get(COURSES, { params });
  const rawCourses = asArray(unwrap<any[] | any>(response));
  return Promise.all(
    rawCourses.map(async (item) => {
      const course = normalizeCourse(item);
      const chapters = await getBackendChapters(course.id);
      return normalizeCourse(item, chapters);
    }),
  );
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

  const response = await axiosClient.post(COURSES, {
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    price: data.price,
    categoryId: (data as any).categoryId,
  });
  const course = normalizeCourse(unwrap<any>(response));
  const chapters = await syncCourseContent(course.id, data.chapters || []);
  return normalizeCourse({ ...course, totalLessons: chapters.flatMap((chapter) => chapter.lessons).length }, chapters);
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
    thumbnail: data.thumbnail,
    price: data.price,
    categoryId: (data as any).categoryId,
  });
  const chapters = await syncCourseContent(id, data.chapters || []);
  return normalizeCourse(unwrap<any>(response), chapters);
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
