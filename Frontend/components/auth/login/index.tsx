import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { findMockUserByCredentials } from "../../../src/data/mockData";

export default function LoginModule() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    const matchedUser = findMockUserByCredentials(email, password);

    if (!matchedUser) {
      setErrorMessage("Email hoac mat khau khong dung.");
      return;
    }

    setErrorMessage("");
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.inner}>
        <Text style={styles.title}>Dang nhap vao he thong</Text>
        <Text style={styles.subtitle}>Nhap thong tin tai khoan cua ban de tiep tuc</Text>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputShell}>
              <Ionicons color="#9AA4B2" name="mail-outline" size={18} style={styles.inputIcon} />
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
                returnKeyType="next"
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
                onSubmitEditing={handleLogin}
                placeholder="Nhap mat khau"
                placeholderTextColor="#9AA4B2"
                returnKeyType="done"
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

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable accessibilityRole="button" onPress={handleLogin} style={styles.buttonWrapper}>
            <LinearGradient
              colors={["#356BFF", "#1E48E5"]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Dang nhap</Text>
              <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
            </LinearGradient>
          </Pressable>
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
});
