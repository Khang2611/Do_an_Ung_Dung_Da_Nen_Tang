import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { COURSES } from '../../constants/mockData';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TABS = ['Nội dung', 'Tài liệu', 'Thảo luận'];

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Nội dung');
  const scrollRef = useRef(null);

  let lesson, course, chapter, lessonIndex, chapterLessons;
  for (const c of COURSES) {
    for (const ch of c.chapters) {
      const idx = ch.lessons.findIndex(l => l.id === id);
      if (idx !== -1) {
        lesson = ch.lessons[idx];
        course = c;
        chapter = ch;
        lessonIndex = idx;
        chapterLessons = ch.lessons;
        break;
      }
    }
    if (lesson) break;
  }

  if (!lesson) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bài học không tồn tại</Text>
    </View>
  );

  const prevLesson = lessonIndex > 0 ? chapterLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < chapterLessons.length - 1 ? chapterLessons[lessonIndex + 1] : null;

  const goToPrev = useCallback(() => {
    if (!prevLesson) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    router.replace(`/lesson/${prevLesson.id}`);
  }, [prevLesson]);

  const goToNext = useCallback(() => {
    if (!nextLesson) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    router.replace(`/lesson/${nextLesson.id}`);
  }, [nextLesson]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <View style={s.container}>
      {/* Video player mock */}
      <View style={s.videoPlayer}>
        <View style={s.videoInner}>
          <Text style={s.playIcon}>▶</Text>
          <Text style={s.videoLabel}>Video: {lesson.title}</Text>
          <Text style={s.videoDur}>{lesson.duration}</Text>
        </View>
        <View style={s.videoProgress}>
          <View style={s.videoProgressFill} />
        </View>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={s.body}>
          <Text style={s.chapterName}>{chapter.title}</Text>
          <Text style={s.title}>{lesson.title}</Text>

          <View style={s.tabRow}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TabContent activeTab={activeTab} lesson={lesson} />

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
          <Text style={[s.navBtnText, !prevLesson && { color: COLORS.textMuted }]}>← Trước</Text>
        </TouchableOpacity>
        <View style={s.lessonCount}>
          <Text style={s.lessonCountText}>{lessonIndex + 1} / {chapterLessons.length}</Text>
        </View>
        <TouchableOpacity
          style={[s.navBtn, s.navBtnNext, !nextLesson && s.navBtnDisabled]}
          disabled={!nextLesson}
          onPress={goToNext}
        >
          <Text style={[s.navBtnText, { color: nextLesson ? '#fff' : COLORS.textMuted }]}>Tiếp →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabContent({ activeTab, lesson }) {
  if (activeTab === 'Nội dung') {
    return (
      <View style={s.contentBox}>
        <Text style={s.contentTitle}>📝 Ghi chú bài học</Text>
        <Text style={s.contentText}>
          Trong bài học này, bạn sẽ tìm hiểu về "{lesson.title}". Đây là nội dung demo — trong
          phiên bản thực tế, nội dung sẽ được tải từ backend thông qua MinIO pre-signed URL.{'\n\n'}
          • Nắm vững các khái niệm cơ bản{'\n'}
          • Thực hành với ví dụ thực tế{'\n'}
          • Bài tập cuối bài để củng cố kiến thức
        </Text>
      </View>
    );
  }

  if (activeTab === 'Tài liệu') {
    return (
      <View style={s.contentBox}>
        <Text style={s.contentTitle}>📎 Tài liệu đính kèm</Text>
        <Text style={s.contentText}>
          {'• Slide bài giảng (PDF)\n'}
          {'• Bài tập thực hành\n'}
          {'• Từ vựng trọng tâm'}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.contentBox}>
      <Text style={s.contentTitle}>💬 Thảo luận</Text>
      <Text style={s.contentText}>
        Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi về bài học này!
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  videoPlayer: { width: '100%', height: width * 9 / 16, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  videoInner: { alignItems: 'center', gap: 8 },
  playIcon: { fontSize: 48, color: 'rgba(255,255,255,0.9)' },
  videoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  videoDur: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  videoProgress: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  videoProgressFill: { height: 3, width: '35%', backgroundColor: COLORS.primary },
  body: { padding: 20, gap: 12 },
  chapterName: { fontSize: 12, color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, lineHeight: 28 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { paddingHorizontal: 16, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  contentBox: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.sm },
  contentTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  contentText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  completeBtn: { backgroundColor: COLORS.success, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  nav: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 32, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  navBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  navBtnNext: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  lessonCount: { paddingHorizontal: 12 },
  lessonCountText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
});
