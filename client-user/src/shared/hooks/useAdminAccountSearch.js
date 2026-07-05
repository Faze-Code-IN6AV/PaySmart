// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/hooks/useAdminAccountSearch.js
import { useCallback, useState } from "react";

import accountClient from "../api/accountClient";
import adminClient from "../api/adminClient";

// Réplica de accountStore.js (client-admin): búsqueda de clientes por
// correo/username/DPI y gestión de sus cuentas — usado tanto en la pestaña
// de Cuentas como en la de Transacciones cuando el usuario es ADMIN_ROLE.
export function useAdminAccountSearch() {
  const [foundClient, setFoundClient] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const searchClient = useCallback(async (query) => {
    setSearchLoading(true);
    setError("");
    setSearchResults([]);
    setFoundClient(null);

    try {
      const response = await adminClient.get("/users/clients");
      const allClients = response?.data?.data || response?.data || [];
      const q = query.trim().toLowerCase();

      const match = allClients.find(
        (c) =>
          c.email?.toLowerCase() === q ||
          c.username?.toLowerCase() === q ||
          c.dpi === query.trim()
      );

      if (!match) {
        setError("No se encontró ningún cliente con ese dato.");
        setSearchLoading(false);
        return null;
      }

      setFoundClient(match);

      try {
        const accountsRes = await accountClient.get(`/account/admin/user/${encodeURIComponent(match.email)}`);
        setSearchResults(accountsRes?.data?.data || []);
      } catch {
        setSearchResults([]);
      }

      setSearchLoading(false);
      return match;
    } catch (err) {
      setError(err?.response?.data?.message || "Error al buscar cliente.");
      setSearchLoading(false);
      return null;
    }
  }, []);

  const refreshResults = useCallback(async (email) => {
    try {
      const accountsRes = await accountClient.get(`/account/admin/user/${encodeURIComponent(email)}`);
      setSearchResults(accountsRes?.data?.data || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const adminCreateForUser = useCallback(
    async ({ userId, email, accountType }) => {
      try {
        await accountClient.post("/account/admin/create-for-user", { userId, email, accountType });
        await refreshResults(email);
        return { success: true };
      } catch (err) {
        return { success: false, error: err?.response?.data?.message || "Error al crear la cuenta." };
      }
    },
    [refreshResults]
  );

  const suspendAccount = useCallback(async (accountNumber) => {
    try {
      await accountClient.patch(`/account/admin/${accountNumber}/suspend`);
      setSearchResults((prev) => prev.map((a) => (a.accountNumber === accountNumber ? { ...a, status: "SUSPENDIDO" } : a)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const activateAccount = useCallback(async (accountNumber) => {
    try {
      await accountClient.patch(`/account/admin/${accountNumber}/activate`);
      setSearchResults((prev) => prev.map((a) => (a.accountNumber === accountNumber ? { ...a, status: "ACTIVO" } : a)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deactivateAccount = useCallback(async (accountNumber) => {
    try {
      await accountClient.patch(`/account/admin/${accountNumber}/deactivate`);
      setSearchResults((prev) => prev.map((a) => (a.accountNumber === accountNumber ? { ...a, status: "CERRADO" } : a)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearSearch = useCallback(() => {
    setFoundClient(null);
    setSearchResults([]);
    setError("");
  }, []);

  return {
    foundClient,
    searchResults,
    searchLoading,
    error,
    searchClient,
    adminCreateForUser,
    suspendAccount,
    activateAccount,
    deactivateAccount,
    clearSearch,
  };
}