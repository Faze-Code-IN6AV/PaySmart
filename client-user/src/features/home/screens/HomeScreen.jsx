// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/home/screens/HomeScreen.jsx
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";

import { AdminPanel } from "../../../shared/components/common/AdminPanel";
import { CurrencyConverter } from "../../../shared/components/common/CurrencyConverter";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { TotalBalanceCard } from "../../../shared/components/common/TotalBalanceCard";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAuthStore } from "../../../shared/store/authStore";

// Equivalente a ReportPage.jsx en client-admin:
// - Cliente: bienvenida + total de dinero en todas sus cuentas + conversor de divisas.
// - Administrador: panel de administración (estadísticas del sistema).
export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN_ROLE";
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // TotalBalanceCard / CurrencyConverter / AdminPanel cargan sus datos solos
  // al montarse — cambiar su `key` fuerza que se vuelvan a montar y recarguen.
  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Bienvenido a PaySmart</Text>
        <Text style={styles.subtitle}>
          {isAdmin ? "Estadísticas y reportes del sistema" : "Selecciona una sección del menú para continuar"}
        </Text>

        {isAdmin ? (
          <AdminPanel key={refreshKey} />
        ) : (
          <>
            <TotalBalanceCard key={refreshKey} />
            <CurrencyConverter key={refreshKey} />
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
});