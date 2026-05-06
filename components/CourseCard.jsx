import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function CourseCard({ course, style }) {
  const isFree = course.price === 0;
  return (
    <TouchableOpacity style={[s.card, style]} onPress={() => router.push(`/course/${course.id}`)}>
      <Image source={{ uri: course.thumbnail }} style={s.thumb} />
      <View style={s.body}>
        <View style={s.tagRow}>
          <View style={[s.tag, { backgroundColor: isFree ? '#D1FAE5' : COLORS.primaryLight }]}>
            <Text style={[s.tagText, { color: isFree ? COLORS.success : COLORS.primary }]}>
              {isFree ? 'Miễn phí' : course.category}
            </Text>
          </View>
          <View style={s.levelTag}>
            <Text style={s.levelText}>{course.level}</Text>
          </View>
        </View>
        <Text style={s.title} numberOfLines={2}>{course.title}</Text>
        <Text style={s.instructor}>{course.instructor}</Text>
        <View style={s.footer}>
          <Text style={s.rating}>⭐ {course.rating}</Text>
          <Text style={s.dot}>·</Text>
          <Text style={s.students}>{course.students.toLocaleString()} học viên</Text>
        </View>
        <Text style={s.price}>
          {isFree ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')}đ`}
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
