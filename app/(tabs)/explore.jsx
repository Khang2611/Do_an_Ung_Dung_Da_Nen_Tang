import { useState } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { COURSES, CATEGORIES } from '../../constants/mockData';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';
import CourseCard from '../../components/CourseCard';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');

  const filtered = COURSES.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    const matchLevel = activeLevel === 'all' || c.level === activeLevel;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Khám phá khóa học</Text>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
            placeholder="Tìm kiếm khóa học, giảng viên..." placeholderTextColor={COLORS.textMuted} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Text>✕</Text></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {[{ id: 'all', name: 'Tất cả', icon: '🌟' }, ...CATEGORIES].map(cat => (
            <TouchableOpacity key={cat.id} style={[s.catChip, activeCategory === (cat.id === 'all' ? 'all' : cat.name) && s.catChipActive]}
              onPress={() => setActiveCategory(cat.id === 'all' ? 'all' : cat.name)}>
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catText, activeCategory === (cat.id === 'all' ? 'all' : cat.name) && s.catTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Level filter */}
        <View style={s.levelRow}>
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map(l => (
            <TouchableOpacity key={l} style={[s.levelChip, activeLevel === l && s.levelChipActive]}
              onPress={() => setActiveLevel(l)}>
              <Text style={[s.levelText, activeLevel === l && s.levelTextActive]}>
                {l === 'all' ? 'Tất cả' : l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <Text style={s.resultText}>{filtered.length} khóa học</Text>
        <View style={s.grid}>
          {filtered.map(c => <CourseCard key={c.id} course={c} style={s.gridItem} />)}
          {filtered.length === 0 && <Text style={s.empty}>Không tìm thấy khóa học nào 😢</Text>}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, padding: 20, paddingTop: 56, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.md, paddingHorizontal: 12, borderWidth: 1.5, borderColor: COLORS.border, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  catScroll: { marginVertical: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  catIcon: { fontSize: 14 },
  catText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  catTextActive: { color: COLORS.primary, fontWeight: '600' },
  levelRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  levelChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  levelChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  levelText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  levelTextActive: { color: '#fff', fontWeight: '600' },
  resultText: { paddingHorizontal: 20, fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  grid: { paddingHorizontal: 20, gap: 12 },
  gridItem: { marginBottom: 0 },
  empty: { textAlign: 'center', color: COLORS.textMuted, fontSize: 14, marginTop: 40 },
});
