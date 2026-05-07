import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function AuthBackButton() {
  return (
    <Link asChild href="/">
      <Pressable style={styles.button}>
        <Ionicons color="#1E293B" name="arrow-back" size={22} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 8,
    left: 0,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFFE8",
    borderWidth: 1,
    borderColor: "#E5EAF3",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
});
