// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/screens/TransferScreen.jsx
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useTransactions } from "../hooks/useTransactions";

export function TransferScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transfer, loading, error } = useTransactions();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fromAccountNumber: route?.params?.accountNumber || "",
      toAccountNumber: "",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (values) => {
    const amount = Number(values.amount);
    if (amount > 2000) {
      Alert.alert("Límite excedido", "El monto máximo por transferencia es Q2,000.");
      return;
    }

    const result = await transfer(values);
    if (result) {
      Alert.alert("Transferencia exitosa", "La transferencia se registró correctamente.");
      navigation.reset({ index: 0, routes: [{ name: "TransactionsList" }] });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Transferencia</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Controller
        control={control}
        name="fromAccountNumber"
        rules={{ required: "Ingrese la cuenta origen" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Cuenta origen" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fromAccountNumber?.message} />
        )}
      />

      <Controller
        control={control}
        name="toAccountNumber"
        rules={{ required: "Ingrese la cuenta destino" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Cuenta destino" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.toAccountNumber?.message} />
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

      <Button title="Enviar transferencia" onPress={handleSubmit(onSubmit)} loading={loading} />
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