import axiosClient, { API_BASE_URL } from "./axiosClient";

export function getVideoPlaylistUrl(lessonId: string | number) {
  return `${API_BASE_URL}/api/videos/stream/${lessonId}/playlist.m3u8`;
}

export function getVideoSignedUrlEndpoint(lessonId: string | number) {
  return `${API_BASE_URL}/api/videos/signed-url/${lessonId}`;
}

export function getVideoKeyUrl(lessonId: string | number) {
  return `${API_BASE_URL}/api/videos/key/${lessonId}`;
}

export async function fetchHlsPlaylist(lessonId: string | number): Promise<string> {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Bạn cần đăng nhập để xem video.");

  const response = await fetch(getVideoPlaylistUrl(lessonId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.status === 403 ? "Bạn chưa đăng ký khóa học này nên không thể xem video." : "Không thể tải playlist video.");
  }

  return response.text();
}

export async function uploadLessonVideo(lessonId: string | number, file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post(`/api/videos/upload/${lessonId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 10 * 60 * 1000,
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return response.data;
}

export async function getSignedVideoUrl(lessonId: string | number): Promise<string> {
  const response = await axiosClient.get(`/api/videos/signed-url/${lessonId}`, {
    responseType: "text",
    transformResponse: [(data) => data],
  });
  return String(response.data || "");
}
