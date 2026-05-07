import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { addMockUser, isMockEmailTaken } from "../../../src/data/mockData";
import { REGISTER_ROLE } from "./data";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage("Vui long nhap day du thong tin.");
      setSuccessMessage("");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage("Ho va ten can tu 2 ky tu tro len.");
      setSuccessMessage("");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Email chua dung dinh dang.");
      setSuccessMessage("");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mat khau can it nhat 6 ky tu.");
      setSuccessMessage("");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mat khau xac nhan chua khop.");
      setSuccessMessage("");
      return;
    }

    if (isMockEmailTaken(trimmedEmail)) {
      setErrorMessage("Email nay da ton tai trong du lieu demo.");
      setSuccessMessage("");
      return;
    }

    addMockUser({
      name: trimmedName,
      email: trimmedEmail,
      password,
    });

    setErrorMessage("");
    setSuccessMessage("Tai khoan student demo da duoc them.");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#FAFBFF", "#F4F7FF", "#EEF2FF"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>
        <Text style={styles.title}>Tao tai khoan moi</Text>
        <Text style={styles.subtitle}>Bat dau hanh trinh hoc tieng Anh cua ban</Text>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Toi la...</Text>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIconWrap, { backgroundColor: `${REGISTER_ROLE.accent}16` }]}>
                <Ionicons color={REGISTER_ROLE.accent} name={REGISTER_ROLE.icon as never} size={18} />
              </View>
              <Ionicons color={REGISTER_ROLE.accent} name="checkmark-circle" size={20} />
            </View>

            <Text style={styles.roleTitle}>{REGISTER_ROLE.title}</Text>
            <Text style={styles.roleDescription}>{REGISTER_ROLE.description}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ho va ten</Text>
            <View style={styles.inputShell}>
              <Ionicons
                color="#9AA4B2"
                name="person-outline"
                size={18}
                style={styles.inputIcon}
              />
              <TextInput
                onChangeText={(value) => {
                  setFullName(value);
                  setErrorMessage("");
                }}
                placeholder="Nguyen Van A"
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
                onChangeText={(value) => {
                  setEmail(value);
                  setErrorMessage("");
                }}
                placeholder="your@email.com"
                placeholderTextColor="#9AA4B2"
                style={styles.input}
                value={email}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mat khau</Text>
            <View style={styles.inputShell}>
              <Ionicons
                color="#9AA4B2"
                name="lock-closed-outline"
                size={18}
                style={styles.inputIcon}
              />
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => {
                  setPassword(value);
                  setErrorMessage("");
                }}
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
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Xac nhan mat khau</Text>
            <View style={styles.inputShell}>
              <Ionicons
                color="#9AA4B2"
                name="lock-closed-outline"
                size={18}
                style={styles.inputIcon}
              />
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setErrorMessage("");
                }}
                placeholder="Nhap lai mat khau"
                placeholderTextColor="#9AA4B2"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
              />
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Pressable onPress={handleRegister} style={styles.buttonWrapper}>
            <LinearGradient
              colors={["#356BFF", "#1E48E5"]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Dang ky</Text>
              <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FF",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  inner: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#667085",
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
  roleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E0F2",
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
  errorText: {
    marginTop: -6,
    marginBottom: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
  successText: {
    marginTop: -6,
    marginBottom: 12,
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
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
