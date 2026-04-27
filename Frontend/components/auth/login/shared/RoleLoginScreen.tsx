import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import AuthScreenLayout from "../../shared/AuthScreenLayout";
import { LOGIN_ROLES } from "./roles";
import type { LoginRoleKey, RoleScreenProps } from "./types";

type Props = RoleScreenProps & {
  roleKey: LoginRoleKey;
};

export default function RoleLoginScreen({
  roleKey,
  selectedRole: _selectedRole,
  onSelectRole: _onSelectRole,
}: Props) {
  const role = LOGIN_ROLES[roleKey];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, [roleKey]);

  return (
    <AuthScreenLayout
      subtitle="Nhap thong tin tai khoan cua ban de tiep tuc"
      title="Dang nhap vao he thong"
    >
      <View style={styles.demoBlock}>
        <Text style={styles.demoLabel}>
          He thong se tu dong kiem tra vai tro cua tai khoan sau khi dang nhap.
        </Text>

        <View style={[styles.portalCard, { borderColor: `${role.accent}26` }]}>
          <Text style={[styles.portalTitle, { color: role.accent }]}>
            Dang nhap tai khoan
          </Text>
          <Text style={styles.portalDescription}>
            Nguoi dung chi can nhap email va mat khau. Sau khi dang nhap, he thong
            se tu xac dinh tai khoan thuoc student, instructor hay admin.
          </Text>
          <Text style={styles.demoPassword}>
            Tai khoan demo:{" "}
            <Text style={styles.demoPasswordValue}>{role.demoEmail}</Text>
          </Text>
          <Text style={styles.demoPassword}>
            Mat khau: <Text style={styles.demoPasswordValue}>{role.demoPassword}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.inputShell}>
            <Ionicons
              color="#9AA4B2"
              name="mail-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
              value={email}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.passwordHeader}>
            <Text style={styles.fieldLabel}>Mat khau</Text>
            <Pressable>
              <Text style={[styles.forgotText, { color: role.accent }]}>Quen mat khau?</Text>
            </Pressable>
          </View>

          <View style={styles.inputShell}>
            <Ionicons
              color="#9AA4B2"
              name="lock-closed-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Nhap mat khau"
              placeholderTextColor="#9AA4B2"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
            />
            <Pressable
              hitSlop={8}
              onPress={() => setShowPassword((value) => !value)}
              style={styles.visibilityButton}
            >
              <Ionicons
                color="#9AA4B2"
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
              />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.buttonWrapper}>
          <LinearGradient
            colors={role.buttonGradient}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Dang nhap</Text>
            <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
          </LinearGradient>
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Chua co tai khoan? </Text>
          <Link asChild href="/register">
            <Pressable>
              <Text style={[styles.signupLink, { color: role.accent }]}>Dang ky ngay</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons
              color={role.accent}
              name="shield-checkmark-outline"
              size={16}
              style={styles.noticeIcon}
            />
            <Text style={styles.noticeTitle}>Kiem tra vai tro tai khoan</Text>
          </View>
          <Text style={styles.noticeText}>
            Sau khi dang nhap, he thong se tu dong nhan biet vai tro tai khoan de
            dieu huong den giao dien phu hop.
          </Text>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  demoBlock: {
    marginTop: 18,
    gap: 12,
  },
  demoLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#7B4B11",
  },
  portalCard: {
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFFFFFD9",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  portalTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  portalDescription: {
    color: "#5B6780",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  demoPassword: {
    fontSize: 14,
    color: "#7A859C",
  },
  demoPasswordValue: {
    color: "#334155",
    fontWeight: "700",
  },
  card: {
    marginTop: 18,
    borderRadius: 28,
    backgroundColor: "#FFFFFFF2",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "#E8EDF7",
    shadowColor: "#9AA7BD",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputShell: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E0F2",
    backgroundColor: "#F8FAFE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: 15,
  },
  visibilityButton: {
    marginLeft: 10,
    padding: 2,
  },
  buttonWrapper: {
    marginTop: 6,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2953F3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  button: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  signupRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#667085",
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "800",
  },
  noticeCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6EBF4",
    backgroundColor: "#F8FAFD",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeTitle: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  noticeText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
  },
});
