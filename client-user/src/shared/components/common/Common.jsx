// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/Common.jsx
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

export function LoadingSpinner({ label = "Cargando..." }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, description }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  label: {
    marginTop: SPACING.sm,
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
  },
  emptyDescription: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.12)",
  },
});