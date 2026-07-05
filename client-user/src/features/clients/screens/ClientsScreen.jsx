// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/clients/screens/ClientsScreen.jsx
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Button } from "../../../shared/components/common/Button";
import { EmptyState, LoadingSpinner } from "../../../shared/components/common/Common";
import { Input } from "../../../shared/components/common/Input";
import { ScreenBackground } from "../../../shared/components/common/ScreenBackground";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import { formatCurrency } from "../../../shared/utils/format";
import { useAdminClients } from "../../../shared/hooks/useAdminClients";

function ClientCard({ client, onEdit, onView, onDeactivate, onReactivate }) {
  const isInactive = client.isDeleted || !client.status;

  return (
    <View style={[styles.card, isInactive ? styles.cardInactive : null]}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>
            {client.name} {client.surname}
          </Text>
          <Text style={styles.clientUsername}>@{client.username}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isInactive ? "rgba(239,68,68,0.12)" : "rgba(65,210,242,0.12)" }]}>
          <Text style={[styles.statusText, { color: isInactive ? "#fca5a5" : COLORS.primary }]}>
            {isInactive ? "Dado de baja" : "Activo"}
          </Text>
        </View>
      </View>

      <Text style={styles.clientMeta}>{client.email}</Text>
      <Text style={styles.clientMeta}>DPI: {client.dpi || "—"}</Text>
      <Text style={styles.clientIncome}>Ingresos: Q{formatCurrency(client.monthlyIncome)}</Text>

      <View style={styles.actionsRow}>
        <Button title="Ver" variant="secondary" onPress={() => onView(client)} />
        {isInactive ? (
          <Button title="Reactivar" onPress={() => onReactivate(client)} />
        ) : (
          <>
            <Button title="Editar" variant="secondary" onPress={() => onEdit(client)} />
            <Button title="Dar de baja" variant="secondary" onPress={() => onDeactivate(client)} />
          </>
        )}
      </View>
    </View>
  );
}

export function ClientsScreen() {
  const navigation = useNavigation();
  const { clients, loading, error, loadClients, deactivateClient, reactivateClient } = useAdminClients();
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? clients.filter((c) =>
        `${c.name} ${c.surname} ${c.username} ${c.email} ${c.dpi}`.toLowerCase().includes(q)
      )
    : clients;

  const handleView = (client) => {
    Alert.alert(
      `${client.name} ${client.surname}`,
      [
        `Username: ${client.username}`,
        `Email: ${client.email}`,
        `Teléfono: ${client.phone || "—"}`,
        `DPI: ${client.dpi || "—"}`,
        `Dirección: ${client.address || "—"}`,
        `Trabajo: ${client.workName || "—"}`,
        `Ingresos: Q${formatCurrency(client.monthlyIncome)}`,
        `Estado: ${client.isDeleted || !client.status ? "Dado de baja" : "Activo"}`,
      ].join("\n")
    );
  };

  const handleDeactivate = (client) => {
    Alert.alert("Dar de baja al cliente", `${client.username} quedará inactivo y no podrá iniciar sesión.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Dar de baja",
        style: "destructive",
        onPress: async () => {
          const ok = await deactivateClient(client.id);
          if (ok) loadClients();
        },
      },
    ]);
  };

  const handleReactivate = (client) => {
    Alert.alert("Reactivar cliente", `${client.username} podrá iniciar sesión nuevamente.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Reactivar",
        onPress: async () => {
          const ok = await reactivateClient(client.id);
          if (ok) loadClients();
        },
      },
    ]);
  };

  if (loading && !clients.length) {
    return <LoadingSpinner label="Cargando clientes..." />;
  }

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadClients} tintColor={COLORS.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de Clientes</Text>
          <Button title="Nuevo" onPress={() => navigation.navigate("ClientForm", { mode: "create" })} />
        </View>
        <Text style={styles.subtitle}>
          {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
        </Text>

        <Input
          placeholder="Buscar por nombre, username, email o DPI"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!filtered.length && !error ? (
          <EmptyState
            title={search ? "Sin resultados" : "Sin clientes"}
            description={search ? "No hay coincidencias para esa búsqueda." : "Aún no hay clientes registrados."}
          />
        ) : null}

        {filtered.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onView={handleView}
            onEdit={(c) => navigation.navigate("ClientForm", { mode: "edit", client: c })}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
        ))}
      </ScrollView>
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
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: "#fca5a5",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(65,210,242,0.15)",
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: 4,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clientName: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: FONT_SIZE.sm,
  },
  clientUsername: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  clientMeta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: FONT_SIZE.xs,
  },
  clientIncome: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    flexWrap: "wrap",
  },
});