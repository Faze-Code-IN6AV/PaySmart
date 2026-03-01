import { addFavoriteAccount,getFavoritesByUser, updateFavorite, deleteFavorite, toggleFavoriteStatus, transferToFavorite } from './favoriteAccount.service.js';

// POST /favoriteAccounts - Agregar cuenta favorita
export const createFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.token;

    const favorite = await addFavoriteAccount(userId, req.body, token);

    res.status(201).json({
      success: true,
      favorite
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
};

// GET /favoriteAccounts - Listar cuentas favoritas del usuario
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await getFavoritesByUser(userId);

    res.json({
      success: true,
      favorites
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT /favoriteAccounts/:id - Editar alias de cuenta favorita
export const editFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { alias } = req.body;

    const updated = await updateFavorite(id, userId, alias);

    res.json({
      success: true,
      updated
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /favoriteAccounts/:id - Eliminar cuenta favorita (soft-delete)
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await deleteFavorite(id, userId);

    res.json({
      success: true,
      message: 'Cuenta favorita eliminada'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// PATCH /favoriteAccounts/:id/deactivate - Desactivar cuenta favorita
export const deactivateFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await toggleFavoriteStatus(id, userId, false);

    res.json({
      success: true,
      message: 'Cuenta favorita desactivada',
      updated
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// PATCH /favoriteAccounts/:id/activate - Activar cuenta favorita
export const activateFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await toggleFavoriteStatus(id, userId, true);

    res.json({
      success: true,
      message: 'Cuenta favorita activada',
      updated
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// POST /favoriteAccounts/:id/transfer - Transferencia rápida a favorita
export const quickTransfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.token;
    const { id } = req.params;
    const { fromAccountNumber, amount, description } = req.body;

    const result = await transferToFavorite(
      id,
      userId,
      fromAccountNumber,
      amount,
      description,
      token
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
};