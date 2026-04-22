import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AuthBackButton from "./AuthBackButton";
import AuthBrandHeader from "./AuthBrandHeader";

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export default function AuthScreenLayout({ children, title, subtitle }: Props) {
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#FAFBFF", "#F4F7FF", "#EEF2FF"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, styles.glowPrimary]} />
      <View style={[styles.glow, styles.glowSecondary]} />
      <View style={[styles.glow, styles.glowTertiary]} />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>
              <AuthBackButton />
              <AuthBrandHeader subtitle={subtitle} title={title} />
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FF",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: 520,
    position: "relative",
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9,
  },
  glowPrimary: {
    top: -110,
    right: -40,
    width: 240,
    height: 240,
    backgroundColor: "#DCE8FF",
  },
  glowSecondary: {
    top: 210,
    left: -110,
    width: 190,
    height: 190,
    backgroundColor: "#EDE9FE",
  },
  glowTertiary: {
    bottom: 60,
    right: -70,
    width: 180,
    height: 180,
    backgroundColor: "#E0F2FE",
  },
});
