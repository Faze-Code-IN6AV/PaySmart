// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/CreateAccountScreen.jsx
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAdminAccountSearch } from "../../../shared/hooks/useAdminAccountSearch";

const TYPES = ["AHORRO", "MONETARIA", "EMPRESARIAL"];

// El administrador no puede abrir cuentas para sí mismo: esta pantalla
// siempre abre una cuenta para el cliente encontrado en la pestaña de
// Cuentas (client.id / client.email), igual que CreateAccountModal.jsx en
// client-admin.
export function CreateAccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const client = route?.params?.client;
  const { adminCreateForUser } = useAdminAccountSearch();
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!accountType) {
      setError("Selecciona el tipo de cuenta.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await adminCreateForUser({ userId: client.id, email: client.email, accountType });
    setLoading(false);

    if (result.success) {
      Alert.alert("Cuenta creada", "La cuenta bancaria se creó correctamente.");
      navigation.goBack();
    } else {
      setError(result.error);
    }
  };

  if (!client) {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.errorText}>
            Primero busca un cliente en la pestaña de Cuentas para poder abrirle una cuenta.
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nueva Cuenta Bancaria</Text>
        <Text style={styles.subtitle}>
          Cliente: <Text style={styles.subtitleBold}>{client.username}</Text>
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Tipo de cuenta</Text>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setAccountType(t)}
            style={[styles.typeOption, accountType === t ? styles.typeOptionActive : null]}
          >
            <Text style={[styles.typeOptionText, accountType === t ? styles.typeOptionTextActive : null]}>{t}</Text>
          </Pressable>
        ))}

        <Text style={styles.note}>
          La cuenta se crea con saldo Q0.00. El administrador puede hacer depósitos desde Transacciones.
        </Text>

        <Button title={loading ? "Creando..." : "Crear"} onPress={handleCreate} loading={loading} disabled={!accountType} />
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
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
  },
  subtitleBold: {
    fontWeight: "700",
  },
  label: {
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  typeOption: {
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.2)",
    backgroundColor: "rgba(65,210,242,0.05)",
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  typeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
  },
  typeOptionTextActive: {
    color: COLORS.onPrimary,
  },
  note: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    lineHeight: 16,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
  },
});