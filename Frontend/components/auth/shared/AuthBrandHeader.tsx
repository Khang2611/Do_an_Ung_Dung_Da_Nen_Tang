import React from "react";
import { StyleSheet, Text, View } from "react-native";

import BrandLogo from "@/components/branding/BrandLogo";

type Props = {
  title: string;
  subtitle: string;
};

export default function AuthBrandHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.brandRow}>
        <BrandLogo size={42} />

        <Text style={styles.brand}>
          Eng<Text style={styles.brandAccent}>Pro</Text>
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  brandAccent: {
    color: "#2563EB",
  },
  title: {
    marginTop: 18,
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
});
