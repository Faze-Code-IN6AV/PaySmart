// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/profile/ProfileScreen.jsx
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../shared/components/common/Button";
import { Card, LoadingSpinner } from "../../shared/components/common/Common";
import { Input } from "../../shared/components/common/Input";
import { COLORS, FONT_SIZE, SPACING } from "../../shared/constants/theme";
import authClient from "../../shared/api/authClient";
import { useAuthStore } from "../../shared/store/authStore";

export function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
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

  useEffect(() => {
    const loadProfile = async () => {
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
    };

    loadProfile();
  }, [reset, updateUser]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Image source={require("../../../assets/avatarDefault.png")} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{profile?.name || "Usuario"}</Text>
            <Text style={styles.subtitle}>{profile?.email || "Correo no disponible"}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button title={editing ? "Cancelar" : "Editar"} variant="secondary" onPress={() => setEditing((value) => !value)} />
          {editing ? <Button title="Guardar" onPress={handleSubmit(onSubmit)} loading={loading} /> : null}
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
            <Input label="Trabajo" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.workName?.message} />
          )}
        />

        <Controller
          control={control}
          name="monthlyIncome"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Ingreso mensual" keyboardType="numeric" value={value} onChangeText={onChange} onBlur={onBlur} editable={editing} error={errors.monthlyIncome?.message} />
          )}
        />
      </Card>

      <Button title="Cerrar sesión" variant="secondary" onPress={handleLogout} />
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
  card: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
});
