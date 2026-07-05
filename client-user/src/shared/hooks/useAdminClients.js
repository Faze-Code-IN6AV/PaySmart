// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/hooks/useAdminClients.js
import { useCallback, useState } from "react";

import adminClient from "../api/adminClient";

// Réplica de AdminClientsPage.jsx (client-admin): listar, crear, editar,
// dar de baja y reactivar clientes — solo para ADMIN_ROLE.
export function useAdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminClient.get("/users/clients");
      const data = response?.data?.data || response?.data || [];
      setClients(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los clientes.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (values) => {
    setLoading(true);
    setError("");
    try {
      await adminClient.post("/auth/admin/create-client", {
        ...values,
        monthlyIncome: Number(values.monthlyIncome),
      });
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || "Error al crear el cliente.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (userId, values) => {
    setLoading(true);
    setError("");
    try {
      await adminClient.put(`/users/clients/${userId}`, values);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || "Error al actualizar el cliente.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateClient = useCallback(async (userId) => {
    try {
      await adminClient.delete(`/users/clients/${userId}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  const reactivateClient = useCallback(async (userId) => {
    try {
      await adminClient.patch(`/users/clients/${userId}/reactivate`);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    loadClients,
    createClient,
    updateClient,
    deactivateClient,
    reactivateClient,
  };
}