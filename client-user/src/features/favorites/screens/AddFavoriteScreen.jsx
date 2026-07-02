// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/favorites/screens/AddFavoriteScreen.jsx
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Input } from "../../../shared/components/common/Input";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useFavorites } from "../hooks/useFavorites";

export function AddFavoriteScreen() {
  const navigation = useNavigation();
  const { addFavorite, loading, error } = useFavorites();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      accountNumber: "",
      alias: "",
    },
  });

  const onSubmit = async (values) => {
    const result = await addFavorite(values);
    if (result) {
      Alert.alert("Favorito agregado", "La cuenta se guardó como favorita.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Agregar favorito</Text>
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
        name="alias"
        rules={{ required: "Ingrese un alias" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Alias" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.alias?.message} />
        )}
      />

      <Button title="Guardar favorito" onPress={handleSubmit(onSubmit)} loading={loading} />
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
