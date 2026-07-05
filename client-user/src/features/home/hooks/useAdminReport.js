// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/home/hooks/useAdminReport.js
import { useCallback, useState } from "react";

import transactionClient from "../../../shared/api/transactionClient";

// Réplica de reportStore.js / useReport.js (client-admin) para el panel de
// administración dentro de la pestaña de Inicio en la app móvil.
export function useAdminReport() {
  const [accountsMostMovements, setAccountsMostMovements] = useState([]);
  const [accountsAdminOverview, setAccountsAdminOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAccountsMostMovements = useCallback(async ({ order = "desc", limit = 10 } = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await transactionClient.get("/transaction/internal/stats/accounts-most-movements", {
        params: { order, limit },
      });
      const data = response?.data?.report ?? [];
      setAccountsMostMovements(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al obtener el reporte de movimientos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountsAdminOverview = useCallback(async ({ limit = 5 } = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await transactionClient.get("/transaction/internal/admin/accounts-overview", {
        params: { limit },
      });
      const data = response?.data?.report ?? null;
      setAccountsAdminOverview(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al obtener el resumen de cuentas.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accountsMostMovements,
    accountsAdminOverview,
    loading,
    error,
    fetchAccountsMostMovements,
    fetchAccountsAdminOverview,
  };
}