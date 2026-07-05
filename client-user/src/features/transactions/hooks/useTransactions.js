// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/transactions/hooks/useTransactions.js
import { useCallback, useState } from "react";

import transactionClient from "../../../shared/api/transactionClient";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deposit = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionClient.post("/transaction/deposit", {
        accountNumber: values.accountNumber,
        amount: Number(values.amount),
        description: values.description,
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo realizar el depósito.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const transfer = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionClient.post("/transaction/transfer", {
        fromAccountNumber: values.fromAccountNumber,
        toAccountNumber: values.toAccountNumber,
        amount: Number(values.amount),
        description: values.description,
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo realizar la transferencia.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverse = useCallback(async (transactionId) => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionClient.put(`/transaction/reverse/${transactionId}`);
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo reversar la transacción.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (accountNumber) => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionClient.get(`/transaction/${accountNumber}`);
      // El backend responde { transactions: [...] }, no { data: [...] }.
      const data = response?.data?.transactions || response?.data?.data || response?.data || [];
      const normalized = Array.isArray(data) ? data : [];
      const mapped = normalized.map((item) => ({
        ...item,
        normalizedType: String(item?.type || "").toUpperCase(),
      }));
      setTransactions(mapped);
      return mapped;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar el historial.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // El backend responde { transactions: [...] } (hasta 5), igual que el
  // historial completo — no un solo objeto.
  const getLastTransaction = useCallback(async (accountNumber) => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionClient.get(`/transaction/${accountNumber}/last`);
      const data = response?.data?.transactions || response?.data?.data || response?.data || [];
      const normalized = Array.isArray(data) ? data : [];
      return normalized.map((item) => ({
        ...item,
        normalizedType: String(item?.type || "").toUpperCase(),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar la última transacción.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    deposit,
    transfer,
    reverse,
    loadHistory,
    getLastTransaction,
  };
}