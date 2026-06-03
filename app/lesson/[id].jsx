import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getLesson, getLessonsByChapter } from "../../services/lessonService";
import { getChapter, getChaptersByCourse } from "../../services/chapterService";
import { getCourse } from "../../services/courseService";
import { getVideoSource, isHlsVideo } from "../../services/videoService";
import { COURSES } from "../../constants/mockData";
import { COLORS, RADIUS, SHADOW } from "../../constants/theme";
import { VideoView, useVideoPlayer } from "expo-video";

const { width } = Dimensions.get("window");

const TABS = ["Nội dung", "Tài liệu", "Thảo luận"];

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Nội dung");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const videoRef = useRef(null);

  // States cho bài giảng tải từ API
  const [lesson, setLesson] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [chapterLessons, setChapterLessons] = useState([]);
  const [lessonIndex, setLessonIndex] = useState(-1);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // States cho Video Streaming
  const [streamConfig, setStreamConfig] = useState(null);
  const [isHls, setIsHls] = useState(false);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const videoPlayer = useVideoPlayer(
    streamConfig
      ? { uri: streamConfig.uri, headers: streamConfig.headers }
      : { uri: "" },
  );

  // 1. Tự động tải thư viện hls.js trên Web để stream video m3u8 bảo mật từ MinIO
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (window.Hls) {
      setHlsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.onload = () => setHlsLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. Tải thông tin chi tiết bài giảng từ API hoặc Mock Data
  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchLessonDetails = async () => {
      setLoading(true);
      try {
        // Tải chi tiết bài học từ API
        const lessonData = await getLesson(id);
        setLesson(lessonData);

        // Tải thông tin chương chứa bài học
        const chapterData = await getChapter(lessonData.chapterId);
        setChapter(chapterData);

        // Tải toàn bộ syllabus của khóa học để quản lý danh sách bài học và nút chuyển bài
        const courseData = await getCourse(chapterData.courseId);
        setCourse(courseData);

        // Tìm chương tương ứng trong course syllabus để lấy danh sách bài học đúng thứ tự
        const targetChapter = (courseData.chapters || []).find(
          (ch) => ch.chapterId === chapterData.chapterId,
        );
        const lessonsList = targetChapter ? targetChapter.lessons : [];
        setChapterLessons(lessonsList);

        const index = lessonsList.findIndex(
          (l) => l.lessonId === lessonData.lessonId,
        );
        setLessonIndex(index);

        const chapters = await getChaptersByCourse(chapterData.courseId);
        const chaptersWithLessons = await Promise.all(
          (chapters || [])
            .slice()
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map(async (ch) => {
              const lessons = await getLessonsByChapter(ch.chapterId || ch.id);
              return {
                ...ch,
                lessons: (lessons || [])
                  .slice()
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
              };
            }),
        );
        const courseLessons = chaptersWithLessons.flatMap((ch) => ch.lessons || []);
        setCourse({ ...courseData, chapters: chaptersWithLessons });
        setChapterLessons(courseLessons);
        setLessonIndex(
          courseLessons.findIndex(
            (l) => Number(l.lessonId || l.id) === Number(lessonData.lessonId || lessonData.id),
          ),
        );

        // Tải cấu hình video của bài học từ backend
        if (lessonData.videoUrl) {
          const cfg = await getVideoSource(id, lessonData.videoUrl);
          setStreamConfig(cfg);
          setIsHls(cfg.isHls);
        } else {
          setStreamConfig(null);
          setIsHls(false);
        }
      } catch (err) {
        console.error(
          "Lỗi tải bài học:",
          err.response?.status,
          err.response?.data || err.message,
        );
        Alert.alert(
          "Lỗi",
          err.response?.data?.message ||
            "Không thể tải bài học. Vui lòng thử lại.",
        );
        router.back();
        // Fallback sang Mock Data
        let foundLesson, foundCourse, foundChapter, foundIndex, foundLessons;
        for (const c of COURSES) {
          for (const ch of c.chapters) {
            const idx = ch.lessons.findIndex((l) => l.id === id);
            if (idx !== -1) {
              foundLesson = ch.lessons[idx];
              foundCourse = c;
              foundChapter = ch;
              foundIndex = idx;
              foundLessons = ch.lessons;
              break;
            }
          }
          if (foundLesson) break;
        }

        if (foundLesson) {
          setLesson(foundLesson);
          setChapter(foundChapter);
          setCourse(foundCourse);
          setChapterLessons(foundLessons);
          setLessonIndex(foundIndex);
          setStreamConfig(null);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy bài học.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [id]);

  // 3. Khởi tạo đầu phát video khi cấu hình stream hoặc hls.js đã sẵn sàng
  useEffect(() => {
    if (Platform.OS !== "web" || !videoRef.current || !streamConfig) return;
    const video = videoRef.current;

    if (!isHls) {
      video.src = streamConfig.uri;
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Hỗ trợ HLS gốc trên Safari và trình duyệt di động
      video.src = streamConfig.uri;
    } else if (window.Hls) {
      // Chrome/Firefox dùng hls.js kèm Authorization Header để lấy các mảnh .ts bảo mật từ MinIO
      const hls = new window.Hls({
        xhrSetup: (xhr) => {
          if (streamConfig.headers) {
            Object.keys(streamConfig.headers).forEach((key) => {
              xhr.setRequestHeader(key, streamConfig.headers[key]);
            });
          }
        },
      });
      hls.loadSource(streamConfig.uri);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, [streamConfig, hlsLoaded, isHls]);

  const prevLesson = lessonIndex > 0 ? chapterLessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < chapterLessons.length - 1
      ? chapterLessons[lessonIndex + 1]
      : null;

  const goToPrev = useCallback(() => {
    if (!prevLesson) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    router.replace(`/lesson/${prevLesson.lessonId || prevLesson.id}`);
  }, [prevLesson]);

  const goToNext = useCallback(() => {
    if (!nextLesson) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    router.replace(`/lesson/${nextLesson.lessonId || nextLesson.id}`);
  }, [nextLesson]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleAddComment = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
      },
    ]);
    setCommentText("");
  }, [commentText]);

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  if (!lesson)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
          Bài học không tồn tại
        </Text>
      </View>
    );

  return (
    <View style={s.container}>
      {/* Video Player */}
      {Platform.OS === "web" ? (
        streamConfig ? (
          <View style={s.videoPlayer}>
            <video
              ref={videoRef}
              controls
              style={{ width: "100%", height: "100%", borderRadius: RADIUS.md }}
              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
            />
          </View>
        ) : (
          <View style={s.videoPlayer}>
            <View style={s.videoInner}>
              <Text style={s.playIcon}>▶</Text>
              <Text style={s.videoLabel}>Video: {lesson.title}</Text>
              <Text style={s.videoDur}>
                {lesson.duration
                  ? typeof lesson.duration === "number"
                    ? `${Math.floor(lesson.duration / 60)}m`
                    : lesson.duration
                  : "Đang tải"}
              </Text>
            </View>
            <View style={s.videoProgress}>
              <View style={s.videoProgressFill} />
            </View>
          </View>
        )
      ) : streamConfig ? (
        <View style={s.videoPlayer}>
          <VideoView
            player={videoPlayer}
            nativeControls
            contentFit="contain"
            style={{ width: "100%", height: "100%", borderRadius: RADIUS.md }}
          />
        </View>
      ) : (
        // Giao diện video giả lập nếu chưa có file stream
        <View style={s.videoPlayer}>
          <View style={s.videoInner}>
            <Text style={s.playIcon}>▶</Text>
            <Text style={s.videoLabel}>Video: {lesson.title}</Text>
            <Text style={s.videoDur}>
              {lesson.duration
                ? typeof lesson.duration === "number"
                  ? `${Math.floor(lesson.duration / 60)}m`
                  : lesson.duration
                : "Đang tải"}
            </Text>
          </View>
          <View style={s.videoProgress}>
            <View style={s.videoProgressFill} />
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.body}>
          <Text style={s.chapterName}>{chapter?.title || "Chương học"}</Text>
          <Text style={s.title}>{lesson.title}</Text>

          <View style={s.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TabContent
            activeTab={activeTab}
            lesson={lesson}
            commentText={commentText}
            comments={comments}
            onCommentChange={setCommentText}
            onAddComment={handleAddComment}
          />

          <TouchableOpacity style={s.completeBtn}>
            <Text style={s.completeBtnText}>✅ Đánh dấu hoàn thành</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Navigation */}
      <View style={s.nav}>
        <TouchableOpacity
          style={[s.navBtn, !prevLesson && s.navBtnDisabled]}
          disabled={!prevLesson}
          onPress={goToPrev}
        >
          <Text
            style={[s.navBtnText, !prevLesson && { color: COLORS.textMuted }]}
          >
            ← Trước
          </Text>
        </TouchableOpacity>
        <View style={s.lessonCount}>
          <Text style={s.lessonCountText}>
            {lessonIndex + 1} / {chapterLessons.length}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.navBtn, s.navBtnNext, !nextLesson && s.navBtnDisabled]}
          disabled={!nextLesson}
          onPress={goToNext}
        >
          <Text
            style={[
              s.navBtnText,
              { color: nextLesson ? "#fff" : COLORS.textMuted },
            ]}
          >
            Tiếp →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabContent({
  activeTab,
  lesson,
  commentText,
  comments,
  onCommentChange,
  onAddComment,
}) {
  if (activeTab === "Nội dung") {
    return (
      <View style={s.contentBox}>
        <Text style={s.contentTitle}>📝 Tóm tắt & Hướng dẫn bài học</Text>
        <Text style={s.contentText}>
          {lesson.content ||
            `Chào mừng bạn đến với bài học "${lesson.title}". Hãy xem kỹ video bài giảng bên trên, ghi chép lại các mẫu câu giao tiếp và thực hành phát âm theo giáo viên để đạt hiệu quả cao nhất.`}
        </Text>
      </View>
    );
  }

  if (activeTab === "Tài liệu") {
    return (
      <View style={s.contentBox}>
        <Text style={s.contentTitle}>📎 Tài liệu đính kèm</Text>
        <Text style={s.contentText}>
          {"• Slide bài giảng chi tiết (PDF)\n"}
          {"• File nghe Mp3 chất lượng cao\n"}
          {"• Bài tập thực hành tự luận & đáp án"}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.contentBox}>
      <Text style={s.contentTitle}>💬 Thảo luận lớp học</Text>
      <Text style={s.contentText}>
        Chưa có bình luận nào trong bài học này. Hãy để lại thắc mắc của bạn bên
        dưới để thầy cô hỗ trợ giải đáp nhé!
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  videoPlayer: {
    width: "100%",
    height: (width * 9) / 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  videoInner: { alignItems: "center", gap: 8 },
  playIcon: { fontSize: 48, color: "rgba(255,255,255,0.9)" },
  videoLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  videoDur: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  videoProgress: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  videoProgressFill: {
    height: 3,
    width: "35%",
    backgroundColor: COLORS.primary,
  },
  body: { padding: 20, gap: 12 },
  chapterName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 28,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  tabTextActive: { color: COLORS.primary, fontWeight: "700" },
  contentBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOW.sm,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  contentText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  completeBtn: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  navBtnNext: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  lessonCount: { paddingHorizontal: 12 },
  lessonCountText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
