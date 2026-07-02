// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/Button.jsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { COLORS, FONT_SIZE, SHADOWS, SPACING } from "../../constants/theme";

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
        <ActivityIndicator color={isSecondary ? COLORS.primary : COLORS.surface} />
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
    ...SHADOWS.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  secondaryText: {
    color: COLORS.primary,
  },
});
