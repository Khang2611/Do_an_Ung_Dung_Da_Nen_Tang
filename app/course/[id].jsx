import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getCourse } from '../../services/courseService';
import { getMyEnrollments, createEnrollment } from '../../services/enrollmentService';
import { COURSES } from '../../constants/mockData';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();

  const [course, setCourse]         = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!id || id === 'undefined') return;

    setLoading(true);
    Promise.all([getCourse(id), getMyEnrollments()])
      .then(([courseData, enrollments]) => {
        setCourse(courseData);
        setIsEnrolled((enrollments ?? []).some(e => e.courseId === Number(id)));
      })
      .catch(err => {
        console.warn("Dữ liệu API chưa sẵn sàng cho ID: " + id + ". Sử dụng Mock Data.");
        // Tìm kiếm trong Mock Data dựa trên ID
        const fallbackCourse = COURSES.find(c => c.id == id || c.id === String(id));
        if (fallbackCourse) {
          setCourse(fallbackCourse);
          // Giả lập trạng thái đã đăng ký từ mockData
          const { ENROLLMENTS } = require('../../constants/mockData');
          setIsEnrolled(ENROLLMENTS.includes(Number(id)) || ENROLLMENTS.includes(String(id)));
        } else {
          console.error("Error fetching course details:", err);
          Alert.alert("Lỗi", "Không tìm thấy thông tin khóa học.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleExpanded = useCallback((chId) => {
    setExpanded(prev => ({ ...prev, [chId]: !prev[chId] }));
  }, []);

  const handleEnroll = useCallback(() => {
    if (isEnrolled && course?.chapters?.[0]?.lessons?.[0]) {
      const targetId = course.chapters[0].lessons[0].lessonId || course.chapters[0].lessons[0].id;
      return router.push(`/lesson/${targetId}`);
    }
    Alert.alert(
      'Đăng ký khóa học',
      `Đăng ký "${course?.title}" với giá ${course?.price === 0 ? 'Miễn phí' : course?.price?.toLocaleString('vi-VN') + 'đ'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng ký', 
          onPress: async () => {
            try {
              setLoading(true);
              const payload = {
                courseId: course.courseId || course.id
              };
              await createEnrollment(payload);
              Alert.alert('✅ Thành công', 'Bạn đã đăng ký khóa học thành công!');
              setIsEnrolled(true);
            } catch (err) {
              console.error("Error enrolling in course:", err);
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể đăng ký khóa học lúc này.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  }, [isEnrolled, course]);

  const handleLessonPress = useCallback((lesson) => {
    if (lesson.isFree || isEnrolled) {
      const targetId = lesson.lessonId || lesson.id;
      router.push(`/lesson/${targetId}`);
    } else {
      Alert.alert('🔒 Bài học trả phí', 'Vui lòng đăng ký khóa học để truy cập.');
    }
  }, [isEnrolled]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  if (!course) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Không tìm thấy khóa học</Text>
    </View>
  );

  const totalLessons = course.chapters
    ? course.chapters.reduce((a, ch) => a + (ch.lessons?.length || 0), 0)
    : 0;

  // Hàm xử lý ảnh an toàn
  const getSafeImage = (img) => {
    if (!img) return require('../../assets/images/course_english_1.jpg');
    if (typeof img === 'string') {
      if (img.includes('placeholder') || img.startsWith('http')) {
         // Nếu là placeholder hoặc link ngoài, ưu tiên dùng ảnh cục bộ tương ứng hoặc mặc định
         if (course.id == 1) return require('../../assets/images/course_english_1.jpg');
         if (course.id == 2) return require('../../assets/images/course_ielts.jpg');
         if (course.id == 3) return require('../../assets/images/course_vocab.jpg');
         return require('../../assets/images/course_english_1.jpg');
      }
      return { uri: img };
    }
    return img;
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={getSafeImage(course.thumbnail || course.courseThumbnail)} 
          style={s.thumbnail} 
        />
        <View style={s.body}>
          {/* Tags */}
          <View style={s.tagRow}>
            <View style={s.catTag}><Text style={s.catTagText}>{course.category?.name || 'Khóa học'}</Text></View>
            <View style={s.levelTag}><Text style={s.levelTagText}>{course.level || 'Cơ bản'}</Text></View>
          </View>
          <Text style={s.title}>{course.title}</Text>
          <Text style={s.instructor}>👨‍🏫 {course.instructor || 'Giảng viên hệ thống'}</Text>

          {/* Stats */}
          <View style={s.statsRow}>
            <Stat icon="⭐" value={`${course.rating || 5.0}`} label="Đánh giá" />
            <Stat icon="👥" value={(course.students || 0).toLocaleString()} label="Học viên" />
            <Stat icon="🕐" value={course.duration || '12h 30m'} label="Thời lượng" />
            <Stat icon="📖" value={`${totalLessons || 0}`} label="Bài học" />
          </View>

          {/* Description */}
          <Text style={s.sectionTitle}>Mô tả khóa học</Text>
          <Text style={s.description}>{course.description}</Text>

          {/* Curriculum */}
          <Text style={s.sectionTitle}>Nội dung khóa học</Text>
          <Text style={s.curriculumMeta}>{(course.chapters?.length || 0)} chương · {totalLessons} bài học</Text>

          {(course.chapters || []).map(ch => (
            <ChapterRow
              key={ch.chapterId || ch.id}
              chapter={ch}
              isExpanded={!!expanded[ch.chapterId || ch.id]}
              onToggle={toggleExpanded}
              onLessonPress={handleLessonPress}
              isEnrolled={isEnrolled}
            />
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.cta}>
        <View>
          <Text style={s.ctaPrice}>{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')}đ`}</Text>
          {isEnrolled && <Text style={s.enrolled}>✅ Đã đăng ký</Text>}
        </View>
        <TouchableOpacity style={s.ctaBtn} onPress={handleEnroll}>
          <Text style={s.ctaBtnText}>{isEnrolled ? 'Tiếp tục học' : 'Đăng ký ngay'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ChapterRow = React.memo(function ChapterRow({ chapter, isExpanded, onToggle, onLessonPress, isEnrolled }) {
  return (
    <View style={s.chapter}>
      <TouchableOpacity style={s.chapterHeader} onPress={() => onToggle(chapter.chapterId || chapter.id)}>
        <Text style={s.chapterTitle}>{chapter.title}</Text>
        <Text style={s.chapterMeta}>{(chapter.lessons || []).length} bài · {isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isExpanded && (chapter.lessons || []).map(lesson => (
        <TouchableOpacity
          key={lesson.lessonId || lesson.id}
          style={s.lessonRow}
          onPress={() => onLessonPress(lesson)}
        >
          <Text style={s.lessonIcon}>{lesson.isCompleted ? '✅' : (lesson.isFree || isEnrolled) ? '▶️' : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.lessonTitle}>{lesson.title}</Text>
            <Text style={s.lessonDur}>{lesson.duration ? (typeof lesson.duration === 'number' ? `${Math.floor(lesson.duration / 60)}m` : lesson.duration) : ''}</Text>
          </View>
          {lesson.isFree && <View style={s.freeTag}><Text style={s.freeTagText}>Miễn phí</Text></View>}
        </TouchableOpacity>
      ))}
    </View>
  );
});

function Stat({ icon, value, label }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  thumbnail: { width: '100%', height: 220 },
  body: { padding: 20, gap: 8 },
  tagRow: { flexDirection: 'row', gap: 8 },
  catTag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  catTagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  levelTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  levelTagText: { fontSize: 12, color: '#D97706', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, lineHeight: 30 },
  instructor: { fontSize: 14, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.sm, marginVertical: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  curriculumMeta: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  chapter: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: 8, overflow: 'hidden', ...SHADOW.sm },
  chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  chapterTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  chapterMeta: { fontSize: 12, color: COLORS.textMuted },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  lessonIcon: { fontSize: 16 },
  lessonTitle: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  lessonDur: { fontSize: 11, color: COLORS.textMuted },
  freeTag: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  freeTagText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 36, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
  ctaPrice: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  enrolled: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 13, paddingHorizontal: 28 },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
