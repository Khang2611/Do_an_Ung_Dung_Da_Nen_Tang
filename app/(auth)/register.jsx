/**
 * RegisterScreen – React Hook Form version
 *
 * Áp dụng theo hướng dẫn "validate form với React Hook Form trong React Native"
 * Thay thế việc quản lý state từng TextInput bằng useState bằng useForm + Controller.
 *
 * Hooks dùng:
 *   useForm    – khởi tạo form, lấy control / handleSubmit / formState / watch / reset
 *   Controller – kết nối từng TextInput với form (thay cho register trên web)
 *   watch      – đọc giá trị password real-time để validate confirmPassword
 */
import { useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';



export default function RegisterScreen() {
  const { register } = useAuth();
  // ─────────────────────────────────────────────────────────────
  // 7.1 Khởi tạo useForm (Mục 7.1 – tutorial)
  //   control      – truyền vào Controller cho từng field
  //   handleSubmit – bọc submit, tự validate trước khi gọi onSubmit
  //   formState    – chứa errors và isSubmitting
  //   reset        – reset form về defaultValues
  //   watch        – đọc giá trị field để validate liên phụ thuộc
  // ─────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // 7.4 watch('password') – lấy giá trị password real-time để validate confirmPassword
  const passwordValue = watch('password');

  // 2.4 useRef – focus chain giữa các ô nhập
  const usernameRef = useRef(null);
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);

  // ─────────────────────────────────────────────────────────────
  // 7.5 onSubmit – được gọi bởi handleSubmit khi TẤT CẢ field hợp lệ (Mục 7.5)
  // isSubmitting tự set true trong lúc hàm async này chạy
  // ─────────────────────────────────────────────────────────────
  const onSubmit = useCallback(async (data) => {
    try {
      await register({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
      });
      Alert.alert('✅ Đăng ký thành công', 'Vui lòng đăng nhập.', [
        { text: 'Đăng nhập', onPress: () => router.replace('/(auth)/login') },
      ]);
      reset();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.';
      Alert.alert('Lỗi', msg);
    }
  }, [register, reset]);

  // 7.5 onSubmitError – được gọi khi có field lỗi (Mục 7.5)
  const onSubmitError = useCallback(() => {
    Alert.alert('Lỗi', 'Vui lòng kiểm tra lại các trường thông tin.');
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={s.title}>Tạo tài khoản</Text>
        <Text style={s.subtitle}>Bắt đầu hành trình học tập của bạn</Text>

        {/* ── Tên đăng nhập ── */}
        <Text style={s.label}>Tên đăng nhập *</Text>
        <Controller
          control={control}
          name="username"
          rules={{
            required: 'Tên đăng nhập là bắt buộc',
            minLength: { value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
            maxLength: { value: 50, message: 'Tên đăng nhập tối đa 50 ký tự' },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Chỉ được chứa chữ cái, số và dấu gạch dưới',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={usernameRef}
              style={[s.input, errors.username && s.inputError]}
              placeholder="vi_du: nguyen_van_an"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        />
        {errors.username && <Text style={s.errorText}>⚠ {errors.username.message}</Text>}

        {/* ── Họ và tên ── */}
        <Text style={s.label}>Họ và tên *</Text>
        <Controller
          control={control}
          name="fullName"
          rules={{
            required: 'Họ và tên là bắt buộc',
            minLength: { value: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[s.input, errors.fullName && s.inputError]}
              placeholder="Nguyễn Văn An"
              placeholderTextColor={COLORS.textMuted}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              autoCapitalize="words"
            />
          )}
        />
        {errors.fullName && <Text style={s.errorText}>⚠ {errors.fullName.message}</Text>}

        {/* ── Email ── (Mục 7.3 – required + pattern regex) */}
        <Text style={s.label}>Email *</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email là bắt buộc',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email không đúng định dạng',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={emailRef}
              style={[s.input, errors.email && s.inputError]}
              placeholder="email@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        />
        {errors.email && <Text style={s.errorText}>⚠ {errors.email.message}</Text>}

        {/* ── Mật khẩu ── (Mục 7.2 – required + minLength 8) */}
        <Text style={s.label}>Mật khẩu *</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Mật khẩu là bắt buộc',
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Mật khẩu phải có ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={passwordRef}
              style={[s.input, errors.password && s.inputError]}
              placeholder="Tối thiểu 8 ký tự"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
          )}
        />
        {errors.password && <Text style={s.errorText}>⚠ {errors.password.message}</Text>}

        {/* ── Xác nhận mật khẩu ── (Mục 7.4 – custom validate) */}
        <Text style={s.label}>Xác nhận mật khẩu *</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Vui lòng nhập lại mật khẩu',
            // 7.4 validate custom: so sánh với passwordValue từ watch()
            validate: (value) =>
              value === passwordValue || 'Mật khẩu nhập lại không khớp',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              ref={confirmRef}
              style={[s.input, errors.confirmPassword && s.inputError]}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit, onSubmitError)}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={s.errorText}>⚠ {errors.confirmPassword.message}</Text>
        )}

        {/* ── Nút Đăng ký ── (Mục 7.5)
            handleSubmit(onSubmit, onSubmitError):
            - Tự validate tất cả rules trước
            - Gọi onSubmit(data) nếu hợp lệ
            - Gọi onSubmitError() nếu có lỗi
            isSubmitting: true trong lúc onSubmit async đang chạy  */}
        <TouchableOpacity
          style={[s.btn, isSubmitting && s.btnDisabled]}
          onPress={handleSubmit(onSubmit, onSubmitError)}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Đăng ký</Text>}
        </TouchableOpacity>

        {/* Nút Làm mới – reset về defaultValues */}
        <TouchableOpacity
          style={[s.btn, s.btnSecondary]}
          onPress={() => reset()}
          disabled={isSubmitting}
        >
          <Text style={s.btnText}>Làm mới</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginLink} onPress={() => router.replace('/(auth)/login')}>
          <Text style={s.loginLinkText}>
            Đã có tài khoản?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.white, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  backText: { color: COLORS.primary, fontSize: 15, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg,
    marginBottom: 4,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginBottom: 4 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: 15, alignItems: 'center', marginTop: 16, ...SHADOW.md,
  },
  btnSecondary: { backgroundColor: COLORS.textSecondary, marginTop: 10 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { color: COLORS.textSecondary, fontSize: 14 },
});
