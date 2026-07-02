// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/AccountDetailScreen.jsx
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../hooks/useAccounts";

export function AccountDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { getBalance, loading, error } = useAccounts();
  const [balance, setBalance] = useState(null);
  const account = route?.params?.account;

  useEffect(() => {
    const run = async () => {
      if (account?.accountNumber) {
        const result = await getBalance(account.accountNumber);
        setBalance(result?.balance ?? result);
      }
    };

    run();
  }, [account, getBalance]);

  if (loading && balance === null) {
    return <LoadingSpinner label="Consultando saldo..." />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Detalle de cuenta</Text>
        <Text style={styles.label}>Tipo: {account?.accountType || "Cuenta"}</Text>
        <Text style={styles.label}>Número: {String(account?.accountNumber || "---").replace(/(.{4})/g, "$1 ").trim()}</Text>
        <Text style={styles.balance}>Saldo: Q{Number(balance !== null ? balance : account?.balance || 0).toFixed(2)}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Card>

      <View style={styles.actions}>
        <Button title="Depósito" variant="secondary" onPress={() => navigation.navigate("Deposit", { accountNumber: account?.accountNumber })} />
        <Button title="Transferencia" onPress={() => navigation.navigate("Transfer", { accountNumber: account?.accountNumber })} />
      </View>

      <Button title="Volver" variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  balance: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
});
