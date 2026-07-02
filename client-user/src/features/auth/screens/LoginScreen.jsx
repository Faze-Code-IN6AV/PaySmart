// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/auth/screens/LoginScreen.jsx
import { Image, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
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
    <View style={styles.container}>
      <Image source={require("../../../../assets/paysmart_logo.png")} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Accede a tu cuenta de PaySmart</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Controller
        control={control}
        name="emailOrUsername"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label="Correo o usuario"
            placeholder="usuario@ejemplo.com"
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
        rules={{ required: "Este campo es obligatorio" }}
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

      <Button title="Ingresar" onPress={handleSubmit(onSubmit)} loading={loading} />

      <Text style={styles.linkText} onPress={() => navigation.navigate("Register")}>
        ¿No tienes cuenta? Regístrate
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  linkText: {
    marginTop: SPACING.lg,
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "600",
  },
});
