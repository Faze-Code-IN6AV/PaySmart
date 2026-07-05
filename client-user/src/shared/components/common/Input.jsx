// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/Input.jsx
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

export function Input({ label, error, editable = true, ...props }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          editable === false ? styles.inputDisabled : null,
          error ? styles.inputError : null,
        ]}
        placeholderTextColor="rgba(255,255,255,0.35)"
        editable={editable}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.secondaryBlue,
  },
  inputDisabled: {
    color: "rgba(255,255,255,0.4)",
    borderColor: "rgba(65,210,242,0.08)",
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});