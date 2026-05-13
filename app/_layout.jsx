import { Stack } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]" options={{ headerShown: true, title: 'Chi tiết khóa học', headerTintColor: '#7C3AED' }} />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: true, title: 'Bài học', headerTintColor: '#7C3AED' }} />
      </Stack>
    </AuthProvider>
  );
}
