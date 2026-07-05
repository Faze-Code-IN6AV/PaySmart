// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/products/screens/MyPurchasesScreen.jsx
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useProducts } from "../hooks/useProducts";

export function MyPurchasesScreen() {
  const { purchases, loading, error, loadPurchases } = useProducts();

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  if (loading && !purchases.length) {
    return <LoadingSpinner label="Cargando compras..." />;
  }

  return (
    <ScreenBackground>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis compras</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!purchases.length && !error ? <EmptyState title="Sin compras" description="Aún no realizas compras." /> : null}

      {purchases.map((purchase) => (
        <Card key={purchase.id || purchase.purchaseId} style={styles.card}>
          <Text style={styles.cardTitle}>{purchase.product?.name || purchase.product || "Producto"}</Text>
          <Text style={styles.cardSubtitle}>Cantidad: {purchase.quantity || 1}</Text>
          <Text style={styles.price}>Q{Number(purchase.total || purchase.amount || 0).toFixed(2)}</Text>
        </Card>
      ))}
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
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardSubtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  price: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});