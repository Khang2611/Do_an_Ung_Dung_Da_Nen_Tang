import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getMyEnrollments } from '../../services/enrollmentService';
import { COURSES, ENROLLMENTS as MOCK_ENROLLMENTS } from '../../constants/mockData';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export default function MyLearningScreen() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then(data => {
        if (data && data.length > 0) {
          setEnrollments(data);
        } else {
          // Fallback to mock data
          const mockData = COURSES.filter(c => MOCK_ENROLLMENTS.includes(c.id));
          setEnrollments(mockData);
        }
      })
      .catch(err => {
        console.warn("Sử dụng Mock Data cho danh sách đăng ký.");
        const mockData = COURSES.filter(c => MOCK_ENROLLMENTS.includes(c.id));
        setEnrollments(mockData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.title}>Khóa học của tôi</Text>
        <Text style={s.sub}>{enrollments.length} khóa học đang học</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Đang học', value: enrollments.length, icon: '📚' },
          { label: 'Bài đã học', value: 0, icon: '✅' },
          { label: 'Hoàn thành', value: '0', icon: '🏆' },
        ].map(stat => (
          <View key={stat.label} style={s.statCard}>
            <Text style={s.statIcon}>{stat.icon}</Text>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Course list */}
      <Text style={s.sectionTitle}>Đang học</Text>
      {enrollments.map(course => {
        return (
          <TouchableOpacity 
            key={course.enrollmentId || course.courseId || course.id} 
            style={s.card} 
            onPress={() => router.push(`/course/${course.courseId || course.id}`)}
          >
            <Image 
              source={
                typeof (course.thumbnail || course.courseThumbnail) === 'string'
                  ? { uri: course.thumbnail || course.courseThumbnail }
                  : (course.thumbnail || course.courseThumbnail || require('../../assets/images/course_english_1.jpg'))
              } 
              style={s.thumb} 
            />
            <View style={s.info}>
              <Text style={s.courseTitle} numberOfLines={2}>{course.courseTitle || course.title}</Text>
              <Text style={s.instructor}>{course.courseInstructor || course.instructor || 'Giảng viên'}</Text>
              <View style={s.progressRow}>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${course.progress || 0}%` }]} />
                </View>
                <Text style={s.progressPct}>{course.progress || 0}%</Text>
              </View>
              <Text style={s.lessonCount}>
                {(course.completedLessons || 0)}/{(course.totalLessons || 0)} bài học
              </Text>
              <TouchableOpacity style={s.continueBtn} onPress={() => router.push(`/course/${course.courseId || course.id}`)}>
                <Text style={s.continueBtnText}>Tiếp tục học →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      {enrollments.length === 0 && (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>Chưa có khóa học nào</Text>
          <Text style={s.emptySub}>Khám phá và đăng ký khóa học ngay!</Text>
          <TouchableOpacity style={s.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={s.exploreBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, padding: 20, paddingTop: 56 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, margin: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', ...SHADOW.sm },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, marginBottom: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginHorizontal: 20, marginBottom: 16, overflow: 'hidden', ...SHADOW.sm },
  thumb: { width: '100%', height: 160 },
  info: { padding: 14, gap: 4 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  instructor: { fontSize: 13, color: COLORS.textSecondary },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  progressPct: { fontSize: 13, fontWeight: '700', color: COLORS.primary, width: 36 },
  lessonCount: { fontSize: 12, color: COLORS.textMuted },
  continueBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  continueBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  exploreBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  exploreBtnText: { color: '#fff', fontWeight: '600' },
});
