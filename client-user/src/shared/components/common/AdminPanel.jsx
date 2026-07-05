// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/AdminPanel.jsx
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";
import { formatCurrency, formatDate } from "../../utils/format";
import { useAdminReport } from "../../../features/home/hooks/useAdminReport";
import { LoadingSpinner } from "./Common";

const STATUS_LABEL = {
  ACTIVO: { label: "Activa", color: COLORS.primary },
  SUSPENDIDO: { label: "Suspendida", color: COLORS.secondary },
  CERRADO: { label: "Cerrada", color: "#fca5a5" },
};

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <View style={[styles.statCard, { borderColor: `${accent}30` }]}>
      <View style={styles.statHeaderRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statIconWrap, { backgroundColor: `${accent}22` }]}>
          <MaterialIcons name={icon} size={16} color={accent} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// Réplica compacta de ReportPage.jsx (rama isAdmin) de client-admin, adaptada
// al formato de la app móvil: KPIs + cuentas con más movimientos.
export function AdminPanel() {
  const { accountsMostMovements, accountsAdminOverview, loading, error, fetchAccountsMostMovements, fetchAccountsAdminOverview } =
    useAdminReport();

  useEffect(() => {
    fetchAccountsMostMovements({ order: "desc", limit: 10 });
    fetchAccountsAdminOverview({ limit: 5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topAccount = accountsMostMovements[0];
  const totalAccounts = accountsAdminOverview?.length ?? 0;
  const activeCount = accountsAdminOverview?.filter((a) => a.status === "ACTIVO").length ?? 0;
  const suspendedCount = accountsAdminOverview?.filter((a) => a.status === "SUSPENDIDO").length ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons name="admin-panel-settings" size={18} color={COLORS.secondary} />
        <Text style={styles.title}>Panel de Administración</Text>
      </View>
      <Text style={styles.subtitle}>Estadísticas y reportes del sistema PaySmart</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && !accountsMostMovements.length && !accountsAdminOverview ? (
        <LoadingSpinner label="Cargando estadísticas..." />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              icon="credit-card"
              label="Cuentas"
              value={String(totalAccounts)}
              sub={`${activeCount} activas · ${suspendedCount} susp.`}
              accent={COLORS.primary}
            />
            <StatCard
              icon="trending-up"
              label="Más activa"
              value={topAccount ? `${topAccount.totalMovements} movs.` : "—"}
              sub={topAccount ? `...${String(topAccount.accountNumber).slice(-6)}` : "Sin datos"}
              accent="#4ADE80"
            />
          </View>

          <StatCard
            icon="bar-chart"
            label="Mayor monto acumulado"
            value={topAccount ? `Q${formatCurrency(topAccount.totalAmount)}` : "—"}
            sub="Cuenta con más movimientos"
            accent={COLORS.secondary}
          />

          <Text style={styles.sectionHeading}>CUENTAS CON MÁS MOVIMIENTOS</Text>
          {accountsMostMovements.slice(0, 5).map((row, i) => (
            <View key={row.accountNumber} style={styles.rowItem}>
              <Text style={styles.rowIndex}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowAccount}>
                  {String(row.accountNumber).slice(0, 6)}…{String(row.accountNumber).slice(-4)}
                </Text>
                <Text style={styles.rowDate}>Últ. mov. {formatDate(row.lastMovementAt)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.rowMovements}>{row.totalMovements} movs.</Text>
                <Text style={styles.rowAmount}>Q{formatCurrency(row.totalAmount)}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.sectionHeading}>RESUMEN DE CUENTAS PRINCIPALES</Text>
          {(accountsAdminOverview || []).slice(0, 5).map((acc) => {
            const st = STATUS_LABEL[acc.status] ?? { label: acc.status ?? "Activa", color: COLORS.primary };
            return (
              <View key={acc.accountNumber} style={styles.overviewCard}>
                <View style={styles.rowItem}>
                  <Text style={styles.rowAccount}>
                    {String(acc.accountNumber).slice(0, 6)}…{String(acc.accountNumber).slice(-4)}
                  </Text>
                  <Text style={[styles.statusBadge, { color: st.color }]}>{st.label}</Text>
                </View>
                <Text style={styles.overviewBalance}>Q{formatCurrency(acc.balance)}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,233,104,0.2)",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.md,
  },
  subtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(11,24,48,0.4)",
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
  },
  statSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeading: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(65,210,242,0.06)",
  },
  rowIndex: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    width: 16,
  },
  rowAccount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONT_SIZE.xs,
    fontFamily: "monospace",
  },
  rowDate: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    marginTop: 2,
  },
  rowMovements: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  rowAmount: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    marginTop: 2,
  },
  overviewCard: {
    backgroundColor: "rgba(11,24,48,0.4)",
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "700",
  },
  overviewBalance: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "800",
    marginTop: SPACING.xs,
  },
});