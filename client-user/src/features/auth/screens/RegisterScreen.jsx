// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/auth/screens/RegisterScreen.jsx
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAuth } from "../hooks/useAuth";

export function RegisterScreen({ navigation }) {
  const { handleRegister, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      dpi: "",
      address: "",
      workName: "",
      monthlyIncome: "",
    },
  });

  const onSubmit = async (values) => {
    const result = await handleRegister(values);
    if (result?.success) {
      Alert.alert("Registro exitoso", result.message || "Debe verificar su correo para continuar.", [
        { text: "Aceptar", onPress: () => navigation.navigate("Login") },
      ]);
    }
  };

  return (
    <ScreenBackground>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Regístrate como cliente de PaySmart</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Controller
        control={control}
        name="name"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Nombre" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
        )}
      />

      <Controller
        control={control}
        name="surname"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Apellido" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.surname?.message} />
        )}
      />

      <Controller
        control={control}
        name="username"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Usuario" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.username?.message} />
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{ required: "Este campo es obligatorio", pattern: { value: /\S+@\S+\.\S+/, message: "Correo inválido" } }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Correo" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "Este campo es obligatorio", minLength: { value: 6, message: "Mínimo 6 caracteres" } }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Contraseña" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
        )}
      />

      <Controller
        control={control}
        name="phone"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Teléfono" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} />
        )}
      />

      <Controller
        control={control}
        name="dpi"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="DPI" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.dpi?.message} />
        )}
      />

      <Controller
        control={control}
        name="address"
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Dirección" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.address?.message} />
        )}
      />

      <Controller
        control={control}
        name="workName"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Trabajo" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.workName?.message} />
        )}
      />

      <Controller
        control={control}
        name="monthlyIncome"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Ingreso mensual" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.monthlyIncome?.message} />
        )}
      />

      <Button title="Registrarme" onPress={handleSubmit(onSubmit)} loading={loading} />

      <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
    </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  linkText: {
    marginTop: SPACING.lg,
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "600",
  },
});