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

import axiosInstance from '../axiosInstance';
import { BASE_URL } from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
 * Xây dựng URL của HLS playlist proxy.
 * URL này được truyền thẳng vào hls.js hoặc react-native-video;
 * token JWT được gắn vào header bởi axiosInstance nên dùng riêng hàm này.
 *
 * Ví dụ dùng với react-native-video:
 *   const { uri, headers } = await getHlsStreamConfig(lessonId);
 *   <Video source={{ uri, headers }} />
 *
 * @param {number} lessonId
 * @returns {Promise<{ uri: string, headers: { Authorization: string } }>}
 */
export const getHlsStreamConfig = async (lessonId) => {
  const token = await AsyncStorage.getItem('token');
  return {
    uri: `${BASE_URL}/videos/stream/${lessonId}/playlist.m3u8`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
