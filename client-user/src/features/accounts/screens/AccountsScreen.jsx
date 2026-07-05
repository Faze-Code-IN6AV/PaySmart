// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/screens/AccountsScreen.jsx
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../../../shared/components/common/Button";
import { EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { Input } from "../../../shared/components/common/Input";
import { MaskedAccountNumber } from "../../../shared/components/common/MaskedAccountNumber";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAdminAccountSearch } from "../../../shared/hooks/useAdminAccountSearch";
import { useAccounts } from "../hooks/useAccounts";

// Config visual por tipo de cuenta — réplica de TYPE_CONFIG en AccountCard.jsx (client-admin)
const TYPE_CONFIG = {
  AHORRO: { label: "Ahorro", icon: "savings", accent: COLORS.primary },
  MONETARIA: { label: "Monetaria", icon: "credit-card", accent: COLORS.secondary },
  EMPRESARIAL: { label: "Empresarial", icon: "account-balance", accent: COLORS.primary },
};

const STATUS_BADGE = {
  ACTIVO: { label: "Activo", bg: "rgba(65,210,242,0.12)", color: COLORS.primary },
  SUSPENDIDO: { label: "Suspendido", bg: "rgba(255,233,104,0.12)", color: COLORS.secondary },
  CERRADO: { label: "Cerrado", bg: "rgba(239,68,68,0.12)", color: "#fca5a5" },
};

function AccountCard({ account, onDetail }) {
  const config = TYPE_CONFIG[account.accountType] ?? TYPE_CONFIG.AHORRO;
  const status = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;

  return (
    <View style={[styles.card, { borderColor: `${config.accent}4D` }]}>
      <View style={styles.decorCircle} />

      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconWrap, { backgroundColor: `${config.accent}22` }]}>
            <MaterialIcons name={config.icon} size={18} color={config.accent} />
          </View>
          <Text style={styles.cardTitle}>Cuenta {config.label}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Número de cuenta</Text>
        <MaskedAccountNumber accountNumber={account.accountNumber} accentColor={config.accent} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Saldo disponible</Text>
        <Text style={styles.balance}>
          Q{formatCurrency(account.balance)} <Text style={styles.balanceCurrency}>GTQ</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Abierta {formatDate(account.createdAt)}</Text>
      </View>

      <Button title="Ver detalle" variant="secondary" onPress={onDetail} />
    </View>
  );
}

// ─── Tarjeta de cuenta en la vista de administrador (con acciones) ─────────
function AdminAccountCard({ account, onSuspend, onActivate, onDeactivate }) {
  const status = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;
  const isActive = account.status === "ACTIVO";
  const isSuspended = account.status === "SUSPENDIDO";
  const isClosed = account.status === "CERRADO";

  return (
    <View style={[styles.card, { borderColor: `${status.color}4D`, opacity: isClosed ? 0.6 : 1 }]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <MaterialIcons name="credit-card" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{account.accountType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Número de cuenta</Text>
        <Text style={styles.plainAccountNumber}>{account.accountNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Saldo</Text>
        <Text style={styles.balance}>Q{formatCurrency(account.balance)}</Text>
      </View>

      {!isClosed ? (
        <View style={styles.adminActionsRow}>
          {isActive ? (
            <Button title="Suspender" variant="secondary" onPress={() => onSuspend(account.accountNumber)} />
          ) : null}
          {isSuspended ? (
            <Button title="Activar" variant="secondary" onPress={() => onActivate(account.accountNumber)} />
          ) : null}
          <Button title="Cerrar" variant="secondary" onPress={() => onDeactivate(account.accountNumber)} />
        </View>
      ) : null}
    </View>
  );
}

// ─── Vista de administrador: buscar cliente y gestionar sus cuentas ────────
function AdminAccountsView() {
  const navigation = useNavigation();
  const {
    foundClient,
    searchResults,
    searchLoading,
    error,
    searchClient,
    suspendAccount,
    activateAccount,
    deactivateAccount,
  } = useAdminAccountSearch();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    searchClient(query.trim());
  };

  const confirmAction = (action, label, accountNumber, run) => {
    Alert.alert(label, "¿Deseas continuar con esta acción?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => run(accountNumber) },
    ]);
  };

  const handleRefresh = () => {
    if (foundClient?.email) {
      searchClient(foundClient.email);
    } else if (query.trim()) {
      searchClient(query.trim());
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={searchLoading} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Gestión de Cuentas</Text>
        <Text style={styles.subtitle}>Busca un cliente por correo, username o DPI</Text>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Correo, username o DPI" value={query} onChangeText={setQuery} autoCapitalize="none" />
          </View>
          <Button title={searchLoading ? "..." : "Buscar"} onPress={handleSearch} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {foundClient ? (
          <View style={styles.clientCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientLabel}>Cliente encontrado</Text>
              <Text style={styles.clientName}>
                {foundClient.name} {foundClient.surname}
              </Text>
              <Text style={styles.clientMeta}>
                @{foundClient.username} · {foundClient.email}
              </Text>
            </View>
            <Button
              title="Abrir cuenta"
              onPress={() => navigation.navigate("CreateAccount", { client: foundClient })}
            />
          </View>
        ) : null}

        {foundClient && !searchResults.length && !searchLoading ? (
          <EmptyState
            title="Sin cuentas bancarias"
            description='Usa el botón "Abrir cuenta" para crear su primera cuenta.'
          />
        ) : null}

        {searchResults.map((account) => (
          <AdminAccountCard
            key={account._id || account.accountNumber}
            account={account}
            onSuspend={(num) => confirmAction("suspend", "Suspender cuenta", num, suspendAccount)}
            onActivate={(num) => confirmAction("activate", "Activar cuenta", num, activateAccount)}
            onDeactivate={(num) => confirmAction("deactivate", "Cerrar cuenta", num, deactivateAccount)}
          />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

// ─── Vista de cliente normal ────────────────────────────────────────────────
function ClientAccountsView() {
  const navigation = useNavigation();
  const { accounts, loading, error, loadAccounts } = useAccounts();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  if (loading && !accounts.length) {
    return <LoadingSpinner label="Cargando cuentas..." />;
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAccounts} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis cuentas</Text>
          <Button title="Crear" variant="secondary" disabled onPress={() => {}} />
        </View>
        <View style={styles.noticeRow}>
          <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.noticeText}>
            Las cuentas bancarias las crea únicamente el administrador. Acude a tu agencia PaySmart para abrir una
            nueva cuenta.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!accounts.length && !error ? (
          <EmptyState title="Sin cuentas" description="Aún no tienes cuentas creadas." />
        ) : null}

        {accounts.map((account) => (
          <AccountCard
            key={account.accountNumber || account.id}
            account={account}
            onDetail={() => navigation.navigate("AccountDetail", { account })}
          />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

export function AccountsScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";

  return isAdmin ? <AdminAccountsView /> : <ClientAccountsView />;
}

const styles = StyleSheet.create({
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
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(65,210,242,0.06)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.2)",
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  clientLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: FONT_SIZE.xs,
  },
  clientName: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.md,
    marginTop: 2,
  },
  clientMeta: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  plainAccountNumber: {
    color: COLORS.text,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  adminActionsRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(65,210,242,0.1)",
    paddingTop: SPACING.sm,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: SPACING.md,
  },
  noticeText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    flex: 1,
    lineHeight: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(65,210,242,0.08)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
  },
  balance: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
  },
  balanceCurrency: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "400",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(65,210,242,0.1)",
    paddingTop: SPACING.sm,
  },
  footerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
  },
});