// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/screens/TransactionHistoryScreen.jsx
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useTransactions } from "../hooks/useTransactions";

export function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const accountNumber = route?.params?.accountNumber || "";
  const { transactions, loading, error, loadHistory, reverse } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (accountNumber) {
      loadHistory(accountNumber);
    }
  }, [accountNumber, loadHistory]);

  const handleRefresh = async () => {
    if (!accountNumber) return;
    setRefreshing(true);
    await loadHistory(accountNumber);
    setRefreshing(false);
  };

  const handleReverse = async (transactionId) => {
    const result = await reverse(transactionId);
    if (result) {
      Alert.alert("Revertida", "La transacción fue reversada.");
      if (accountNumber) {
        loadHistory(accountNumber);
      }
    }
  };

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;

  if (loading && !transactions.length) {
    return <LoadingSpinner label="Cargando historial..." />;
  }

  return (
    <ScreenBackground>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={styles.title}>Historial</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!transactions.length && !error ? <EmptyState title="Sin historial" description="No hay movimientos registrados." /> : null}

      {transactions.map((item) => (
        <Card key={item._id || item.id || item.transactionId} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>{item.description || item.normalizedType || "Transacción"}</Text>
            <Text style={styles.badge}>{item.status || "PENDIENTE"}</Text>
          </View>
          <Text style={styles.subtitle}>{item.normalizedType || "N/D"}</Text>
          <Text style={styles.balance}>{formatAmount(item.amount)}</Text>
          {item.canReverse ? (
            <Button title="Revertir" variant="secondary" onPress={() => handleReverse(item._id || item.id || item.transactionId)} />
          ) : null}
        </Card>
      ))}

      <Button title="Volver" variant="secondary" onPress={() => navigation.goBack()} />
    </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginLeft: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  balance: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});