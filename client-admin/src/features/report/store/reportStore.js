import { create } from 'zustand';
import {
    getAccountsMostMovements as getAccountsMostMovementsRequest,
    getAccountsAdminOverview as getAccountsAdminOverviewRequest,
} from '../../../shared/api/transaction.js';
import { showError } from '../../../shared/utils/toast.js';

export const useReportStore = create((set) => ({
    accountsMostMovements: [],
    accountsAdminOverview: null,
    loading: false,
    error: null,

    fetchAccountsMostMovements: async ({ order = 'desc', limit = 10 } = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getAccountsMostMovementsRequest({ order, limit });
            set({ accountsMostMovements: data.report ?? [], loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener el reporte de movimientos';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    fetchAccountsAdminOverview: async ({ limit = 5 } = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getAccountsAdminOverviewRequest({ limit });
            set({ accountsAdminOverview: data.report ?? null, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener el resumen de cuentas';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    clearError: () => set({ error: null }),
}));