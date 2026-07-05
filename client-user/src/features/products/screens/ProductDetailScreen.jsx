// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/products/screens/ProductDetailScreen.jsx
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../../shared/components/common/Common";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../../accounts/hooks/useAccounts";
import { useProducts } from "../hooks/useProducts";

export function ProductDetailScreen() {
  const route = useRoute();
  const product = route?.params?.product;
  const { accounts, loadAccounts } = useAccounts();
  const { buyProduct, loading, error } = useProducts();
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (accounts[0]?.accountNumber) {
      setSelectedAccount(accounts[0].accountNumber);
    }
  }, [accounts]);

  const handleBuy = async () => {
    const result = await buyProduct({
      product,
      quantity: 1,
      fromAccountNumber: selectedAccount,
    });

    if (result) {
      Alert.alert("Compra realizada", "La compra se registró correctamente.");
    }
  };

  if (!product) {
    return <LoadingSpinner label="Cargando producto..." />;
  }

  const formatAmount = (amount) => `Q${Number(amount || 0).toFixed(2)}`;
  const outOfStock = product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.name}</Text>
            <View style={[styles.exclusiveBadge, product.exclusive ? null : styles.standardBadge]}>
              <MaterialIcons
                name={product.exclusive ? "star" : "star-border"}
                size={12}
                color={product.exclusive ? COLORS.secondary : "rgba(255,255,255,0.4)"}
              />
              <Text style={[styles.exclusiveText, product.exclusive ? null : styles.standardText]}>
                {product.exclusive ? "Exclusivo" : "Estándar"}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{product.type || "Producto"}</Text>
          <Text style={styles.description}>{product.description || "Descripción no disponible."}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Precio</Text>
              <Text style={styles.infoValue}>{formatAmount(product.price)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Stock</Text>
              <Text style={[styles.infoValue, outOfStock ? styles.infoValueDanger : null]}>
                {product.stock === null || product.stock === undefined ? "Ilimitado" : product.stock}
              </Text>
            </View>
          </View>

          {outOfStock ? (
            <View style={styles.noticeRow}>
              <MaterialIcons name="error-outline" size={14} color="#fca5a5" />
              <Text style={styles.noticeText}>Sin stock disponible por el momento.</Text>
            </View>
          ) : null}
        </Card>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Cuenta origen</Text>
          {accounts.map((account) => (
            <Text key={account.accountNumber} style={selectedAccount === account.accountNumber ? styles.selectedAccount : styles.accountOption} onPress={() => setSelectedAccount(account.accountNumber)}>
              {account.accountType} • {String(account.accountNumber).replace(/(.{4})/g, "$1 ").trim()}
            </Text>
          ))}
        </Card>

        <Button title="Comprar" onPress={handleBuy} loading={loading} disabled={outOfStock} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  exclusiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,233,104,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,233,104,0.3)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  standardBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  exclusiveText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  standardText: {
    color: "rgba(255,255,255,0.4)",
  },
  subtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  price: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  description: {
    color: COLORS.text,
  },
  infoGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "rgba(11,24,48,0.5)",
    borderRadius: 12,
    padding: SPACING.sm,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  infoValueDanger: {
    color: "#fca5a5",
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.sm,
  },
  noticeText: {
    color: "#fca5a5",
    fontSize: FONT_SIZE.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectedAccount: {
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
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