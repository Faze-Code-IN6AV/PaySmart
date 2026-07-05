// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/favorites/hooks/useFavorites.js
import { useCallback, useState } from "react";

import favoriteClient from "../../../shared/api/favoriteClient";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await favoriteClient.get("/favoriteAccounts");
      // El backend responde { favorites: [...] }, no { data: [...] }.
      const data = response?.data?.favorites || response?.data?.data || response?.data || [];
      setFavorites(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los favoritos.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await favoriteClient.post("/favoriteAccounts", {
        accountNumber: values.accountNumber,
        alias: values.alias,
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo agregar el favorito.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFavorite = useCallback(async (id, alias) => {
    setLoading(true);
    setError("");

    try {
      const response = await favoriteClient.put(`/favoriteAccounts/${id}`, { alias });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el favorito.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = useCallback(async (id) => {
    setLoading(true);
    setError("");

    try {
      const response = await favoriteClient.delete(`/favoriteAccounts/${id}`);
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el favorito.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id, active) => {
    setLoading(true);
    setError("");

    try {
      const endpoint = active ? "/deactivate" : "/activate";
      const response = await favoriteClient.patch(`/favoriteAccounts/${id}${endpoint}`);
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cambiar el estado del favorito.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const quickTransfer = useCallback(async (id, values) => {
    setLoading(true);
    setError("");

    try {
      const response = await favoriteClient.post(`/favoriteAccounts/${id}/transfer`, {
        fromAccountNumber: values.fromAccountNumber,
        amount: Number(values.amount),
        description: values.description,
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo hacer la transferencia rápida.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    addFavorite,
    updateFavorite,
    removeFavorite,
    toggleFavorite,
    quickTransfer,
  };
}