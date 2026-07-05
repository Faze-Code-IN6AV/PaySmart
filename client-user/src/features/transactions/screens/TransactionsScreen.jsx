// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/screens/TransactionsScreen.jsx
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { formatCurrency } from "../../../shared/utils/format";
import { useAccounts } from "../../accounts/hooks/useAccounts";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAdminAccountSearch } from "../../../shared/hooks/useAdminAccountSearch";
import { useTransactions } from "../hooks/useTransactions";

// ─── Vista de administrador: buscar cliente, ver sus cuentas activas y
// crearle una transacción (depósito o transferencia) ───────────────────────
function AdminTransactionsView() {
  const navigation = useNavigation();
  const { foundClient, searchResults, searchLoading, error, searchClient } = useAdminAccountSearch();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const activeAccounts = searchResults.filter((a) => a.status === "ACTIVO");

  const handleSearch = () => {
    if (!query.trim()) return;
    setSelected(null);
    searchClient(query.trim());
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Movimientos</Text>
        <Text style={styles.subtitle}>Busca un cliente para hacerle un depósito o transferencia</Text>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Correo, username o DPI" value={query} onChangeText={setQuery} autoCapitalize="none" />
          </View>
          <Button title={searchLoading ? "..." : "Buscar"} onPress={handleSearch} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {foundClient ? (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              {foundClient.name} {foundClient.surname}
            </Text>
            <Text style={styles.clientMeta}>
              @{foundClient.username} · {foundClient.email}
            </Text>
          </Card>
        ) : null}

        {foundClient && !activeAccounts.length && !searchLoading ? (
          <EmptyState title="Sin cuentas activas" description="Este cliente no tiene cuentas activas disponibles." />
        ) : null}

        {activeAccounts.map((account) => (
          <Pressable
            key={account._id || account.accountNumber}
            onPress={() => setSelected(account)}
            style={[
              styles.accountRow,
              selected?.accountNumber === account.accountNumber ? styles.accountRowActive : null,
            ]}
          >
            <MaterialIcons name="credit-card" size={18} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.accountRowType}>{account.accountType}</Text>
              <Text style={styles.accountRowNumber}>{account.accountNumber}</Text>
            </View>
            <Text style={styles.accountRowBalance}>Q{formatCurrency(account.balance)}</Text>
          </Pressable>
        ))}

        {selected ? (
          <View style={styles.actions}>
            <Button
              title="Depósito"
              variant="secondary"
              onPress={() => navigation.navigate("Deposit", { accountNumber: selected.accountNumber })}
            />
            <Button
              title="Transferencia"
              onPress={() => navigation.navigate("Transfer", { accountNumber: selected.accountNumber })}
            />
          </View>
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

// ─── Vista de cliente normal ────────────────────────────────────────────────
function ClientTransactionsView() {
  const navigation = useNavigation();
  const { accounts: allAccounts, loadAccounts } = useAccounts();
  const { transactions, loading, error, loadHistory, getLastTransaction } = useTransactions();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastTransactions, setLastTransactions] = useState([]);

  // Las cuentas cerradas no deben aparecer aquí ni poder usarse para
  // transferencias.
  const accounts = allAccounts.filter((a) => a.status !== "CERRADO");
  const hasAccounts = accounts.length > 0;
  const selected = accounts.find((a) => a.accountNumber === selectedAccount);

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
      setLastTransactions(last || []);
    };

    run();
  }, [selectedAccount, loadHistory, getLastTransaction]);

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;
  const lastTransaction = lastTransactions[0];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    if (selectedAccount) {
      await loadHistory(selectedAccount);
      const last = await getLastTransaction(selectedAccount);
      setLastTransactions(last || []);
    }
    setRefreshing(false);
  };

  if (loading && !transactions.length) {
    return <LoadingSpinner label="Cargando movimientos..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={styles.title}>Movimientos</Text>
      <Text style={styles.subtitle}>Historial de movimientos de tus cuentas</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!hasAccounts ? (
        <Card style={styles.noAccountsCard}>
          <MaterialIcons name="info-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.noAccountsText}>No tienes cuentas activas. Contacta al banco.</Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button title="Depósito" variant="secondary" disabled onPress={() => {}} />
        <Button
          title="Transferencia"
          disabled={!hasAccounts}
          onPress={() => navigation.navigate("Transfer", { accountNumber: selectedAccount })}
        />
      </View>
      <View style={styles.noticeRow}>
        <MaterialIcons name="info-outline" size={13} color="rgba(255,255,255,0.35)" />
        <Text style={styles.depositNote}>
          Los depósitos solo puede realizarlos el banco. Acude a una agencia de PaySmart para depositar a tu cuenta.
        </Text>
      </View>

      {hasAccounts ? (
        <View style={{ marginBottom: SPACING.md }}>
          <Text style={styles.sectionTitle}>Selecciona una de tus cuentas</Text>

          <Pressable style={styles.pickerBar} onPress={() => setPickerOpen((v) => !v)}>
            {selected ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerBarType}>
                  {selected.accountType} · ...{String(selected.accountNumber).slice(-4)}
                </Text>
                <Text style={styles.pickerBarBalance}>Q{formatCurrency(selected.balance)}</Text>
              </View>
            ) : (
              <Text style={styles.pickerBarPlaceholder}>— Elige una cuenta —</Text>
            )}
            <MaterialIcons name={pickerOpen ? "expand-less" : "expand-more"} size={22} color={COLORS.primary} />
          </Pressable>

          {pickerOpen ? (
            <View style={styles.pickerOptions}>
              {accounts.map((account) => (
                <Pressable
                  key={account.accountNumber}
                  style={[
                    styles.pickerOption,
                    selectedAccount === account.accountNumber ? styles.pickerOptionActive : null,
                  ]}
                  onPress={() => {
                    setSelectedAccount(account.accountNumber);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.pickerOptionType}>
                    {account.accountType} · ...{String(account.accountNumber).slice(-4)}
                  </Text>
                  <Text style={styles.pickerOptionBalance}>Q{formatCurrency(account.balance)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {selected ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Última transacción</Text>
          <Text style={lastTransaction?.description ? styles.lastTitle : styles.lastTitleEmpty}>
            {lastTransaction?.description || "Sin descripción"}
          </Text>
          <Text style={styles.balance}>{formatAmount(lastTransaction?.amount)}</Text>
        </Card>
      ) : null}

      {hasAccounts ? (
        <>
          <Text style={styles.sectionTitle}>Últimos movimientos</Text>
          {!transactions.length && !error ? <EmptyState title="Sin movimientos" description="No hay historial para esta cuenta." /> : null}

          {transactions.slice(0, 5).map((item) => (
            <Card key={item._id || item.id || item.transactionId} style={styles.card}>
              <Text style={item.description ? styles.cardTitle : styles.lastTitleEmpty}>
                {item.description || "Sin descripción"}
              </Text>
              <Text style={styles.cardSubtitle}>{item.normalizedType || "N/D"}</Text>
              <Text style={styles.balance}>{formatAmount(item.amount)}</Text>
            </Card>
          ))}

          <Button title="Ver historial" variant="secondary" onPress={() => navigation.navigate("TransactionHistory", { accountNumber: selectedAccount })} />
        </>
      ) : null}
    </ScrollView>
  );
}

export function TransactionsScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";

  return (
    <ScreenBackground>
      {isAdmin ? <AdminTransactionsView /> : <ClientTransactionsView />}
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
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  clientMeta: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  accountRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(65,210,242,0.08)",
  },
  accountRowType: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  accountRowNumber: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  accountRowBalance: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginBottom: SPACING.md,
  },
  depositNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FONT_SIZE.xs,
    flex: 1,
    lineHeight: 16,
  },
  noAccountsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  noAccountsText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: FONT_SIZE.sm,
    flex: 1,
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
  lastTitle: {
    color: COLORS.text,
    fontWeight: "600",
  },
  // "Sin descripción" y similares — texto tenue en cursiva para
  // diferenciarlo claramente de una descripción real.
  lastTitleEmpty: {
    color: "rgba(255,255,255,0.35)",
    fontStyle: "italic",
    fontSize: FONT_SIZE.sm,
  },
  pickerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.3)",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  pickerBarType: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  pickerBarBalance: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  pickerBarPlaceholder: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.sm,
  },
  pickerOptions: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    borderRadius: 12,
    marginTop: SPACING.xs,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(65,210,242,0.08)",
  },
  pickerOptionActive: {
    backgroundColor: "rgba(65,210,242,0.08)",
  },
  pickerOptionType: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  pickerOptionBalance: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: FONT_SIZE.xs,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
  },
});