import axiosClient, { API_BASE_URL, unwrap } from "./axiosClient";
import type { LessonResource } from "../types/course";

function normalizeResource(raw: any): LessonResource {
  return {
    id: String(raw?.resourceId ?? raw?.id),
    lessonId: String(raw?.lessonId ?? ""),
    name: raw?.name || "Tai lieu",
    url: raw?.url || "",
    type: raw?.type || "",
    createdDate: raw?.createdDate,
  };
}

export function getResourceDownloadUrl(resourceId: string | number) {
  return `${API_BASE_URL}/api/resources/${resourceId}/download`;
}

export async function getLessonResources(lessonId: string | number): Promise<LessonResource[]> {
  const response = await axiosClient.get(`/api/resources/lesson/${lessonId}`);
  const data = unwrap<any[] | any>(response);
  return (Array.isArray(data) ? data : data ? [data] : []).map(normalizeResource);
}

export async function uploadLessonResource(lessonId: string | number, file: File): Promise<LessonResource> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post(`/api/resources/upload/${lessonId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 2 * 60 * 1000,
  });
  return normalizeResource(unwrap<any>(response));
}

export async function deleteLessonResource(resourceId: string | number) {
  await axiosClient.delete(`/api/resources/${resourceId}`);
}
