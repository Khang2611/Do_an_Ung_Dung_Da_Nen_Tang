import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function CourseCard({ course, style }) {
  const isFree = course.price === 0;
  const categoryName = course.category?.name || 'Chưa phân loại';

  const thumbnail = course.thumbnail || course.courseThumbnail;
  const imageSource = typeof thumbnail === 'string' 
    ? { uri: thumbnail } 
    : (thumbnail || require('../assets/images/course_english_1.jpg'));

  return (
    <TouchableOpacity 
      style={[s.card, style]} 
      onPress={() => router.push(`/course/${course.courseId || course.id}`)}
    >
      <Image 
        source={imageSource} 
        style={s.thumb} 
      />
      <View style={s.body}>
        <View style={s.tagRow}>
          <View style={[s.tag, { backgroundColor: isFree ? '#D1FAE5' : COLORS.primaryLight }]}>
            <Text style={[s.tagText, { color: isFree ? COLORS.success : COLORS.primary }]}>
              {isFree ? 'Miễn phí' : categoryName}
            </Text>
          </View>
          {course.level && (
            <View style={s.levelTag}>
              <Text style={s.levelText}>{course.level}</Text>
            </View>
          )}
        </View>
        <Text style={s.title} numberOfLines={2}>{course.title}</Text>
        <Text style={s.instructor}>{course.instructor || 'Giảng viên'}</Text>
        <View style={s.footer}>
          <Text style={s.rating}>⭐ {course.rating || 0}</Text>
          <Text style={s.dot}>·</Text>
          <Text style={s.students}>{(course.students || 0).toLocaleString()} học viên</Text>
        </View>
        <Text style={s.price}>
          {isFree ? 'Miễn phí' : `${(course.price || 0).toLocaleString('vi-VN')}đ`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.sm },
  thumb: { width: '100%', height: 130 },
  body: { padding: 12, gap: 4 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
  levelTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FEF3C7' },
  levelText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  instructor: { fontSize: 12, color: COLORS.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  dot: { color: COLORS.textMuted },
  students: { fontSize: 12, color: COLORS.textSecondary },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
});
