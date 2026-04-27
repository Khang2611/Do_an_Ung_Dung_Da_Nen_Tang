import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import BrandLogo from "@/components/branding/BrandLogo";
import {
  BENEFITS,
  FEATURED_COURSES,
  FOOTER_GROUPS,
  HERO_TAGS,
  HOME_CATEGORIES,
  TECH_STACK,
  type HomeCategoryKey,
} from "./data";

type SectionKey = "top" | "catalog" | "benefits" | "footer";

export default function LandingPage() {
  const scrollRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<HomeCategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionKey, number>>({
    top: 0,
    catalog: 0,
    benefits: 0,
    footer: 0,
  });
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1120;
  const isTablet = width >= 760;
  const showHeaderSearch = width >= 920;
  const courseBasis = isDesktop ? "31.8%" : isTablet ? "48.5%" : "100%";
  const benefitBasis = isDesktop ? "31.8%" : isTablet ? "48.5%" : "100%";
  const footerBasis = isDesktop ? "22%" : isTablet ? "31%" : "100%";

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FEATURED_COURSES.filter((course) => {
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const haystack = `${course.title} ${course.subtitle} ${course.mentor}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const visibleCourses = filteredCourses.length > 0 ? filteredCourses : FEATURED_COURSES;

  const handleSectionLayout =
    (section: SectionKey) => (event: LayoutChangeEvent) => {
      const { y } = event.nativeEvent.layout;
      setSectionOffsets((current) => ({ ...current, [section]: y }));
    };

  const scrollToSection = (section: SectionKey) => {
    const y = sectionOffsets[section] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={handleSectionLayout("top")} style={styles.anchor} />

        <View style={styles.navShell}>
          <View
            style={[
              styles.navBar,
              isDesktop ? styles.navBarDesktop : styles.navBarStacked,
            ]}
          >
            <Pressable onPress={() => scrollToSection("top")} style={styles.brandWrap}>
              <BrandLogo size={32} />
              <Text style={styles.brandText}>
                Eng<Text style={styles.brandAccent}>Pro</Text>
              </Text>
            </Pressable>

            <View style={styles.navCenter}>
              <View style={styles.navLinks}>
                <Pressable
                  onPress={() => scrollToSection("top")}
                  style={[styles.navLinkPill, styles.navLinkActive]}
                >
                  <Text style={[styles.navLinkText, styles.navLinkTextActive]}>Trang chủ</Text>
                </Pressable>

                <Pressable
                  onPress={() => scrollToSection("catalog")}
                  style={styles.navLinkPill}
                >
                  <Text style={styles.navLinkText}>Khóa học</Text>
                </Pressable>
              </View>

              {showHeaderSearch ? (
                <View style={styles.headerSearch}>
                  <Ionicons color="#A0A8B8" name="search-outline" size={18} />
                  <TextInput
                    onChangeText={setSearchQuery}
                    placeholder="Tìm khóa học..."
                    placeholderTextColor="#A0A8B8"
                    style={styles.headerSearchInput}
                    value={searchQuery}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.authActions}>
              <Link asChild href="/login">
                <Pressable style={styles.loginGhost}>
                  <Text style={styles.loginGhostText}>Đăng nhập</Text>
                </Pressable>
              </Link>

              <Link asChild href="/register">
                <Pressable style={styles.signupSolid}>
                  <Text style={styles.signupSolidText}>Đăng ký</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#2148F5", "#4D22E5", "#9518D8"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.heroSection}
        >
          <View style={[styles.heroGlow, styles.heroGlowLeft]} />
          <View style={[styles.heroGlow, styles.heroGlowRight]} />

          <View style={styles.heroInner}>
            <View style={styles.heroEyebrow}>
              <Ionicons color="#FFD166" name="flash-outline" size={14} />
              <Text style={styles.heroEyebrowText}>
                Hệ thống quản lý khóa học online #1 Việt Nam
              </Text>
            </View>

            <Text style={[styles.heroTitle, isTablet ? styles.heroTitleLg : styles.heroTitleSm]}>
              Học Tiếng Anh{"\n"}
              <Text style={styles.heroTitleAccent}>Đột Phá Kết Quả</Text>
            </Text>

            <Text
              style={[
                styles.heroDescription,
                isTablet ? styles.heroDescriptionLg : styles.heroDescriptionSm,
              ]}
            >
              Nền tảng học tiếng Anh đa cấp độ với IELTS, TOEIC, Giao tiếp và
              Business English. Lộ trình cá nhân hóa, học mọi lúc mọi nơi.
            </Text>

            <View
              style={[
                styles.heroSearchRow,
                { flexDirection: isTablet ? "row" : "column" },
              ]}
            >
              <View style={styles.heroSearchBox}>
                <Ionicons color="#A0A8B8" name="search-outline" size={20} />
                <TextInput
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => scrollToSection("catalog")}
                  placeholder="Tìm khóa học bạn cần..."
                  placeholderTextColor="#A0A8B8"
                  style={styles.heroSearchInput}
                  value={searchQuery}
                />
              </View>

              <Pressable onPress={() => scrollToSection("catalog")}>
                <LinearGradient
                  colors={["#FF8F1F", "#FF6A00"]}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={styles.heroSearchButton}
                >
                  <Text style={styles.heroSearchButtonText}>Tìm kiếm</Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.heroTagRow}>
              {HERO_TAGS.map((tag) => {
                const category = HOME_CATEGORIES.find((item) => item.key === tag);

                if (!category) {
                  return null;
                }

                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      setSelectedCategory(tag);
                      scrollToSection("catalog");
                    }}
                    style={styles.heroTag}
                  >
                    <Text style={styles.heroTagText}>{category.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStats}>
              {[
                { value: "100K+", label: "Học viên" },
                { value: "200+", label: "Khóa học" },
                { value: "50+", label: "Giáo viên" },
              ].map((item) => (
                <View key={item.label} style={styles.heroStatCard}>
                  <Text style={styles.heroStatValue}>{item.value}</Text>
                  <Text style={styles.heroStatLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionShell}>
          <View style={styles.sectionInner}>
            <View style={styles.noticeBar}>
              <Text style={styles.noticeBarText}>
                Đăng nhập để đăng ký khóa học, theo dõi tiến độ và nhận lộ trình học phù hợp.
              </Text>

              <Link asChild href="/login">
                <Pressable style={styles.noticeBarButton}>
                  <Text style={styles.noticeBarButtonText}>Đăng nhập</Text>
                </Pressable>
              </Link>
            </View>

            <View onLayout={handleSectionLayout("catalog")} style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleLg : styles.sectionTitleSm]}>
                Danh Mục Khóa Học
              </Text>
              <Text style={styles.sectionSubtitle}>
                Chọn lộ trình phù hợp với mục tiêu của bạn
              </Text>

              <View style={styles.categoryRow}>
                {HOME_CATEGORIES.map((category) => {
                  const selected = selectedCategory === category.key;

                  return (
                    <Pressable
                      key={category.key}
                      onPress={() => setSelectedCategory(category.key)}
                      style={[
                        styles.categoryChip,
                        selected && styles.categoryChipActive,
                      ]}
                    >
                      <Ionicons
                        color={selected ? "#FFFFFF" : "#667085"}
                        name={category.icon as never}
                        size={14}
                        style={styles.categoryIcon}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selected && styles.categoryTextActive,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitleLeft,
                      isTablet ? styles.sectionTitleLeftLg : styles.sectionTitleLeftSm,
                    ]}
                  >
                    Khóa Học Nổi Bật
                  </Text>
                  <Text style={styles.sectionSubtitleLeft}>
                    {visibleCourses.length} khóa học dành cho bạn
                  </Text>
                </View>

                <Pressable onPress={() => setSelectedCategory("all")}>
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                </Pressable>
              </View>

              <View style={styles.courseGrid}>
                {visibleCourses.slice(0, 6).map((course) => {
                  const categoryLabel =
                    HOME_CATEGORIES.find((item) => item.key === course.category)?.label ??
                    course.category;

                  return (
                    <View key={course.id} style={[styles.courseCard, { flexBasis: courseBasis }]}>
                      <LinearGradient
                        colors={course.gradient}
                        end={{ x: 1, y: 1 }}
                        start={{ x: 0, y: 0 }}
                        style={styles.courseCover}
                      >
                        <View style={styles.courseCoverTop}>
                          <Text style={styles.courseCoverCategory}>{categoryLabel}</Text>
                          <View style={styles.coursePricePill}>
                            <Text style={styles.coursePricePillText}>{course.price}</Text>
                          </View>
                        </View>

                        <View style={styles.courseCoverBody}>
                          <Text style={styles.courseCoverLabel}>{course.coverLabel}</Text>
                        </View>
                      </LinearGradient>

                      <View style={styles.courseBody}>
                        <Text style={styles.courseMeta}>
                          {categoryLabel} · {course.subtitle}
                        </Text>
                        <Text numberOfLines={2} style={styles.courseTitle}>
                          {course.title}
                        </Text>

                        <View style={styles.courseMentorRow}>
                          <Ionicons color="#98A2B3" name="person-circle-outline" size={16} />
                          <Text style={styles.courseMentor}>{course.mentor}</Text>
                        </View>

                        <View style={styles.courseStats}>
                          <Text style={styles.courseStatText}>★ {course.rating}</Text>
                          <Text style={styles.courseStatText}>{course.lessons}</Text>
                          <Text style={styles.courseStatText}>{course.learners}</Text>
                        </View>

                        <View style={styles.courseFooter}>
                          <Text style={styles.coursePrice}>{course.price}</Text>
                          <Pressable style={styles.courseButton}>
                            <Text style={styles.courseButtonText}>Xem chi tiết</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View onLayout={handleSectionLayout("benefits")} style={styles.benefitSection}>
          <View style={styles.sectionInner}>
            <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleLg : styles.sectionTitleSm]}>
              Tại Sao Chọn EngPro?
            </Text>
            <Text style={styles.sectionSubtitle}>
              Hệ thống được xây dựng theo kiến trúc React + Spring Boot hiện đại
            </Text>

            <View style={styles.benefitGrid}>
              {BENEFITS.map((benefit) => (
                <View
                  key={benefit.title}
                  style={[styles.benefitCard, { flexBasis: benefitBasis }]}
                >
                  <View
                    style={[
                      styles.benefitIconWrap,
                      { backgroundColor: `${benefit.accent}16` },
                    ]}
                  >
                    <Ionicons
                      color={benefit.accent}
                      name={benefit.icon as never}
                      size={18}
                    />
                  </View>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitText}>{benefit.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#294BE8", "#4F24E8", "#8417D5"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.ctaSection}
        >
          <View style={styles.sectionInner}>
            <Text style={[styles.ctaTitle, isTablet ? styles.ctaTitleLg : styles.ctaTitleSm]}>
              Bắt Đầu Học Ngay Hôm Nay!
            </Text>
            <Text style={styles.ctaSubtitle}>
              Đăng ký miễn phí, trải nghiệm học tiếng Anh theo chuẩn quốc tế.
            </Text>

            <View
              style={[
                styles.ctaActions,
                { flexDirection: isTablet ? "row" : "column" },
              ]}
            >
              <Link asChild href="/register">
                <Pressable style={styles.ctaPrimary}>
                  <Text style={styles.ctaPrimaryText}>Đăng ký miễn phí</Text>
                </Pressable>
              </Link>

              <Link asChild href="/login">
                <Pressable style={styles.ctaSecondary}>
                  <Text style={styles.ctaSecondaryText}>Đăng nhập</Text>
                </Pressable>
              </Link>
            </View>

            <View
              style={[
                styles.ctaBottomRow,
                { flexDirection: isTablet ? "row" : "column" },
              ]}
            >
              <View style={styles.ctaInfo}>
                <Text style={styles.ctaInfoTitle}>Học mọi lúc, mọi nơi với EngPro App</Text>
                <Text style={styles.ctaInfoText}>
                  Tải ứng dụng miễn phí cho iOS và Android.
                </Text>
              </View>

              <View style={styles.storeRow}>
                {["App Store", "Google Play"].map((store) => (
                  <Pressable key={store} style={styles.storeButton}>
                    <Ionicons
                      color="#FFFFFF"
                      name={store === "App Store" ? "logo-apple" : "logo-google-playstore"}
                      size={18}
                    />
                    <Text style={styles.storeButtonText}>{store}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>

        <View onLayout={handleSectionLayout("footer")} style={styles.footer}>
          <View style={styles.sectionInner}>
            <View style={styles.footerTop}>
              <View style={[styles.footerBrandCol, { flexBasis: footerBasis }]}>
                <View style={styles.footerBrandRow}>
                  <LinearGradient
                    colors={["#4B6BFF", "#2F47E7"]}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.footerBrandBadge}
                  >
                    <Ionicons color="#FFFFFF" name="book-outline" size={18} />
                  </LinearGradient>
                  <Text style={styles.footerBrandText}>EngPro</Text>
                </View>

                <Text style={styles.footerDescription}>
                  Hệ thống quản lý khóa học online React + Spring Boot. JWT
                  Authentication, video HLS và dashboard theo role.
                </Text>

                <View style={styles.socialRow}>
                  {["logo-facebook", "logo-instagram", "logo-github"].map((icon) => (
                    <Pressable key={icon} style={styles.socialButton}>
                      <Ionicons color="#98A2B3" name={icon as never} size={16} />
                    </Pressable>
                  ))}
                </View>
              </View>

              {FOOTER_GROUPS.map((group) => (
                <View key={group.title} style={[styles.footerColumn, { flexBasis: footerBasis }]}>
                  <Text style={styles.footerColumnTitle}>{group.title}</Text>
                  {group.items.map((item) => (
                    <Text key={item} style={styles.footerLink}>
                      {item}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.footerDivider} />

            <View style={styles.footerBottom}>
              <Text style={styles.footerCopy}>© 2026 EngPro. Nền tảng quản lý khóa học online.</Text>

              <View style={styles.techRow}>
                {TECH_STACK.map((tech) => (
                  <View key={tech} style={styles.techPill}>
                    <Text style={styles.techPillText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingBottom: 0,
  },
  anchor: {
    height: 0,
  },
  navShell: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  navBar: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  navBarDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  navBarStacked: {
    alignItems: "stretch",
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#102A56",
  },
  brandAccent: {
    color: "#2563EB",
  },
  navCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navLinkPill: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  navLinkActive: {
    backgroundColor: "#EFF5FF",
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667085",
  },
  navLinkTextActive: {
    color: "#2563EB",
  },
  headerSearch: {
    minWidth: 250,
    maxWidth: 330,
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6EBF4",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  headerSearchInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 14,
  },
  authActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  loginGhost: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loginGhostText: {
    color: "#475467",
    fontSize: 14,
    fontWeight: "700",
  },
  signupSolid: {
    backgroundColor: "#2F6BFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: "#2F6BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
  },
  signupSolidText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  heroSection: {
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 44,
  },
  heroGlow: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.16,
  },
  heroGlowLeft: {
    width: 360,
    height: 360,
    top: 120,
    left: -120,
    backgroundColor: "#93C5FD",
  },
  heroGlowRight: {
    width: 420,
    height: 420,
    right: -120,
    bottom: -120,
    backgroundColor: "#FDBA74",
  },
  heroInner: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 36,
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF1A",
    borderWidth: 1,
    borderColor: "#FFFFFF24",
  },
  heroEyebrowText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  heroTitle: {
    marginTop: 24,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  heroTitleLg: {
    fontSize: 56,
    lineHeight: 62,
  },
  heroTitleSm: {
    fontSize: 38,
    lineHeight: 46,
  },
  heroTitleAccent: {
    color: "#FFD166",
  },
  heroDescription: {
    maxWidth: 760,
    marginTop: 18,
    textAlign: "center",
    color: "#E8EAFF",
  },
  heroDescriptionLg: {
    fontSize: 22,
    lineHeight: 34,
  },
  heroDescriptionSm: {
    fontSize: 16,
    lineHeight: 26,
  },
  heroSearchRow: {
    width: "100%",
    maxWidth: 700,
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  heroSearchBox: {
    flex: 1,
    minHeight: 58,
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  heroSearchInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 16,
  },
  heroSearchButton: {
    height: 58,
    minWidth: 140,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  heroTagRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  heroTag: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFFFFF24",
    backgroundColor: "#FFFFFF14",
  },
  heroTagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  heroDivider: {
    width: "100%",
    maxWidth: 460,
    height: 1,
    marginTop: 34,
    backgroundColor: "#FFFFFF2A",
  },
  heroStats: {
    marginTop: 28,
    width: "100%",
    maxWidth: 500,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  heroStatCard: {
    flex: 1,
    minWidth: 120,
    alignItems: "center",
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  heroStatLabel: {
    marginTop: 6,
    color: "#E8EAFF",
    fontSize: 14,
  },
  sectionShell: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 54,
  },
  sectionInner: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
  },
  noticeBar: {
    borderRadius: 18,
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#F3DEC0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  noticeBarText: {
    flex: 1,
    minWidth: 220,
    color: "#7A4B0F",
    fontSize: 14,
    lineHeight: 20,
  },
  noticeBarButton: {
    borderRadius: 999,
    backgroundColor: "#F97316",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  noticeBarButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  sectionBlock: {
    paddingTop: 42,
  },
  sectionTitle: {
    textAlign: "center",
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  sectionTitleLg: {
    fontSize: 32,
  },
  sectionTitleSm: {
    fontSize: 26,
  },
  sectionSubtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
  },
  categoryRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  categoryChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    color: "#475467",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionTitleLeft: {
    fontWeight: "900",
    color: "#101828",
    letterSpacing: -0.8,
  },
  sectionTitleLeftLg: {
    fontSize: 30,
  },
  sectionTitleLeftSm: {
    fontSize: 24,
  },
  sectionSubtitleLeft: {
    marginTop: 6,
    color: "#667085",
    fontSize: 14,
  },
  viewAllText: {
    color: "#315CFF",
    fontSize: 14,
    fontWeight: "700",
  },
  courseGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7ECF4",
    overflow: "hidden",
    shadowColor: "#98A2B3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  courseCover: {
    minHeight: 172,
    padding: 16,
    justifyContent: "space-between",
  },
  courseCoverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  courseCoverCategory: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  coursePricePill: {
    borderRadius: 999,
    backgroundColor: "#FFFFFFE0",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coursePricePillText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "800",
  },
  courseCoverBody: {
    alignItems: "flex-start",
  },
  courseCoverLabel: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  courseBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  courseMeta: {
    color: "#98A2B3",
    fontSize: 12,
    fontWeight: "600",
  },
  courseTitle: {
    marginTop: 8,
    color: "#111827",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
  },
  courseMentorRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  courseMentor: {
    color: "#667085",
    fontSize: 13,
  },
  courseStats: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  courseStatText: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
  },
  courseFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  coursePrice: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "900",
  },
  courseButton: {
    borderRadius: 999,
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  courseButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  benefitSection: {
    backgroundColor: "#F2F7FF",
    paddingHorizontal: 18,
    paddingVertical: 56,
  },
  benefitGrid: {
    marginTop: 28,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  benefitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E6EBF4",
    shadowColor: "#98A2B3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  benefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  benefitTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  benefitText: {
    marginTop: 10,
    color: "#667085",
    fontSize: 14,
    lineHeight: 22,
  },
  ctaSection: {
    paddingHorizontal: 18,
    paddingVertical: 56,
  },
  ctaTitle: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1,
  },
  ctaTitleLg: {
    fontSize: 36,
  },
  ctaTitleSm: {
    fontSize: 28,
  },
  ctaSubtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#E9E7FF",
    fontSize: 16,
    lineHeight: 24,
  },
  ctaActions: {
    marginTop: 28,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  ctaPrimary: {
    minWidth: 190,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaPrimaryText: {
    color: "#2E4BE8",
    fontWeight: "900",
    fontSize: 15,
  },
  ctaSecondary: {
    minWidth: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFFFFF42",
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF12",
  },
  ctaSecondaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  ctaBottomRow: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  ctaInfo: {
    flex: 1,
  },
  ctaInfoTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  ctaInfoText: {
    marginTop: 8,
    color: "#E9E7FF",
    fontSize: 14,
    lineHeight: 22,
  },
  storeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  storeButton: {
    borderRadius: 16,
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storeButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  footer: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 30,
  },
  footerTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  footerBrandCol: {
    minWidth: 220,
  },
  footerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerBrandBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBrandText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  footerDescription: {
    marginTop: 16,
    color: "#98A2B3",
    fontSize: 14,
    lineHeight: 22,
  },
  socialRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
  },
  footerColumn: {
    minWidth: 180,
  },
  footerColumnTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 14,
  },
  footerLink: {
    color: "#98A2B3",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 2,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#253041",
    marginVertical: 28,
  },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  footerCopy: {
    color: "#98A2B3",
    fontSize: 13,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  techPill: {
    borderRadius: 999,
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  techPillText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },
});
