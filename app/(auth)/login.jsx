/**
 * LoginScreen – React Hook Form version
 *
 * Áp dụng theo hướng dẫn "validate form với React Hook Form trong React Native"
 * Dùng useForm + Controller thay cho useState quản lý từng TextInput.
 */
import { useRef, useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // useForm – khởi tạo form với defaultValues
  // isSubmitting tự set true khi onSubmit async đang chạy
  // ─────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 2.4 useRef – focus sang ô mật khẩu khi nhấn "Tiếp" (giữ từ hướng dẫn hooks)
  const passwordRef = useRef(null);

  // onSubmit – chỉ được gọi khi TẤT CẢ field hợp lệ
  const onSubmit = useCallback(async (data) => {
    try {
      await login(data.username, data.password);
      router.replace('/(tabs)');
    } catch (e) {
      console.log('Login error details:', e);
      let msg = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      if (!e.response) {
        msg = 'Không thể kết nối tới máy chủ (Network Error). Vui lòng đảm bảo:\n1. Điện thoại và máy tính kết nối CÙNG MỘT MẠNG WI-FI.\n2. Đã mở chặn tường lửa Windows cho Java.\n3. Server Backend đang chạy.';
      } else if (e.response.data?.message) {
        msg = e.response.data.message;
      }
      Alert.alert('Lỗi đăng nhập', msg);
    }
  }, [login]);

  // onSubmitError – gọi khi có field lỗi validate
  const onSubmitError = useCallback(() => {
    Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đăng nhập.');
  }, []);

  const handleTogglePass = useCallback(() => setShowPass(p => !p), []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>🎓</Text>
          </View>
          <Text style={s.title}>Chào mừng trở lại!</Text>
          <Text style={s.subtitle}>Đăng nhập để tiếp tục học tập</Text>
        </View>

        <View style={s.form}>
          {/* ── Tên đăng nhập ── required */}
          <Text style={s.label}>Tên đăng nhập</Text>
          <Controller
            control={control}
            name="username"
            rules={{ required: 'Tên đăng nhập là bắt buộc' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[s.input, errors.username && s.inputError]}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            )}
          />
          {errors.username && <Text style={s.errorText}>⚠ {errors.username.message}</Text>}

          {/* ── Mật khẩu ── required + minLength */}
          <Text style={s.label}>Mật khẩu</Text>
          <View style={s.passRow}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Mật khẩu là bắt buộc',
                minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={passwordRef}
                  style={[s.input, { flex: 1 }, errors.password && s.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showPass}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit, onSubmitError)}
                />
              )}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={handleTogglePass}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={s.errorText}>⚠ {errors.password.message}</Text>}

          <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={s.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* handleSubmit(onSubmit, onSubmitError):
              - Tự validate rules trước khi gọi
              - isSubmitting = true trong lúc onSubmit chạy */}
          <TouchableOpacity
            style={[s.loginBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit, onSubmitError)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.loginBtnText}>Đăng nhập</Text>}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.divider} />
            <Text style={s.dividerText}>hoặc</Text>
            <View style={s.divider} />
          </View>

          <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={s.registerText}>
              Chưa có tài khoản?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  form: { gap: 2 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 2 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 12 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...SHADOW.md },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 13 },
  registerBtn: { alignItems: 'center' },
  registerText: { color: COLORS.textSecondary, fontSize: 14 },
});
