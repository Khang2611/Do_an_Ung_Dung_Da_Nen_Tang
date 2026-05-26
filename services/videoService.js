/**
 * services/videoService.js
 *
 * Gọi API video (HLS streaming bảo mật):
 *   GET /api/videos/signed-url/:lessonId           → Signed URL cho video MP4
 *   GET /api/videos/stream/:lessonId/playlist.m3u8 → HLS playlist (proxy)
 *
 * Backend route: VideoController.java
 * Yêu cầu JWT + user phải đã đăng ký khóa học chứa bài học đó.
 */

import axiosInstance from "../axiosInstance";
import { BASE_URL } from "../axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isHlsVideo = (videoUrl) => {
  return (
    typeof videoUrl === "string" && videoUrl.toLowerCase().endsWith(".m3u8")
  );
};

const isMp4Video = (videoUrl) => {
  return (
    typeof videoUrl === "string" && videoUrl.toLowerCase().endsWith(".mp4")
  );
};

/**
 * Lấy Signed URL cho video (xem trực tiếp, hết hạn sau 1h)
 * @param {number} lessonId
 * @returns {Promise<string>} URL video
 */
export const getSignedUrl = async (lessonId) => {
  const { data } = await axiosInstance.get(`/videos/signed-url/${lessonId}`);
  // Backend trả plain string (không phải JSON ApiResponse)
  return data;
};

/**
 * Xây dựng cấu hình video dựa theo loại video trong backend.
 * - HLS (.m3u8) sử dụng route `/api/videos/stream/:lessonId/playlist.m3u8`
 * - MP4 sử dụng route `/api/videos/signed-url/:lessonId`
 *
 * @param {number|string} lessonId
 * @param {string} videoUrl
 * @returns {Promise<{ uri: string, headers: Record<string, string>, isHls: boolean }>}
 */
export const getVideoSource = async (lessonId, videoUrl) => {
  if (isHlsVideo(videoUrl)) {
    const token = await AsyncStorage.getItem("token");

    if (Platform.OS === "web") {
      return {
        uri: `${BASE_URL}/videos/stream/${lessonId}/playlist.m3u8${token ? `?token=${token}` : ""}`,
        headers: {},
        isHls: true,
      };
    }
    return {
      uri: `${BASE_URL}/videos/stream/${lessonId}/playlist.m3u8`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      isHls: true,
    };
  }

  if (isMp4Video(videoUrl)) {
    const uri = await getSignedUrl(lessonId);
    return {
      uri,
      headers: {},
      isHls: false,
    };
  }

  // Fallback nếu backend trả kiểu video khác hoặc chưa xác định
  return {
    uri: await getSignedUrl(lessonId),
    headers: {},
    isHls: false,
  };
};

export { isHlsVideo };
