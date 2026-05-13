import { create } from 'zustand';
import {
    createFavoriteAccount as createFavoriteRequest,
    getFavoriteAccounts as getFavoritesRequest,
    updateFavoriteAccount as updateFavoriteRequest,
    deleteFavoriteAccount as deleteFavoriteRequest,
    activateFavoriteAccount as activateFavoriteRequest,
    deactivateFavoriteAccount as deactivateFavoriteRequest,
} from '../../../shared/api';
import { showError, showSuccess, showWarning } from '../../../shared/utils/toast.js';

export const useFavoriteAccountStore = create((set) => ({
    favorites: [],
    loading: false,
    error: null,

    // GET — listar cuentas favoritas
    fetchFavorites: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getFavoritesRequest();
            set({ favorites: data.favorites ?? [], loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener las cuentas favoritas';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    // POST — agregar cuenta favorita
    createFavorite: async ({ accountNumber, alias }) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createFavoriteRequest({ accountNumber, alias });
            set((state) => ({
                favorites: [...state.favorites, data.favorite],
                loading: false,
            }));
            showSuccess('¡Cuenta favorita agregada!');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message ||
                'Error al agregar la cuenta favorita';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PUT — editar alias
    updateFavorite: async (id, alias) => {
        try {
            const { data } = await updateFavoriteRequest(id, alias);
            set((state) => ({
                favorites: state.favorites.map((f) =>
                    f._id === id ? data.updated : f
                ),
            }));
            showSuccess('Alias actualizado correctamente.');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message || 'Error al actualizar el alias';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // DELETE — eliminar (soft-delete)
    deleteFavorite: async (id) => {
        try {
            await deleteFavoriteRequest(id);
            set((state) => ({
                favorites: state.favorites.filter((f) => f._id !== id),
            }));
            showSuccess('Cuenta favorita eliminada.');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message || 'Error al eliminar la cuenta favorita';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PATCH — activar
    activateFavorite: async (id) => {
        try {
            const { data } = await activateFavoriteRequest(id);
            set((state) => ({
                favorites: state.favorites.map((f) =>
                    f._id === id ? data.updated : f
                ),
            }));
            showSuccess('Cuenta favorita activada.');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message || 'Error al activar la cuenta favorita';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    // PATCH — desactivar
    deactivateFavorite: async (id) => {
        try {
            const { data } = await deactivateFavoriteRequest(id);
            set((state) => ({
                favorites: state.favorites.map((f) =>
                    f._id === id ? data.updated : f
                ),
            }));
            showSuccess('Cuenta favorita desactivada.');
            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message || 'Error al desactivar la cuenta favorita';
            showWarning(message);
            return { success: false, error: message };
        }
    },

    clearError: () => set({ error: null }),
}));