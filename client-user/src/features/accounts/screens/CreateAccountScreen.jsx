// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/CreateAccountScreen.jsx
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../hooks/useAccounts";

const MINIMUMS = {
  AHORRO: 100,
  MONETARIA: 200,
  EMPRESARIAL: 1000,
};

export function CreateAccountScreen() {
  const navigation = useNavigation();
  const { createAccount, loading, error } = useAccounts();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      accountType: "AHORRO",
      balance: "",
    },
  });

  const onSubmit = async (values) => {
    const result = await createAccount(values);
    if (result) {
      Alert.alert("Cuenta creada", "La cuenta se creó correctamente.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear cuenta</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Controller
        control={control}
        name="accountType"
        rules={{ required: "Seleccione un tipo" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Tipo de cuenta" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.accountType?.message} />
        )}
      />

      <Controller
        control={control}
        name="balance"
        rules={{
          required: "Ingrese un saldo inicial",
          validate: (value) => {
            const numberValue = Number(value);
            const accountType = (control._formValues?.accountType || "AHORRO").toUpperCase();
            const minimum = MINIMUMS[accountType];
            return !minimum || numberValue >= minimum || `El mínimo para ${accountType.toLowerCase()} es Q${minimum}`;
          },
        }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Saldo inicial" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.balance?.message} />
        )}
      />

      <Button title="Guardar cuenta" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
