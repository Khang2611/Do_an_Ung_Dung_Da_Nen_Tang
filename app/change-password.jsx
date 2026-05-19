import { useState, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { changePassword } from '../services/userService';

export default function ChangePasswordScreen() {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const onSubmit = useCallback(async (data) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);
      
      if (Platform.OS === 'web') {
        window.alert('Đổi mật khẩu thành công!');
      } else {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      }
      
      router.back();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    }
  }, []);

  const onSubmitError = useCallback(() => {
    if (Platform.OS === 'web') {
      window.alert('Vui lòng điền đúng và đầy đủ thông tin.');
    } else {
      Alert.alert('Lỗi', 'Vui lòng điền đúng và đầy đủ thông tin.');
    }
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Đổi mật khẩu</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.card}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>🔒</Text>
          </View>
          <Text style={s.cardSubtitle}>
            Nhập mật khẩu cũ và đặt mật khẩu mới để bảo vệ tài khoản của bạn.
          </Text>
        </View>

        <View style={s.form}>
          {/* Mật khẩu cũ */}
          <Text style={s.label}>Mật khẩu hiện tại</Text>
          <View style={s.passRow}>
            <Controller
              control={control}
              name="oldPassword"
              rules={{ required: 'Mật khẩu cũ là bắt buộc' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, { flex: 1 }, errors.oldPassword && s.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showOldPass}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor={COLORS.textMuted}
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                  returnKeyType="next"
                />
              )}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowOldPass(p => !p)}>
              <Text style={s.eyeText}>{showOldPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.oldPassword && <Text style={s.errorText}>⚠ {errors.oldPassword.message}</Text>}

          {/* Mật khẩu mới */}
          <Text style={s.label}>Mật khẩu mới</Text>
          <View style={s.passRow}>
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: 'Mật khẩu mới là bắt buộc',
                minLength: { value: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={newPasswordRef}
                  style={[s.input, { flex: 1 }, errors.newPassword && s.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showNewPass}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor={COLORS.textMuted}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  returnKeyType="next"
                />
              )}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowNewPass(p => !p)}>
              <Text style={s.eyeText}>{showNewPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.newPassword && <Text style={s.errorText}>⚠ {errors.newPassword.message}</Text>}

          {/* Xác nhận mật khẩu mới */}
          <Text style={s.label}>Xác nhận mật khẩu mới</Text>
          <View style={s.passRow}>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Nhập lại mật khẩu mới là bắt buộc',
                validate: (value) => value === newPasswordValue || 'Mật khẩu nhập lại không khớp',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={confirmPasswordRef}
                  style={[s.input, { flex: 1 }, errors.confirmPassword && s.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirmPass}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit, onSubmitError)}
                />
              )}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirmPass(p => !p)}>
              <Text style={s.eyeText}>{showConfirmPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={s.errorText}>⚠ {errors.confirmPassword.message}</Text>}

          {/* Nút lưu */}
          <TouchableOpacity
            style={[s.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmit, onSubmitError)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitBtnText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
  backIcon: { fontSize: 22, color: COLORS.text, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center', marginRight: 40 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', marginBottom: 20, ...SHADOW.sm },
  logoBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 28 },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, ...SHADOW.sm },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 18 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...SHADOW.md },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
