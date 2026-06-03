import type { AxiosProgressEvent } from "axios";
import axiosClient, { API_BASE_URL } from "./axiosClient";

export function getVideoPlaylistUrl(lessonId: string | number) {
  return `${API_BASE_URL}/api/videos/stream/${lessonId}/playlist.m3u8`;
}

interface UploadLessonVideoOptions {
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

export async function uploadLessonVideo(
  lessonId: string | number,
  file: File,
  progressOrOptions?: ((progress: number) => void) | UploadLessonVideoOptions,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post(`/api/videos/upload/${lessonId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 10 * 60 * 1000,
    signal: typeof progressOrOptions === "object" ? progressOrOptions.signal : undefined,
    onUploadProgress: (event) => {
      if (typeof progressOrOptions === "function") {
        if (!event.total) return;
        progressOrOptions(Math.round((event.loaded / event.total) * 100));
        return;
      }
      progressOrOptions?.onUploadProgress?.(event);
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
