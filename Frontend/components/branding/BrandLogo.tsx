import React from "react";
import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from "react-native";

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function BrandLogo({ size = 42, style }: Props) {
  return (
    <View style={[styles.shadowWrap, { width: size, height: size }]}>
      <Image
        source={require("../../assets/branding/logo-mark.png")}
        style={[{ width: size, height: size }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowColor: "#2C4AF1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
});
