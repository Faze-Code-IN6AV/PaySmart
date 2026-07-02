// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/AccountsScreen.jsx
import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../hooks/useAccounts";

export function AccountsScreen() {
  const navigation = useNavigation();
  const { accounts, loading, error, loadAccounts } = useAccounts();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;

  if (loading && !accounts.length) {
    return <LoadingSpinner label="Cargando cuentas..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAccounts} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mis cuentas</Text>
        <Button title="Crear" variant="secondary" onPress={() => navigation.navigate("CreateAccount")} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!accounts.length && !error ? (
        <EmptyState title="Sin cuentas" description="Aún no tienes cuentas creadas." />
      ) : null}

      {accounts.map((account) => (
        <Card key={account.accountNumber || account.id} style={styles.card}>
          <Text style={styles.cardTitle}>{account.accountType || "Cuenta"}</Text>
          <Text style={styles.accountNumber}>No. {String(account.accountNumber || "---").replace(/(.{4})/g, "$1 ").trim()}</Text>
          <Text style={styles.balance}>{formatAmount(account.balance)}</Text>
          <Button title="Ver detalle" variant="secondary" onPress={() => navigation.navigate("AccountDetail", { account })} />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  accountNumber: {
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  balance: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
