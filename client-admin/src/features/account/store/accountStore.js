import { create } from 'zustand';
import {
    createAccount as createAccountRequest,
    getMyAccounts as getMyAccountsRequest,
    getAccountBalance as getAccountBalanceRequest,
    getBalanceInternal as getBalanceInternalRequest,
    updateBalanceInternal as updateBalanceInternalRequest,
    getAccountsByEmail as getAccountsByEmailRequest,
    suspendAccount as suspendAccountRequest,
    activateAccount as activateAccountRequest,
    deactivateAccount as deactivateAccountRequest,
} from '../../../shared/api';
import { showError, showSuccess, showWarning } from '../../../shared/utils/toast.js';

export const useAccountStore = create((set) => ({
    accounts: [],
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,

    // GET mis cuentas — filtra las CERRADAS para el usuario
    fetchAccounts: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getMyAccountsRequest();
            const active = (data.data ?? []).filter((a) => a.status !== 'CERRADO');
            set({ accounts: active, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener las cuentas';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    // POST crear cuenta
    createAccount: async ({ accountType, balance }) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createAccountRequest({ accountType, balance });
            set((state) => ({
                accounts: [...state.accounts, data.data],
                loading: false,
            }));
            showSuccess('¡Cuenta creada exitosamente!');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Error al crear la cuenta';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // GET saldo propio (USER_ROLE)
    getAccountBalance: async (accountNumber) => {
        try {
            const { data } = await getAccountBalanceRequest(accountNumber);
            return { success: true, data: data.data };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al consultar el saldo';
            showError(message);
            return { success: false, error: message };
        }
    },

    // GET saldo interno (ADMIN_ROLE)
    getBalanceInternal: async (accountNumber) => {
        try {
            const { data } = await getBalanceInternalRequest(accountNumber);
            return { success: true, data: data.data ?? data };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al consultar el saldo';
            showError(message);
            return { success: false, error: message };
        }
    },

    // PATCH actualizar saldo (microservicios)
    updateBalance: async (accountNumber, { amount, type }) => {
        try {
            await updateBalanceInternalRequest(accountNumber, { amount, type });
            showSuccess('Saldo actualizado correctamente');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al actualizar el saldo';
            showError(message);
            return { success: false, error: message };
        }
    },

    // GET cuentas por email (ADMIN_ROLE)
    searchByEmail: async (email) => {
        try {
            set({ searchLoading: true, searchResults: [] });
            const { data } = await getAccountsByEmailRequest(email);
            set({ searchResults: data.data ?? [], searchLoading: false });
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'No se encontraron cuentas para ese correo';
            set({ searchLoading: false, searchResults: [] });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PATCH suspender cuenta (ADMIN_ROLE)
    suspendAccount: async (accountNumber) => {
        try {
            await suspendAccountRequest(accountNumber);
            set((state) => ({
                searchResults: state.searchResults.map((a) =>
                    a.accountNumber === accountNumber ? { ...a, status: 'SUSPENDIDO' } : a
                ),
            }));
            showSuccess('Cuenta suspendida exitosamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al suspender la cuenta';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PATCH activar cuenta (ADMIN_ROLE)
    activateAccount: async (accountNumber) => {
        try {
            await activateAccountRequest(accountNumber);
            set((state) => ({
                searchResults: state.searchResults.map((a) =>
                    a.accountNumber === accountNumber ? { ...a, status: 'ACTIVO' } : a
                ),
            }));
            showSuccess('Cuenta activada exitosamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al activar la cuenta';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PATCH cerrar/eliminar cuenta (ADMIN_ROLE)
    deactivateAccount: async (accountNumber) => {
        try {
            await deactivateAccountRequest(accountNumber);
            set((state) => ({
                searchResults: state.searchResults.map((a) =>
                    a.accountNumber === accountNumber ? { ...a, status: 'CERRADO' } : a
                ),
            }));
            showSuccess('Cuenta cerrada exitosamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al cerrar la cuenta';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    clearSearch: () => set({ searchResults: [] }),
    clearError: () => set({ error: null }),
}));