// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/profile/ProfileScreen.jsx
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../shared/components/common/Common";
import { Input } from "../../shared/components/common/Input";
import { ScreenBackground } from "../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../shared/constants/theme";
import { formatCurrency } from "../../shared/utils/format";
import authClient from "../../shared/api/authClient";
import { useAuthStore } from "../../shared/store/authStore";
import { useAccounts } from "../accounts/hooks/useAccounts";

const STATUS_COLOR = {
  ACTIVO: COLORS.primary,
  SUSPENDIDO: COLORS.secondary,
  CERRADO: "#fca5a5",
};

// Réplica de AccountStats en EditMyProfilePage.jsx (client-admin)
function AccountStats({ accounts }) {
  if (!accounts?.length) return null;

  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const activeCount = accounts.filter((a) => a.status === "ACTIVO").length;

  return (
    <Card style={styles.statsCard}>
      <Text style={styles.sectionHeading}>RESUMEN DE CUENTAS</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialIcons name="credit-card" size={18} color={COLORS.primary} />
          <View>
            <Text style={styles.statLabel}>Saldo total</Text>
            <Text style={styles.statValue}>Q{formatCurrency(totalBalance)}</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <MaterialIcons name="check-circle" size={18} color={COLORS.secondary} />
          <View>
            <Text style={styles.statLabel}>Cuentas activas</Text>
            <Text style={styles.statValue}>
              {activeCount} de {accounts.length}
            </Text>
          </View>
        </View>
      </View>

      {accounts.map((acc) => (
        <View key={acc._id || acc.accountNumber} style={styles.accountRow}>
          <View style={styles.accountRowLeft}>
            <MaterialIcons name="credit-card" size={16} color={COLORS.primary} />
            <View>
              <Text style={styles.accountRowType}>{acc.accountType}</Text>
              <Text style={styles.accountRowNumber}>...{String(acc.accountNumber).slice(-4)}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.accountRowBalance}>Q{formatCurrency(acc.balance)}</Text>
            <Text style={[styles.accountRowStatus, { color: STATUS_COLOR[acc.status] || COLORS.primary }]}>
              {acc.status}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

export function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const { accounts, loadAccounts } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: profile?.name || "",
      surname: profile?.surname || "",
      address: profile?.address || "",
      workName: profile?.workName || "",
      monthlyIncome: profile?.monthlyIncome?.toString() || "",
    },
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authClient.get("/profile");
      const data = response?.data?.data || response?.data || {};
      setProfile(data);
      updateUser(data);
      reset({
        name: data?.name || "",
        surname: data?.surname || "",
        address: data?.address || "",
        workName: data?.workName || "",
        monthlyIncome: data?.monthlyIncome?.toString() || "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAccounts();
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadAccounts();
    loadProfile();
  };

  const onSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await authClient.put("/profile", {
        name: values.name,
        surname: values.surname,
        address: values.address,
        workName: values.workName,
        monthlyIncome: Number(values.monthlyIncome),
      });
      const data = response?.data?.data || response?.data || values;
      setProfile(data);
      await updateUser(data);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Desea salir de la aplicación?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Aceptar", onPress: async () => { await logout(); } },
    ]);
  };

  if (loading && !profile) {
    return <LoadingSpinner label="Cargando perfil..." />;
  }

  const src = profile || user || {};
  const fixedFields = [
    { label: "Username", value: src.username },
    { label: "Correo", value: src.email },
    { label: "DPI", value: src.dpi },
    { label: "Teléfono", value: src.phone },
  ];

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Información fija */}
        <Card style={styles.card}>
          <View style={styles.fixedHeaderRow}>
            <MaterialIcons name="lock" size={14} color="rgba(255,255,255,0.3)" />
            <Text style={styles.sectionHeadingMuted}>INFORMACIÓN FIJA</Text>
          </View>
          {fixedFields.map(({ label, value }) => (
            <View key={label} style={styles.fixedField}>
              <Text style={styles.fixedLabel}>{label}</Text>
              <View style={styles.fixedValueBox}>
                <Text style={styles.fixedValueText}>{value || "—"}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.fixedNote}>Para cambiar estos datos, comunícate con el banco.</Text>
        </Card>

        {/* Datos editables */}
        <Card style={styles.card}>
          <View style={styles.editableHeaderRow}>
            <View style={styles.fixedHeaderRow}>
              <MaterialIcons name="edit" size={14} color={COLORS.primary} />
              <Text style={styles.sectionHeading}>DATOS EDITABLES</Text>
            </View>
            {!editing ? (
              <Button title="Editar" variant="secondary" onPress={() => setEditing(true)} />
            ) : null}
          </View>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Nombre" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="surname"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Apellido" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.surname?.message} />
            )}
          />
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Dirección" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.address?.message} />
            )}
          />
          <Controller
            control={control}
            name="workName"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Nombre de trabajo" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.workName?.message} />
            )}
          />
          <Controller
            control={control}
            name="monthlyIncome"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Ingresos mensuales" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.monthlyIncome?.message} />
            )}
          />

          {editing ? (
            <View style={styles.editActions}>
              <Button title="Cancelar" variant="secondary" onPress={() => setEditing(false)} />
              <Button title="Guardar" onPress={handleSubmit(onSubmit)} loading={loading} />
            </View>
          ) : null}
        </Card>

        <AccountStats accounts={accounts} />

        <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} />
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
    gap: SPACING.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.text,
  },
  card: {
    gap: SPACING.sm,
  },
  fixedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.xs,
  },
  editableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeading: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionHeadingMuted: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  fixedField: {
    marginBottom: SPACING.xs,
  },
  fixedLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  fixedValueBox: {
    backgroundColor: "rgba(11,24,48,0.4)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.06)",
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  fixedValueText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FONT_SIZE.sm,
  },
  fixedNote: {
    color: "rgba(255,255,255,0.3)",
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(65,210,242,0.06)",
    paddingTop: SPACING.sm,
  },
  editActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: "#fca5a5",
  },
  statsCard: {
    gap: SPACING.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(65,210,242,0.08)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    borderRadius: 12,
    padding: SPACING.sm,
  },
  statLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: FONT_SIZE.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(11,24,48,0.4)",
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.08)",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  accountRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  accountRowType: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  accountRowNumber: {
    color: "rgba(255,255,255,0.35)",
    fontSize: FONT_SIZE.xs,
  },
  accountRowBalance: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
  },
  accountRowStatus: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
});