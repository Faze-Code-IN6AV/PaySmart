// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/auth/screens/LoginScreen.jsx
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export function LoginScreen({ navigation }) {
  const { handleLogin, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    await handleLogin(values);
  };

  return (
    <ScreenBackground>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image
            source={require("../../../../assets/paysmart_logo_outline_v2_card.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus credenciales para acceder a PaySmart</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Controller
            control={control}
            name="emailOrUsername"
            rules={{ required: "El email o username es obligatorio" }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email o Username"
                placeholder="email@example.com o username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                error={errors.emailOrUsername?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: "La contraseña es obligatoria" }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button title={loading ? "Iniciando sesión..." : "Iniciar Sesión"} onPress={handleSubmit(onSubmit)} loading={loading} />

          <Text style={styles.linkText} onPress={() => navigation.navigate("ForgotPassword")}>
            ¿Olvidaste tu contraseña?
          </Text>
        </View>

        <Text style={styles.footerNote}>
          Las cuentas son creadas únicamente por el administrador del banco.
        </Text>
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
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
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
  footerNote: {
    marginTop: SPACING.lg,
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    textAlign: "center",
  },
});