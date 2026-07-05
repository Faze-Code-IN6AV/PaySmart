// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/clients/screens/ClientFormScreen.jsx
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAdminClients } from "../../../shared/hooks/useAdminClients";

// Crear cliente (CreateClientModal.jsx) o editar cliente (EditClientModal.jsx)
// de client-admin, unificado en una sola pantalla para el celular.
export function ClientFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const mode = route?.params?.mode || "create";
  const client = route?.params?.client;
  const isEdit = mode === "edit";
  const { createClient, updateClient, loading, error } = useAdminClients();
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: client?.name || "",
      surname: client?.surname || "",
      username: client?.username || "",
      email: client?.email || "",
      password: "",
      phone: client?.phone || "",
      dpi: client?.dpi || "",
      address: client?.address || "",
      workName: client?.workName || "",
      monthlyIncome: client?.monthlyIncome?.toString() || "",
    },
  });

  const onSubmit = async (values) => {
    setFormError("");
    let result;

    if (isEdit) {
      result = await updateClient(client.id, {
        name: values.name,
        surname: values.surname,
        phone: values.phone,
        address: values.address,
        workName: values.workName,
        monthlyIncome: Number(values.monthlyIncome),
      });
    } else {
      result = await createClient(values);
    }

    if (result.success) {
      Alert.alert(isEdit ? "Cliente actualizado" : "Cliente creado", "Los cambios se guardaron correctamente.");
      navigation.goBack();
    } else {
      setFormError(result.error);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEdit ? "Editar Cliente" : "Nuevo Cliente Bancario"}</Text>
        <Text style={styles.subtitle}>
          {isEdit ? `@${client?.username}` : "Solo el administrador puede crear cuentas de cliente"}
        </Text>

        {formError || error ? <Text style={styles.errorText}>{formError || error}</Text> : null}

        <Controller
          control={control}
          name="name"
          rules={{ required: "Nombre requerido" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Nombre" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="surname"
          rules={{ required: "Apellido requerido" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Apellido" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.surname?.message} />
          )}
        />

        {!isEdit ? (
          <>
            <Controller
              control={control}
              name="username"
              rules={{ required: "Username requerido" }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Username" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.username?.message} />
              )}
            />
            <Controller
              control={control}
              name="email"
              rules={{ required: "Email requerido", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" } }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: "Contraseña requerida", minLength: { value: 8, message: "Mínimo 8 caracteres" } }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Contraseña" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
              )}
            />
            <Controller
              control={control}
              name="dpi"
              rules={{ required: "DPI requerido", pattern: { value: /^\d{13}$/, message: "Debe tener 13 dígitos" } }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="DPI" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.dpi?.message} />
              )}
            />
          </>
        ) : null}

        <Controller
          control={control}
          name="phone"
          rules={{ required: "Teléfono requerido", pattern: { value: /^\d{8}$/, message: "Debe tener 8 dígitos" } }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Teléfono" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} />
          )}
        />
        <Controller
          control={control}
          name="address"
          rules={{ required: "Dirección requerida" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Dirección" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.address?.message} />
          )}
        />
        <Controller
          control={control}
          name="workName"
          rules={{ required: "Nombre de trabajo requerido" }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Nombre de trabajo" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.workName?.message} />
          )}
        />
        <Controller
          control={control}
          name="monthlyIncome"
          rules={{
            required: "Ingresos requeridos",
            validate: (v) => Number(v) >= 100 || "Mínimo Q100.00",
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Ingresos mensuales" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.monthlyIncome?.message} />
          )}
        />

        <Button title={isEdit ? "Guardar cambios" : "Crear cliente"} onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
  },
});