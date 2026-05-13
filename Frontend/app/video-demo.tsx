/**
 * Trang demo xem video bảo mật MinIO.
 * Cho phép nhập lessonId và test luồng bảo mật hoàn chỉnh.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import SecureVideoPlayer from "@/components/video/SecureVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";

export default function VideoDemoScreen() {
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [lessonId, setLessonId] = useState("1");
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [videoType, setVideoType] = useState<"mp4" | "hls">("hls");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#CBD5E1" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>🔒 Video Bảo Mật MinIO</Text>
            <Text style={styles.headerSubtitle}>
              Demo luồng bảo mật Signed URL
            </Text>
          </View>
        </View>

        {/* Auth Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              borderColor: isAuthenticated ? "#22C55E33" : "#EF444433",
            },
          ]}
        >
          <View style={styles.statusRow}>
            <Ionicons
              name={isAuthenticated ? "shield-checkmark" : "shield"}
              size={20}
              color={isAuthenticated ? "#22C55E" : "#EF4444"}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAuthenticated ? "#22C55E" : "#EF4444" },
              ]}
            >
              {isAuthenticated
                ? `Đã xác thực: ${user?.username} (${user?.role})`
                : "Chưa đăng nhập"}
            </Text>
          </View>
          {isAuthenticated && (
            <Pressable onPress={signOut} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </Pressable>
          )}
          {!isAuthenticated && (
            <Pressable
              onPress={() => router.push("/login")}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </Pressable>
          )}
        </View>

        {/* Security Architecture Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Kiến trúc bảo mật 7 lớp</Text>
          <View style={styles.layersList}>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#3B82F620" }]}>
                <Text style={[styles.layerNumber, { color: "#3B82F6" }]}>1</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>JWT Authentication</Text>
                <Text style={styles.layerDesc}>
                  Token xác thực gửi trong header mỗi request
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#8B5CF620" }]}>
                <Text style={[styles.layerNumber, { color: "#8B5CF6" }]}>2</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>Enrollment Check</Text>
                <Text style={styles.layerDesc}>
                  Backend kiểm tra user đã đăng ký khóa học chưa
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#F59E0B20" }]}>
                <Text style={[styles.layerNumber, { color: "#F59E0B" }]}>3</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>MinIO Signed URL</Text>
                <Text style={styles.layerDesc}>
                  URL có thời hạn 15-30 phút, tự hết hạn
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#22C55E20" }]}>
                <Text style={[styles.layerNumber, { color: "#22C55E" }]}>4</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>HLS Proxy Playlist</Text>
                <Text style={styles.layerDesc}>
                  Mỗi segment .ts có signed URL riêng
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#EC489920" }]}>
                <Text style={[styles.layerNumber, { color: "#EC4899" }]}>5</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>Anti-Screen Capture</Text>
                <Text style={styles.layerDesc}>
                  FLAG_SECURE (Android) + iOS Recording Detection + Auto Pause
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#EF444420" }]}>
                <Text style={[styles.layerNumber, { color: "#EF4444" }]}>6</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>Anti-DevTools (Web)</Text>
                <Text style={styles.layerDesc}>
                  F12/DevTools/Print/Copy/PiP blocking + Visibility API
                </Text>
              </View>
            </View>
            <View style={styles.layerItem}>
              <View style={[styles.layerBadge, { backgroundColor: "#06B6D420" }]}>
                <Text style={[styles.layerNumber, { color: "#06B6D4" }]}>7</Text>
              </View>
              <View style={styles.layerContent}>
                <Text style={styles.layerTitle}>Dynamic Watermark</Text>
                <Text style={styles.layerDesc}>
                  Username + Session ID + Timestamp để truy vết leak
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Video Type Selector */}
        <View style={styles.typeSelector}>
          <Pressable
            onPress={() => setVideoType("hls")}
            style={[
              styles.typeButton,
              videoType === "hls" && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                videoType === "hls" && styles.typeButtonTextActive,
              ]}
            >
              🎬 HLS Stream
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVideoType("mp4")}
            style={[
              styles.typeButton,
              videoType === "mp4" && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                videoType === "mp4" && styles.typeButtonTextActive,
              ]}
            >
              📹 MP4 Direct
            </Text>
          </Pressable>
        </View>

        {/* Lesson ID Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Lesson ID</Text>
          <View style={styles.inputRow}>
            <TextInput
              keyboardType="numeric"
              onChangeText={setLessonId}
              placeholder="Nhập ID bài học"
              placeholderTextColor="#64748B"
              style={styles.lessonInput}
              value={lessonId}
            />
            <Pressable
              onPress={() => {
                const id = parseInt(lessonId, 10);
                if (!isNaN(id) && id > 0) {
                  setActiveLesson(id);
                }
              }}
              style={styles.loadButton}
            >
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={styles.loadButtonGradient}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={styles.loadButtonText}>Tải video</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Video Player */}
        {activeLesson && (
          <View style={styles.playerSection}>
            <SecureVideoPlayer
              key={`${activeLesson}-${videoType}`}
              lessonId={activeLesson}
              title={`Bài học #${activeLesson}`}
              type={videoType}
            />
          </View>
        )}

        {/* Flow Diagram */}
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Luồng xử lý khi nhấn Play</Text>
          <View style={styles.flowSteps}>
            <FlowStep
              icon="phone-portrait"
              label="Frontend gửi JWT"
              color="#3B82F6"
            />
            <FlowArrow />
            <FlowStep
              icon="server"
              label="Backend xác thực"
              color="#8B5CF6"
            />
            <FlowArrow />
            <FlowStep
              icon="checkmark-circle"
              label="Kiểm tra enrollment"
              color="#F59E0B"
            />
            <FlowArrow />
            <FlowStep
              icon="cloud"
              label="MinIO tạo Signed URL"
              color="#22C55E"
            />
            <FlowArrow />
            <FlowStep
              icon="videocam"
              label="Phát video bảo mật"
              color="#EC4899"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function FlowStep({
  icon,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
}) {
  return (
    <View style={flowStyles.step}>
      <View style={[flowStyles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={flowStyles.label}>{label}</Text>
    </View>
  );
}

function FlowArrow() {
  return (
    <Ionicons
      name="arrow-down"
      size={16}
      color="#475569"
      style={flowStyles.arrow}
    />
  );
}

const flowStyles = StyleSheet.create({
  step: {
    alignItems: "center",
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "#CBD5E1",
    fontSize: 11,
    textAlign: "center",
    maxWidth: 100,
  },
  arrow: {
    marginVertical: 4,
  },
});

// ─── Main Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  container: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EF444420",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },
  loginButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#3B82F620",
  },
  loginButtonText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  infoTitle: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  layersList: {
    gap: 14,
  },
  layerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  layerBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  layerNumber: {
    fontSize: 14,
    fontWeight: "800",
  },
  layerContent: {
    flex: 1,
  },
  layerTitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
  },
  layerDesc: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  typeButtonActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#3B82F620",
  },
  typeButtonText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#3B82F6",
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  lessonInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    color: "#F1F5F9",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  loadButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  loadButtonGradient: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  playerSection: {
    marginBottom: 20,
  },
  flowCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  flowTitle: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 18,
  },
  flowSteps: {
    alignItems: "center",
    gap: 2,
  },
});
