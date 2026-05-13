import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { Text } from 'react-native';

const TAB_ICON = { index: '🏠', explore: '🔍', 'my-learning': '📚', profile: '👤' };
const TAB_LABEL = { index: 'Trang chủ', explore: 'Khám phá', 'my-learning': 'Học của tôi', profile: 'Hồ sơ' };

export default function TabsLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 6, paddingTop: 6, height: 60 },
      tabBarLabel: TAB_LABEL[route.name] || route.name,
      tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
    })}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="my-learning" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function TabIcon({ name, color }) {
  return <Text style={{ fontSize: 20 }}>{TAB_ICON[name] || '●'}</Text>;
}
