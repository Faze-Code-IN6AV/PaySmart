// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/screens/TransactionsScreen.jsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../../accounts/hooks/useAccounts";
import { useTransactions } from "../hooks/useTransactions";

export function TransactionsScreen() {
  const navigation = useNavigation();
  const { accounts, loadAccounts } = useAccounts();
  const { transactions, loading, error, loadHistory, getLastTransaction } = useTransactions();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (accounts[0]?.accountNumber) {
      setSelectedAccount(accounts[0].accountNumber);
    }
  }, [accounts]);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const run = async () => {
      await loadHistory(selectedAccount);
      const last = await getLastTransaction(selectedAccount);
      setLastTransaction(last);
    };

    run();
  }, [selectedAccount, loadHistory, getLastTransaction]);

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;

  if (loading && !transactions.length) {
    return <LoadingSpinner label="Cargando movimientos..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Movimientos</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button title="Depósito" variant="secondary" onPress={() => navigation.navigate("Deposit")} />
        <Button title="Transferencia" onPress={() => navigation.navigate("Transfer")} />
      </View>

      {accounts.length ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Cuenta seleccionada</Text>
          {accounts.map((account) => (
            <Text key={account.accountNumber} style={selectedAccount === account.accountNumber ? styles.selectedAccount : styles.accountOption} onPress={() => setSelectedAccount(account.accountNumber)}>
              {account.accountType} • {String(account.accountNumber).replace(/(.{4})/g, "$1 ").trim()}
            </Text>
          ))}
        </Card>
      ) : null}

      {lastTransaction ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Última transacción</Text>
          <Text style={styles.lastTitle}>{lastTransaction?.description || "Sin descripción"}</Text>
          <Text style={styles.balance}>{formatAmount(lastTransaction?.amount)}</Text>
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>Últimos movimientos</Text>
      {!transactions.length && !error ? <EmptyState title="Sin movimientos" description="No hay historial para esta cuenta." /> : null}

      {transactions.slice(0, 5).map((item) => (
        <Card key={item.id || item.transactionId} style={styles.card}>
          <Text style={styles.cardTitle}>{item.description || item.normalizedType || "Transacción"}</Text>
          <Text style={styles.cardSubtitle}>{item.normalizedType || "N/D"}</Text>
          <Text style={styles.balance}>{formatAmount(item.amount)}</Text>
        </Card>
      ))}

      <Button title="Ver historial" variant="secondary" onPress={() => navigation.navigate("TransactionHistory")} />
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
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardSubtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  balance: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  selectedAccount: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    fontWeight: "700",
  },
  accountOption: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
