// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/favorites/screens/FavoritesScreen.jsx
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../../../shared/components/common/Button";
import { EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { Input } from "../../../shared/components/common/Input";
import { MaskedAccountNumber } from "../../../shared/components/common/MaskedAccountNumber";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { useAccounts } from "../../accounts/hooks/useAccounts";
import { useFavorites } from "../hooks/useFavorites";

// Modal de transferencia rápida — equivalente a QuickTransferModal.jsx (client-admin)
function QuickTransferModal({ visible, favorite, accounts, onClose, onSubmit, loading, error }) {
  const [fromAccountNumber, setFromAccountNumber] = useState(accounts?.[0]?.accountNumber || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (visible) {
      setFromAccountNumber(accounts?.[0]?.accountNumber || "");
      setAmount("");
      setDescription("");
    }
  }, [visible, accounts]);

  if (!favorite) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Transferencia rápida</Text>
          <Text style={styles.modalSubtitle}>Para: {favorite.alias || favorite.accountNumber}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.fieldLabel}>Cuenta origen</Text>
          <View style={styles.accountPicker}>
            {(accounts || []).map((acc) => (
              <Pressable
                key={acc.accountNumber}
                style={[
                  styles.accountOption,
                  fromAccountNumber === acc.accountNumber ? styles.accountOptionActive : null,
                ]}
                onPress={() => setFromAccountNumber(acc.accountNumber)}
              >
                <Text
                  style={[
                    styles.accountOptionText,
                    fromAccountNumber === acc.accountNumber ? { color: COLORS.primary } : null,
                  ]}
                >
                  {acc.accountType} · ...{String(acc.accountNumber).slice(-4)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Monto" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0.00" />
          <Input label="Descripción (opcional)" value={description} onChangeText={setDescription} />

          <View style={styles.modalActions}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} />
            <Button
              title="Transferir"
              loading={loading}
              onPress={() => onSubmit({ fromAccountNumber, amount, description })}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FavoritesScreen() {
  const navigation = useNavigation();
  const { favorites, loading, error, loadFavorites, removeFavorite, toggleFavorite, quickTransfer } = useFavorites();
  const { accounts: allAccounts, loadAccounts } = useAccounts();
  // Las cuentas cerradas no se pueden usar como origen de una transferencia.
  const accounts = allAccounts.filter((a) => a.status !== "CERRADO");
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    loadFavorites();
    loadAccounts();
  }, [loadFavorites, loadAccounts]);

  const handleToggle = async (favorite) => {
    const result = await toggleFavorite(favorite._id, favorite.isActive);
    if (result) loadFavorites();
  };

  const handleDelete = async (id) => {
    const result = await removeFavorite(id);
    if (result) loadFavorites();
  };

  const handleQuickTransfer = async ({ fromAccountNumber, amount, description }) => {
    if (!fromAccountNumber) {
      setTransferError("Selecciona una cuenta origen.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setTransferError("Ingresa un monto válido.");
      return;
    }

    setTransferLoading(true);
    setTransferError("");
    const result = await quickTransfer(transferTarget._id, { fromAccountNumber, amount, description });
    setTransferLoading(false);

    if (result) {
      setTransferTarget(null);
      Alert.alert("Transferencia exitosa", "La transferencia rápida se realizó correctamente.");
    } else {
      setTransferError("No se pudo hacer la transferencia rápida.");
    }
  };

  if (loading && !favorites.length) {
    return <LoadingSpinner label="Cargando favoritos..." />;
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFavorites} tintColor={COLORS.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Favoritos</Text>
          <Button title="Agregar" variant="secondary" onPress={() => navigation.navigate("AddFavorite")} />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!favorites.length && !error ? (
          <EmptyState title="Sin favoritos" description="Agrega cuentas frecuentes para transferencias rápidas." />
        ) : null}

        {favorites.map((favorite) => (
          <View key={favorite._id} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <MaterialIcons
                  name={favorite.isActive ? "star" : "star-border"}
                  size={20}
                  color={favorite.isActive ? COLORS.secondary : "rgba(255,255,255,0.3)"}
                />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {favorite.alias || favorite.accountNumber}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: favorite.isActive ? "rgba(65,210,242,0.12)" : "rgba(255,255,255,0.06)" },
                ]}
              >
                <Text style={[styles.statusText, { color: favorite.isActive ? COLORS.primary : "rgba(255,255,255,0.35)" }]}>
                  {favorite.isActive ? "Activa" : "Inactiva"}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Número de cuenta</Text>
            <MaskedAccountNumber accountNumber={favorite.accountNumber} />

            <View style={styles.actions}>
              <Button
                title={favorite.isActive ? "Desactivar" : "Activar"}
                variant="secondary"
                onPress={() => handleToggle(favorite)}
              />
              {favorite.isActive ? (
                <Button
                  title="Transferir"
                  onPress={() => {
                    setTransferError("");
                    setTransferTarget(favorite);
                  }}
                />
              ) : null}
            </View>
            <Button title="Eliminar" variant="secondary" onPress={() => handleDelete(favorite._id)} />
          </View>
        ))}
      </ScrollView>

      <QuickTransferModal
        visible={!!transferTarget}
        favorite={transferTarget}
        accounts={accounts}
        loading={transferLoading}
        error={transferError}
        onClose={() => setTransferTarget(null)}
        onSubmit={handleQuickTransfer}
      />
    </ScreenBackground>
  );
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
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
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
    flexShrink: 1,
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
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: "#fca5a5",
    marginBottom: SPACING.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,24,48,0.85)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.25)",
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  accountPicker: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  accountOption: {
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.25)",
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  accountOptionActive: {
    backgroundColor: "rgba(65,210,242,0.1)",
    borderColor: COLORS.primary,
  },
  accountOptionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONT_SIZE.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
});