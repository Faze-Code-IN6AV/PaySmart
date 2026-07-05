// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/AccountDetailScreen.jsx
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../../shared/components/common/Common";
import { MaskedAccountNumber } from "../../../shared/components/common/MaskedAccountNumber";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { formatCurrency } from "../../../shared/utils/format";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAccounts } from "../hooks/useAccounts";

export function AccountDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { getBalance, loading, error } = useAccounts();
  const [balance, setBalance] = useState(null);
  const account = route?.params?.account;
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";
  const isClosed = account?.status === "CERRADO";

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
    <ScreenBackground>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Detalle de cuenta</Text>
          <Text style={styles.label}>Tipo: {account?.accountType || "Cuenta"}</Text>

          <View style={styles.numberRow}>
            <Text style={styles.label}>Número: </Text>
            <MaskedAccountNumber accountNumber={account?.accountNumber} />
          </View>

          <Text style={styles.balance}>
            Saldo: Q{formatCurrency(balance !== null ? balance : account?.balance)}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card>

        <View style={styles.actions}>
          {isAdmin ? (
            <Button
              title="Depósito"
              variant="secondary"
              disabled={isClosed}
              onPress={() =>
                navigation.navigate("Transactions", {
                  screen: "Deposit",
                  params: { accountNumber: account?.accountNumber },
                })
              }
            />
          ) : (
            <Button title="Depósito" variant="secondary" disabled onPress={() => {}} />
          )}
          <Button
            title="Transferencia"
            disabled={isClosed}
            onPress={() =>
              navigation.navigate("Transactions", {
                screen: "Transfer",
                params: { accountNumber: account?.accountNumber },
              })
            }
          />
        </View>
        {isClosed ? (
          <Text style={styles.depositNote}>
            Esta cuenta está cerrada. No se pueden realizar depósitos ni transferencias.
          </Text>
        ) : !isAdmin ? (
          <Text style={styles.depositNote}>
            Los depósitos solo puede realizarlos el banco. Acude a una agencia de PaySmart para depositar a esta cuenta.
          </Text>
        ) : null}

        <Button title="Volver" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fca5a5",
    marginTop: SPACING.sm,
  },
  depositNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
});