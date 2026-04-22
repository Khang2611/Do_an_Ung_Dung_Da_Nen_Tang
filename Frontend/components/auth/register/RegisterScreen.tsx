import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AuthScreenLayout from "../shared/AuthScreenLayout";
import { REGISTER_ROLES, type RegisterRoleKey } from "./data";

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterScreen() {
  const [selectedRole, setSelectedRole] = useState<RegisterRoleKey>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Vui long nhap ho va ten.";
    } else if (fullName.trim().length < 2) {
      nextErrors.fullName = "Ho va ten can tu 2 ky tu tro len.";
    }

    if (!email.trim()) {
      nextErrors.email = "Vui long nhap email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Email chua dung dinh dang.";
    }

    if (!password) {
      nextErrors.password = "Vui long nhap mat khau.";
    } else if (password.length < 6) {
      nextErrors.password = "Mat khau can it nhat 6 ky tu.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui long xac nhan mat khau.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Mat khau xac nhan chua khop.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRoleChange = (role: RegisterRoleKey) => {
    setSelectedRole(role);
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSuccessMessage(
        `Dang ky ${selectedRole === "student" ? "nguoi hoc" : "giang vien"} thanh cong. Ban co the chuyen sang man dang nhap de demo.`
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      subtitle="Bat dau hanh trinh hoc cung EngPro voi vai tro phu hop."
      title="Tao tai khoan moi"
    >
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Toi la...</Text>

        <View style={styles.roleRow}>
          {REGISTER_ROLES.map((role) => {
            const active = selectedRole === role.key;

            return (
              <Pressable
                key={role.key}
                onPress={() => handleRoleChange(role.key)}
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

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons color="#F97316" name="sparkles-outline" size={16} />
            <Text style={styles.infoTitle}>Demo cho buoi thong 4</Text>
          </View>
          <Text style={styles.infoText}>
            Form nay da co validate co ban va submit demo de nhom co the trinh bay
            luong dang ky ma khong can backend that.
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Ho va ten</Text>
          <View style={[styles.inputShell, errors.fullName && styles.inputShellError]}>
            <Ionicons
              color="#9AA4B2"
              name="person-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              onChangeText={setFullName}
              placeholder="Nguyen Van A"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
              value={fullName}
            />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={[styles.inputShell, errors.email && styles.inputShellError]}>
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
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Mat khau</Text>
          <View style={[styles.inputShell, errors.password && styles.inputShellError]}>
            <Ionicons
              color="#9AA4B2"
              name="lock-closed-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="It nhat 6 ky tu"
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Xac nhan mat khau</Text>
          <View style={[styles.inputShell, errors.confirmPassword && styles.inputShellError]}>
            <Ionicons
              color="#9AA4B2"
              name="lock-closed-outline"
              size={18}
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder="Nhap lai mat khau"
              placeholderTextColor="#9AA4B2"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              value={confirmPassword}
            />
            <Pressable
              hitSlop={8}
              onPress={() => setShowConfirmPassword((value) => !value)}
              style={styles.visibilityButton}
            >
              <Ionicons
                color="#9AA4B2"
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
              />
            </Pressable>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {successMessage ? (
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Ionicons color="#16A34A" name="checkmark-circle" size={18} />
              <Text style={styles.successTitle}>Dang ky thanh cong</Text>
            </View>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[styles.buttonWrapper, isSubmitting && styles.buttonWrapperDisabled]}
        >
          <LinearGradient
            colors={["#356BFF", "#1E48E5"]}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.button}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Dang xu ly...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>Dang ky</Text>
                <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Da co tai khoan? </Text>
          <Link asChild href="/login">
            <Pressable>
              <Text style={styles.loginLink}>Dang nhap</Text>
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
  infoCard: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A3412",
  },
  infoText: {
    color: "#9A3412",
    fontSize: 13,
    lineHeight: 19,
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
  inputShellError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
  errorText: {
    marginTop: 8,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
  successCard: {
    marginTop: 2,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    lineHeight: 19,
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
  buttonWrapperDisabled: {
    opacity: 0.85,
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
