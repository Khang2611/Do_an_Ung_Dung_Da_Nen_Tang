import { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { COURSES, ENROLLMENTS, PROGRESS } from '../../constants/mockData';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';
import CourseCard from '../../components/CourseCard';

export default function HomeScreen() {
  const { user } = useAuth();

  const enrolled = useMemo(
    () => COURSES.filter(c => ENROLLMENTS.includes(c.id)),
    []
  );

  const featured = useMemo(() => COURSES.slice(0, 3), []);

  const goToMyLearning = useCallback(() => router.push('/(tabs)/my-learning'), []);
  const goToExplore    = useCallback(() => router.push('/(tabs)/explore'), []);
  const goToProfile    = useCallback(() => router.push('/(tabs)/profile'), []);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Xin chào 👋</Text>
          <Text style={s.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={goToProfile}>
          <Image source={{ uri: user?.avatar }} style={s.avatar} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={s.banner}>
        <Text style={s.bannerTitle}>Tiếp tục học tập{'\n'}hôm nay! 🚀</Text>
        <Text style={s.bannerSub}>Bạn đang học {enrolled.length} khóa học</Text>
        <TouchableOpacity style={s.bannerBtn} onPress={goToMyLearning}>
          <Text style={s.bannerBtnText}>Xem khóa học →</Text>
        </TouchableOpacity>
      </View>

      {/* Tiếp tục học */}
      {enrolled.length > 0 && (
        <Section title="Tiếp tục học" onMore={goToMyLearning}>
          {enrolled.map(course => {
            const prog = PROGRESS[course.id];
            return (
              <TouchableOpacity
                key={course.id}
                style={s.resumeCard}
                onPress={() => router.push(`/course/${course.id}`)}
              >
                <Image source={{ uri: course.thumbnail }} style={s.resumeThumb} />
                <View style={s.resumeInfo}>
                  <Text style={s.resumeTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={s.resumeInstructor}>{course.instructor}</Text>
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${prog?.percent || 0}%` }]} />
                  </View>
                  <Text style={s.progressText}>{prog?.percent || 0}% hoàn thành</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Section>
      )}

      {/* Khóa học nổi bật */}
      <Section title="Khóa học nổi bật" onMore={goToExplore}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 24 }}>
          {featured.map(c => <CourseCard key={c.id} course={c} style={{ width: 240 }} />)}
        </ScrollView>
      </Section>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Section({ title, onMore, children }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onMore}><Text style={s.seeAll}>Xem tất cả</Text></TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: COLORS.white },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.primaryLight },
  banner: { margin: 20, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary, padding: 24, ...SHADOW.md },
  bannerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', lineHeight: 30 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6, marginBottom: 16 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  section: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  resumeCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginHorizontal: 20, marginBottom: 12, overflow: 'hidden', ...SHADOW.sm },
  resumeThumb: { width: 100, height: 90 },
  resumeInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  resumeTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  resumeInstructor: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { fontSize: 11, color: COLORS.textMuted },
});
