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
    adminCreateAccountForUser as adminCreateAccountForUserRequest,
} from '../../../shared/api';
import { getAllClients } from '../../../shared/api/admin';
import { showError, showSuccess, showWarning } from '../../../shared/utils/toast.js';

export const useAccountStore = create((set, get) => ({
    accounts: [],
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,
    // Cliente encontrado por búsqueda (para el admin)
    foundClient: null,

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

    // Buscar cliente por email, username o DPI (ADMIN_ROLE)
    searchClient: async (query) => {
        try {
            set({ searchLoading: true, searchResults: [], foundClient: null });

            // Traer todos los clientes y filtrar localmente por email, username o DPI
            const res = await getAllClients();
            const allClients = res.data?.data ?? res.data ?? [];
            const q = query.trim().toLowerCase();

            const match = allClients.find(
                (c) =>
                    c.email?.toLowerCase() === q ||
                    c.username?.toLowerCase() === q ||
                    c.dpi === query.trim()
            );

            if (!match) {
                set({ searchLoading: false, searchResults: [], foundClient: null });
                showWarning('No se encontró ningún cliente con ese dato');
                return { success: false };
            }

            // Mostrar el cliente encontrado inmediatamente
            set({ foundClient: match });

            // Intentar cargar sus cuentas — si no tiene, simplemente lista vacía
            try {
                const { data } = await getAccountsByEmailRequest(match.email);
                set({
                    searchResults: data.data ?? [],
                    searchLoading: false,
                });
            } catch {
                // Cliente sin cuentas aún — no es un error, solo lista vacía
                set({ searchResults: [], searchLoading: false });
            }

            return { success: true, client: match };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al buscar cliente';
            set({ searchLoading: false, searchResults: [], foundClient: null });
            showError(message);
            return { success: false, error: message };
        }
    },

    // [ADMIN] Crear cuenta bancaria para el cliente encontrado
    adminCreateForUser: async ({ userId, email, accountType }) => {
        try {
            const { data } = await adminCreateAccountForUserRequest({ userId, email, accountType });
            // Refrescar las cuentas del cliente tras crear
            const accountsRes = await getAccountsByEmailRequest(email);
            set({ searchResults: accountsRes.data?.data ?? [] });
            showSuccess(data.message || 'Cuenta creada exitosamente');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al crear la cuenta';
            showError(message);
            return { success: false, error: message };
        }
    },

    // GET cuentas por email (ADMIN_ROLE) — mantener para compatibilidad
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

    clearSearch: () => set({ searchResults: [], foundClient: null }),
    clearError: () => set({ error: null }),
}));