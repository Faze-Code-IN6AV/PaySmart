// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/favorites/screens/FavoritesScreen.jsx
import { useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { Card, EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useFavorites } from "../hooks/useFavorites";

export function FavoritesScreen() {
  const navigation = useNavigation();
  const { favorites, loading, error, loadFavorites, removeFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggle = async (favorite) => {
    const result = await toggleFavorite(favorite.id, favorite.active);
    if (result) {
      loadFavorites();
    }
  };

  const handleDelete = async (id) => {
    const result = await removeFavorite(id);
    if (result) {
      loadFavorites();
    }
  };

  if (loading && !favorites.length) {
    return <LoadingSpinner label="Cargando favoritos..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Favoritos</Text>
        <Button title="Agregar" variant="secondary" onPress={() => navigation.navigate("AddFavorite")} />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!favorites.length && !error ? <EmptyState title="Sin favoritos" description="Agrega cuentas frecuentes para transferencias rápidas." /> : null}

      {favorites.map((favorite) => (
        <Card key={favorite.id} style={styles.card}>
          <Text style={styles.cardTitle}>{favorite.alias || favorite.accountNumber}</Text>
          <Text style={styles.cardSubtitle}>{favorite.accountNumber}</Text>
          <Text style={styles.status}>{favorite.active ? "Activo" : "Inactivo"}</Text>
          <View style={styles.actions}>
            <Button title={favorite.active ? "Desactivar" : "Activar"} variant="secondary" onPress={() => handleToggle(favorite)} />
            <Button title="Transferir" onPress={() => Alert.alert("Próximamente", "Transferencia rápida en desarrollo.")} />
          </View>
          <Button title="Eliminar" variant="secondary" onPress={() => handleDelete(favorite.id)} />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
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
  status: {
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
