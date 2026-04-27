import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import AuthScreenLayout from "../shared/AuthScreenLayout";
import { REGISTER_ROLES, type RegisterRoleKey } from "./data";

export default function RegisterScreen() {
  const [selectedRole, setSelectedRole] = useState<RegisterRoleKey>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthScreenLayout
      subtitle="Bắt đầu hành trình học tiếng Anh của bạn"
      title="Tạo tài khoản mới"
    >
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Tôi là...</Text>

        <View style={styles.roleRow}>
          {REGISTER_ROLES.map((role) => {
            const active = selectedRole === role.key;

            return (
              <Pressable
                key={role.key}
                onPress={() => setSelectedRole(role.key)}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: active ? role.fill : "#FFFFFF",
                    borderColor: active ? role.accent : "#D8E0F2",
                  },
                ]}
              >
                <View style={styles.roleHeader}>
                  <View style={[styles.roleIconWrap, { backgroundColor: `${role.accent}16` }]}>
                    <Ionicons color={role.accent} name={role.icon as never} size={18} />
                  </View>
                  {active ? (
                    <Ionicons color={role.accent} name="checkmark-circle" size={20} />
                  ) : null}
                </View>

                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Họ và tên</Text>
          <View style={styles.inputShell}>
            <Ionicons
              color="#9AA4B2"
              name="person-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
              value={fullName}
            />
          </View>
        </View>

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
          <Text style={styles.fieldLabel}>Mật khẩu</Text>
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
              placeholder="Ít nhất 6 ký tự"
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

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Xác nhận mật khẩu</Text>
          <View style={styles.inputShell}>
            <Ionicons
              color="#9AA4B2"
              name="lock-closed-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#9AA4B2"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />
          </View>
        </View>

        <Pressable style={styles.buttonWrapper}>
          <LinearGradient
            colors={["#356BFF", "#1E48E5"]}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Đăng ký</Text>
            <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
          </LinearGradient>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <Link asChild href="/login">
            <Pressable>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  roleCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  roleDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#667085",
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
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2953F3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  button: {
    height: 56,
    borderRadius: 16,
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
  loginRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#667085",
    fontSize: 14,
  },
  loginLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "800",
  },
});
