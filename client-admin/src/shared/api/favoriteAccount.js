import { axiosFavorite } from './api';

const BASE = 'favoriteAccounts';

// POST /favoriteAccounts — Agregar cuenta favorita
export const createFavoriteAccount = async ({ accountNumber, alias }) => {
    return await axiosFavorite.post(BASE, { accountNumber, alias });
};

// GET /favoriteAccounts — Listar cuentas favoritas del usuario
export const getFavoriteAccounts = async () => {
    return await axiosFavorite.get(BASE);
};

// PUT /favoriteAccounts/:id — Editar alias
export const updateFavoriteAccount = async (id, alias) => {
    return await axiosFavorite.put(`${BASE}/${id}`, { alias });
};

// DELETE /favoriteAccounts/:id — Eliminar (soft-delete)
export const deleteFavoriteAccount = async (id) => {
    return await axiosFavorite.delete(`${BASE}/${id}`);
};

// PATCH /favoriteAccounts/:id/activate — Activar
export const activateFavoriteAccount = async (id) => {
    return await axiosFavorite.patch(`${BASE}/${id}/activate`);
};

// PATCH /favoriteAccounts/:id/deactivate — Desactivar
export const deactivateFavoriteAccount = async (id) => {
    return await axiosFavorite.patch(`${BASE}/${id}/deactivate`);
};