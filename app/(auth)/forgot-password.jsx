import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã xác nhận + mật khẩu mới
  const [showPass, setShowPass] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    getValues
  } = useForm({
    defaultValues: {
      email: '',
      code: '',
      newPassword: '',
    },
  });

  const handleSendCode = useCallback(async (data) => {
    // Validate chỉ email
    const isValid = await trigger('email');
    if (!isValid) return;

    try {
      // Giả lập API gửi mã về email
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Thành công', 'Mã xác nhận đã được gửi đến email của bạn.');
      setStep(2);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    }
  }, [trigger]);

  const handleResetPassword = useCallback(async (data) => {
    try {
      // Giả lập API đổi mật khẩu
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Thành công', 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      router.replace('/(auth)/login');
    } catch (e) {
      Alert.alert('Lỗi', 'Mã xác nhận không đúng hoặc đã hết hạn.');
    }
  }, []);

  const onSubmitError = useCallback(() => {
    Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin.');
  }, []);

  const handleTogglePass = useCallback(() => setShowPass(p => !p), []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>🔑</Text>
          </View>
          <Text style={s.title}>Quên mật khẩu?</Text>
          <Text style={s.subtitle}>
            {step === 1 ? 'Nhập email của bạn để nhận mã xác nhận' : 'Nhập mã xác nhận và mật khẩu mới'}
          </Text>
        </View>

        <View style={s.form}>
          {step === 1 && (
            <>
              <Text style={s.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{ 
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Địa chỉ email không hợp lệ'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, errors.email && s.inputError]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Nhập email của bạn"
                    placeholderTextColor={COLORS.textMuted}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.email && <Text style={s.errorText}>⚠ {errors.email.message}</Text>}

              <TouchableOpacity
                style={[s.primaryBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={() => {
                  // Chỉ submit phần email
                  const values = getValues();
                  handleSendCode(values);
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnText}>Gửi mã xác nhận</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={s.label}>Mã xác nhận</Text>
              <Controller
                control={control}
                name="code"
                rules={{ required: 'Mã xác nhận là bắt buộc' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, errors.code && s.inputError]}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    placeholder="Nhập mã 6 số"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={6}
                  />
                )}
              />
              {errors.code && <Text style={s.errorText}>⚠ {errors.code.message}</Text>}

              <Text style={s.label}>Mật khẩu mới</Text>
              <View style={s.passRow}>
                <Controller
                  control={control}
                  name="newPassword"
                  rules={{
                    required: 'Mật khẩu là bắt buộc',
                    minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[s.input, { flex: 1 }, errors.newPassword && s.inputError]}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry={!showPass}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  )}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={handleTogglePass}>
                  <Text>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.newPassword && <Text style={s.errorText}>⚠ {errors.newPassword.message}</Text>}

              <TouchableOpacity
                style={[s.primaryBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmit(handleResetPassword, onSubmitError)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={s.resendBtn} onPress={() => setStep(1)}>
                <Text style={s.resendText}>Gửi lại mã</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>Quay lại đăng nhập</Text>
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
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  form: { gap: 2 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 2 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 12 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...SHADOW.md },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
