/**
 * FORM THỰC HÀNH REACT NATIVE
 * Minh hoạ: useState, useEffect, useRef, useCallback, useMemo
 * Theo tài liệu: "Hướng dẫn tư duy và kỹ thuật lập trình React Native hiện đại"
 */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

// ─────────────────────────────────────────────────────────────
// 2.3 useContext – ThemeContext chia sẻ theme toàn form
// ─────────────────────────────────────────────────────────────
const FormThemeContext = createContext();

function FormThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);
  return (
    <FormThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </FormThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Component con: FormField — nhận props từ cha, không tự quản lý state
// Thể hiện: dòng dữ liệu một chiều (Thinking in React – Bước 5)
// ─────────────────────────────────────────────────────────────
const FormField = React.memo(function FormField({
  label, value, onChangeText, placeholder,
  secureTextEntry, inputRef, onSubmitEditing,
  returnKeyType, error, keyboardType,
}) {
  const { theme } = useContext(FormThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={fs.fieldWrap}>
      <Text style={[fs.label, isDark && fs.labelDark]}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[
          fs.input,
          isDark && fs.inputDark,
          error && fs.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B7280' : COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {/* Lỗi validation hiển thị ngay dưới ô nhập */}
      {error ? <Text style={fs.errorText}>⚠ {error}</Text> : null}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
// Component con: SkillTag — component nhỏ, trách nhiệm rõ ràng
// ─────────────────────────────────────────────────────────────
function SkillTag({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[fs.tag, selected && fs.tagSelected]}
      onPress={onPress}
    >
      <Text style={[fs.tagText, selected && fs.tagTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// MÀN HÌNH CHÍNH
// ─────────────────────────────────────────────────────────────
function PracticeFormContent() {
  const { theme, toggleTheme } = useContext(FormThemeContext);
  const isDark = theme === 'dark';

  // ── 2.1 useState – lưu dữ liệu form ────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // 2.1 useState – state UI
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);    // đếm số lần nhấn

  // 2.1 useState – mảng kỹ năng (minh hoạ immutability)
  const [selectedSkills, setSelectedSkills] = useState([]);

  // ── 2.4 useRef – focus giữa các ô nhập ─────────────────────
  // Từ tài liệu: "Ví dụ focus sang ô mật khẩu"
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);
  const phoneRef    = useRef(null);

  // 2.4 useRef – lưu giá trị không cần re-render
  const submitAttemptRef = useRef(0); // đếm thực tế (không dùng state)

  // ── 2.2 useEffect – side effects ───────────────────────────
  // []: chạy 1 lần sau mount – kiểm tra dữ liệu cũ (giả lập)
  useEffect(() => {
    const timer = setTimeout(() => {
      // giả lập: pre-fill tên từ storage
    }, 300);
    return () => clearTimeout(timer); // cleanup tránh memory leak
  }, []);

  // [submitCount]: chạy lại khi submitCount thay đổi
  useEffect(() => {
    if (submitCount > 0) {
      submitAttemptRef.current = submitCount;
    }
  }, [submitCount]);

  // ── 2.3 Bước 3 Thinking in React: state tối thiểu ──────────
  // "Nếu có thể suy ra từ state khác → không cần state riêng"
  // fullName KHÔNG lưu state — tính trực tiếp từ name
  const fullNameDisplay = name.trim() || '(chưa nhập)';

  // ── 3.3 useMemo – tính kết quả tốn kém ─────────────────────
  // Danh sách kỹ năng lọc theo những kỹ năng đã chọn
  const SKILLS = ['Giao tiếp', 'IELTS', 'TOEIC', 'Từ vựng', 'Ngữ pháp', 'Phát âm'];

  const selectedSkillLabels = useMemo(
    () => SKILLS.filter(s => selectedSkills.includes(s)).join(', ') || 'Chưa chọn',
    [selectedSkills]
  );

  // ── Validation – tính trực tiếp lúc render ─────────────────
  const errors = useMemo(() => {
    const e = {};
    if (!name.trim())                 e.name = 'Vui lòng nhập họ tên';
    if (!email.includes('@'))         e.email = 'Email không hợp lệ';
    if (password.length > 0 && password.length < 6) e.password = 'Tối thiểu 6 ký tự';
    if (confirmPassword && confirmPassword !== password) e.confirm = 'Mật khẩu không khớp';
    return e;
  }, [name, email, password, confirmPassword]);

  const isValid = useMemo(
    () => name.trim() && email.includes('@') && password.length >= 6 && confirmPassword === password,
    [name, email, password, confirmPassword]
  );

  // ── 2.2 useCallback – tránh truyền hàm mới mỗi render ──────
  const handleToggleSkill = useCallback((skill) => {
    setSelectedSkills(prev => {
      // ĐÚng: tạo mảng mới – bất biến (Immutability – mục 5.1)
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      return [...prev, skill];
    });
  }, []);

  // ── Xử lý submit ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra lại các trường bị lỗi.');
      return;
    }
    // Dùng dạng callback để tránh lỗi stale closure (mục 2.1)
    setSubmitCount(prev => prev + 1);
    setLoading(true);

    // Giả lập gọi API (side effect)
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);

    Alert.alert('✅ Đăng ký thành công!',
      `Xin chào ${name.trim()}!\nKỹ năng đã chọn: ${selectedSkillLabels}`,
      [{ text: 'Về trang chủ', onPress: () => router.replace('/(tabs)') }]
    );
  }, [isValid, name, selectedSkillLabels]);

  const bg = isDark ? '#111827' : COLORS.bg;
  const cardBg = isDark ? '#1F2937' : COLORS.white;
  const textColor = isDark ? '#F9FAFB' : COLORS.text;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[fs.scroll, { backgroundColor: bg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[fs.header, { backgroundColor: COLORS.primary }]}>
          <TouchableOpacity style={fs.backBtn} onPress={() => router.back()}>
            <Text style={fs.backText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={fs.headerTitle}>📋 Form Thực Hành</Text>
          <Text style={fs.headerSub}>Đăng ký học viên mới</Text>

          {/* Preview tên real-time — không cần state mới */}
          <View style={fs.previewCard}>
            <Text style={fs.previewLabel}>Xem trước</Text>
            <Text style={fs.previewName}>{fullNameDisplay}</Text>
            <Text style={fs.previewSkills}>🎯 {selectedSkillLabels}</Text>
          </View>
        </View>

        {/* THEME TOGGLE – minh hoạ useContext */}
        <View style={[fs.section, { backgroundColor: cardBg }]}>
          <Text style={[fs.sectionTitle, { color: textColor }]}>
            🎨 Theme (useContext)
          </Text>
          <Text style={[fs.sectionHint, { color: COLORS.textSecondary }]}>
            ThemeContext chia sẻ theme xuyên toàn bộ form mà không cần prop drilling.
          </Text>
          <TouchableOpacity style={fs.themeBtn} onPress={toggleTheme}>
            <Text style={fs.themeBtnText}>
              {theme === 'light' ? '🌙 Chuyển Dark' : '☀️ Chuyển Light'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* THÔNG TIN CÁ NHÂN – useState + useRef */}
        <View style={[fs.section, { backgroundColor: cardBg }]}>
          <Text style={[fs.sectionTitle, { color: textColor }]}>
            👤 Thông tin cá nhân (useState + useRef)
          </Text>
          <Text style={[fs.sectionHint, { color: COLORS.textSecondary }]}>
            useRef giúp focus tự động sang ô tiếp theo khi nhấn "Tiếp".
          </Text>

          {/* FormField: component con nhận dữ liệu qua props — one-way data flow */}
          <FormField
            label="Họ và tên *"
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn An"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={submitCount > 0 ? errors.name : null}
          />
          <FormField
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            inputRef={emailRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={submitCount > 0 ? errors.email : null}
          />
          <FormField
            label="Mật khẩu *"
            value={password}
            onChangeText={setPassword}
            placeholder="Tối thiểu 6 ký tự"
            secureTextEntry={!showPass}
            inputRef={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={submitCount > 0 ? errors.password : null}
          />
          <FormField
            label="Xác nhận mật khẩu *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showPass}
            inputRef={confirmRef}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            error={submitCount > 0 ? errors.confirm : null}
          />
          <FormField
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="0901234567"
            keyboardType="phone-pad"
            inputRef={phoneRef}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={fs.showPassBtn}
            onPress={() => setShowPass(p => !p)}
          >
            <Text style={fs.showPassText}>
              {showPass ? '🙈 Ẩn mật khẩu' : '👁️ Hiện mật khẩu'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* KỸ NĂNG – useState với immutability */}
        <View style={[fs.section, { backgroundColor: cardBg }]}>
          <Text style={[fs.sectionTitle, { color: textColor }]}>
            🎯 Kỹ năng muốn học (Immutability)
          </Text>
          <Text style={[fs.sectionHint, { color: COLORS.textSecondary }]}>
            Đúng: {'setSelectedSkills(prev => [...prev, skill])'}
            {'\n'}Sai: {'selectedSkills.push(skill); setSelectedSkills(selectedSkills)'}
          </Text>
          <View style={fs.tagRow}>
            {SKILLS.map(skill => (
              <SkillTag
                key={skill}
                label={skill}
                selected={selectedSkills.includes(skill)}
                onPress={() => handleToggleSkill(skill)}
              />
            ))}
          </View>
          <Text style={[fs.selectedInfo, { color: COLORS.primary }]}>
            ✅ Đã chọn: {selectedSkillLabels}
          </Text>
        </View>

        {/* TÓM TẮT TRẠNG THÁI – useMemo */}
        <View style={[fs.section, { backgroundColor: cardBg }]}>
          <Text style={[fs.sectionTitle, { color: textColor }]}>
            🔍 Trạng thái form (useMemo)
          </Text>
          <Text style={[fs.sectionHint, { color: COLORS.textSecondary }]}>
            Các giá trị này được tính bằng useMemo — chỉ tính lại khi dependencies thay đổi.
          </Text>
          <StatusRow label="Họ tên"        ok={!!name.trim()} />
          <StatusRow label="Email hợp lệ"  ok={email.includes('@')} />
          <StatusRow label="Mật khẩu ≥ 6" ok={password.length >= 6} />
          <StatusRow label="Khớp mật khẩu" ok={!!confirmPassword && confirmPassword === password} />
          <StatusRow label="Có kỹ năng"    ok={selectedSkills.length > 0} />
          <View style={[fs.validBadge, { backgroundColor: isValid ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={{ color: isValid ? COLORS.success : COLORS.error, fontWeight: '700' }}>
              {isValid ? '✅ Form hợp lệ — sẵn sàng gửi' : '⛔ Form chưa hợp lệ'}
            </Text>
          </View>
        </View>

        {/* NÚT GỬI */}
        <TouchableOpacity
          style={[fs.submitBtn, !isValid && fs.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={fs.submitBtnText}>
                {isValid ? '🚀 Đăng ký ngay' : 'Điền đầy đủ để đăng ký'}
              </Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper component – trạng thái từng trường
// ─────────────────────────────────────────────────────────────
function StatusRow({ label, ok }) {
  return (
    <View style={fs.statusRow}>
      <Text style={fs.statusIcon}>{ok ? '✅' : '⭕'}</Text>
      <Text style={[fs.statusLabel, { color: ok ? COLORS.success : COLORS.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Export: bọc bằng Provider (useContext)
// ─────────────────────────────────────────────────────────────
export default function PracticeFormScreen() {
  return (
    <FormThemeProvider>
      <PracticeFormContent />
    </FormThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const fs = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 24 },

  // Header
  header: { padding: 24, paddingTop: 60, paddingBottom: 32 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md, padding: 14,
  },
  previewLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4, textTransform: 'uppercase' },
  previewName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  previewSkills: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  // Section
  section: {
    margin: 16, marginBottom: 0,
    borderRadius: RADIUS.lg, padding: 16,
    ...SHADOW.sm,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionHint: {
    fontSize: 12, lineHeight: 18,
    marginBottom: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F3F4F6', padding: 8, borderRadius: 6,
  },

  // Theme button
  themeBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: 10, alignItems: 'center',
  },
  themeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // FormField
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
  labelDark: { color: '#F3F4F6' },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  inputDark: { backgroundColor: '#374151', borderColor: '#4B5563', color: '#F9FAFB' },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  showPassBtn: { alignSelf: 'flex-end', marginTop: 4 },
  showPassText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tag: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  tagSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  tagTextSelected: { color: '#fff', fontWeight: '700' },
  selectedInfo: { fontSize: 13, fontWeight: '500', marginTop: 4 },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusIcon: { fontSize: 16 },
  statusLabel: { fontSize: 14 },
  validBadge: { borderRadius: RADIUS.md, padding: 12, marginTop: 10, alignItems: 'center' },

  // Submit
  submitBtn: {
    margin: 16, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, paddingVertical: 16,
    alignItems: 'center', ...SHADOW.md,
  },
  submitBtnDisabled: { backgroundColor: COLORS.textMuted },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
