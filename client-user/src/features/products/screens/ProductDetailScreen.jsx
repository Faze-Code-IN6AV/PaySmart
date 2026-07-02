// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/products/screens/ProductDetailScreen.jsx
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../../shared/components/common/Common";
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>{product.type || "Producto"}</Text>
        <Text style={styles.price}>{formatAmount(product.price)}</Text>
        <Text style={styles.description}>{product.description || "Descripción no disponible."}</Text>
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

      <Button title="Comprar" onPress={handleBuy} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  card: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.primary,
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
