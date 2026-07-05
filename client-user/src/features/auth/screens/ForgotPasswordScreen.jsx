// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/auth/screens/ForgotPasswordScreen.jsx
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import authClient from "../../../shared/api/authClient";

export function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError("");
    try {
      await authClient.post("/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error al enviar el correo de recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topIconCircle}>
          <MaterialCommunityIcons name="lock-reset" size={26} color={COLORS.primary} />
        </View>

        <View style={styles.card}>
          <Image
            source={require("../../../../assets/paysmart_logo_outline_v2_card.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>{sent ? "¡Listo!" : "Recuperar Contraseña"}</Text>
          <Text style={styles.subtitle}>
            {sent
              ? "Te enviamos un enlace de recuperación a tu correo. Puede tardar unos minutos."
              : "Ingresa tu correo para recuperar tu contraseña"}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {sent ? (
            <>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✉️</Text>
              </View>
              <Button title="Volver al Login" onPress={() => navigation.navigate("Login")} />
            </>
          ) : (
            <>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El email es obligatorio",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" },
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Email"
                    placeholder="email@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Button
                title={loading ? "Enviando..." : "Recuperar Contraseña"}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
              />

              <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
                ¿Recordaste tu contraseña? Iniciar Sesión
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    padding: SPACING.xl,
  },
  logo: {
    width: 96,
    height: 90,
    alignSelf: "center",
    marginBottom: SPACING.sm,
  },
  topIconCircle: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(65,210,242,0.12)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  linkText: {
    marginTop: SPACING.lg,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  iconCircle: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  iconText: {
    fontSize: 28,
  },
});