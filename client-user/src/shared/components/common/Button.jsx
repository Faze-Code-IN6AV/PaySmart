// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/Button.jsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

export function Button({ title, onPress, variant = "primary", loading = false, disabled = false }) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        disabled || loading ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? COLORS.primary : COLORS.onPrimary} />
      ) : (
        <Text style={[styles.text, isSecondary ? styles.secondaryText : null]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: "rgba(65,210,242,0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
  secondaryText: {
    color: COLORS.primary,
  },
});