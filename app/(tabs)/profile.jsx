import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
<<<<<<< HEAD
=======
import { ENROLLMENTS, PROGRESS } from '../../constants/mockData';
>>>>>>> 1c62f9ab4cd0007a81634b40f72be2a8c7cd11b5
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
<<<<<<< HEAD
=======
  const totalCompleted = Object.values(PROGRESS).reduce((a, p) => a + p.completed, 0);
>>>>>>> 1c62f9ab4cd0007a81634b40f72be2a8c7cd11b5

  const MENU = [
    { icon: '📚', label: 'Khóa học của tôi', onPress: () => router.push('/(tabs)/my-learning') },
    { icon: '🏆', label: 'Chứng chỉ', onPress: () => {} },
    { icon: '🔔', label: 'Thông báo', onPress: () => {} },
    { icon: '🔒', label: 'Đổi mật khẩu', onPress: () => {} },
    { icon: '❓', label: 'Trợ giúp & Hỗ trợ', onPress: () => {} },
  ];

  const handleLogout = () => Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
  ]);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Profile card */}
      <View style={s.profileCard}>
<<<<<<< HEAD
        <Image 
          source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} 
          style={s.avatar} 
        />
        <Text style={s.name}>{user?.username}</Text>
        <Text style={s.email}>{user?.email ?? user?.role}</Text>
=======
        <Image source={{ uri: user?.avatar }} style={s.avatar} />
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
>>>>>>> 1c62f9ab4cd0007a81634b40f72be2a8c7cd11b5
        <View style={s.badge}><Text style={s.badgeText}>🎓 Học viên</Text></View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
<<<<<<< HEAD
          { value: 0, label: 'Khóa học' },
          { value: 0, label: 'Bài đã học' },
=======
          { value: ENROLLMENTS.length, label: 'Khóa học' },
          { value: totalCompleted, label: 'Bài đã học' },
>>>>>>> 1c62f9ab4cd0007a81634b40f72be2a8c7cd11b5
          { value: '0', label: 'Chứng chỉ' },
        ].map(st => (
          <View key={st.label} style={s.stat}>
            <Text style={s.statVal}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={[s.menuItem, i < MENU.length - 1 && s.menuBorder]} onPress={item.onPress}>
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileCard: { backgroundColor: COLORS.primary, alignItems: 'center', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 20, marginTop: -16, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.md, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginHorizontal: 20, marginTop: 20, ...SHADOW.sm, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  logoutBtn: { margin: 20, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', ...SHADOW.sm, borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 15, fontWeight: '600', color: COLORS.error },
});
