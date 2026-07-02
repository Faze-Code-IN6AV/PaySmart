// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/screens/DepositScreen.jsx
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useTransactions } from "../hooks/useTransactions";

export function DepositScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { deposit, loading, error } = useTransactions();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      accountNumber: route?.params?.accountNumber || "",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (values) => {
    const result = await deposit(values);
    if (result) {
      Alert.alert("Depósito exitoso", "El depósito se registró correctamente.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Depósito</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Controller
        control={control}
        name="accountNumber"
        rules={{ required: "Ingrese el número de cuenta" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Cuenta" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.accountNumber?.message} />
        )}
      />

      <Controller
        control={control}
        name="amount"
        rules={{ required: "Ingrese el monto" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Monto" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Descripción" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} />
        )}
      />

      <Button title="Registrar depósito" onPress={handleSubmit(onSubmit)} loading={loading} />
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
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
