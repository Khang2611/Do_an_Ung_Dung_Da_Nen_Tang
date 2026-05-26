import axiosClient, { API_BASE_URL } from "./axiosClient";
import { VIDEOS } from "./endpoints";

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function getHlsStreamUrl(lessonId: string) {
  const token = localStorage.getItem("auth_token");
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${apiUrl(VIDEOS)}/stream/${lessonId}/playlist.m3u8${query}`;
}

export async function fetchHlsPlaylist(lessonId: string): Promise<string> {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xem video.");
  }

  const response = await fetch(`${apiUrl(VIDEOS)}/stream/${lessonId}/playlist.m3u8`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải playlist video cho bài học này.");
  }

  return response.text();
}

export async function getSignedVideoUrl(lessonId: string): Promise<string> {
  const response = await axiosClient.get(`${VIDEOS}/signed-url/${lessonId}`, {
    responseType: "text",
  });
  return typeof response.data === "string" ? response.data : String(response.data || "");
}

export async function uploadLessonVideo(lessonId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post(`${VIDEOS}/upload/${lessonId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return response.data;
}
