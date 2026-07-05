// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/components/common/TotalBalanceCard.jsx
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import { useAccounts } from "../../../features/accounts/hooks/useAccounts";

// Tarjeta con el total de dinero en todas las cuentas del cliente — se
// muestra arriba del conversor de divisas en la pestaña de Inicio. El monto
// está oculto por defecto; se revela con el ícono de ojo.
export function TotalBalanceCard() {
  const { accounts, loading, loadAccounts } = useAccounts();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const activeCount = accounts.filter((a) => a.status === "ACTIVO").length;

  return (
    <View style={styles.card}>
      <View style={styles.decorCircle} />
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="account-balance-wallet" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.label}>Total en todas tus cuentas</Text>
      </View>

      {loading && !accounts.length ? (
        <Text style={styles.loadingText}>Calculando...</Text>
      ) : (
        <>
          <View style={styles.totalRow}>
            <Text style={styles.total}>
              {visible ? (
                <>
                  Q{formatCurrency(total)} <Text style={styles.currency}>GTQ</Text>
                </>
              ) : (
                "Q •••••••"
              )}
            </Text>
            <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10} style={styles.eyeButton}>
              <MaterialIcons name={visible ? "visibility-off" : "visibility"} size={20} color={COLORS.primary} />
            </Pressable>
          </View>
          <Text style={styles.sub}>
            {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} · {activeCount} activa{activeCount !== 1 ? "s" : ""}
          </Text>
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
    borderColor: "rgba(65,210,242,0.2)",
    padding: SPACING.lg,
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(65,210,242,0.07)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(65,210,242,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.sm,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  eyeButton: {
    padding: 2,
  },
  total: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
  },
  currency: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.sm,
    fontWeight: "400",
  },
  sub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});