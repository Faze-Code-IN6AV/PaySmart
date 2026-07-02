// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/products/screens/ProductsScreen.jsx
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useProducts } from "../hooks/useProducts";

export function ProductsScreen() {
  const navigation = useNavigation();
  const { products, loading, error, loadProducts } = useProducts();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;

  if (loading && !products.length) {
    return <LoadingSpinner label="Cargando productos..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Productos</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!products.length && !error ? <EmptyState title="Sin productos" description="No hay productos disponibles por el momento." /> : null}

      {products.map((product) => (
        <Card key={product.id || product.name} style={styles.card}>
          <Text style={styles.cardTitle}>{product.name}</Text>
          <Text style={styles.cardSubtitle}>{product.type || "Producto"}</Text>
          <Text style={styles.price}>{formatAmount(product.price)}</Text>
          <Button title="Ver detalle" variant="secondary" onPress={() => navigation.navigate("ProductDetail", { product })} />
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
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
