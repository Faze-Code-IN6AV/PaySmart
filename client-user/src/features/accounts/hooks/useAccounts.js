// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/accounts/hooks/useAccounts.js
import { useCallback, useState } from "react";

import accountClient from "../../../shared/api/accountClient";

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await accountClient.get("/account");
      const data = response?.data?.data || response?.data || [];
      setAccounts(Array.isArray(data) ? data : data.accounts || []);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las cuentas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await accountClient.post("/account", {
        accountType: values.accountType,
        balance: Number(values.balance),
        currency: "GTQ",
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la cuenta.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBalance = useCallback(async (accountNumber) => {
    setLoading(true);
    setError("");

    try {
      const response = await accountClient.get(`/account/${accountNumber}/balance`);
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo consultar el saldo.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    createAccount,
    getBalance,
  };
}
