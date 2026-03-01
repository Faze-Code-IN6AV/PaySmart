import axios from 'axios';
import FavoriteAccount from './favoriteAccount.model.js';

// Agregar una cuenta favorita validando que exista en el AccountService
export const addFavoriteAccount = async (userId, data, token) => {
  const { accountNumber, alias } = data;

  // Validar que la cuenta exista en Account Service
  await axios.get(
    `${process.env.ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`
  );

  return await FavoriteAccount.create({
    userId,
    accountNumber,
    alias
  });
};

// Obtener todas las cuentas favoritas activas y no eliminadas del usuario
export const getFavoritesByUser = async (userId) => {
  return await FavoriteAccount.find({
    userId,
    isDeleted: false
  });
};

// Actualizar el alias de una cuenta favorita
export const updateFavorite = async (id, userId, alias) => {
  const updated = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { alias },
    { new: true }
  );

  if (!updated) throw new Error('Cuenta favorita no encontrada');

  return updated;
};

// Soft-delete de una cuenta favorita
export const deleteFavorite = async (id, userId) => {
  const deleted = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!deleted) throw new Error('Cuenta favorita no encontrada');

  return deleted;
};

// Activar o desactivar una cuenta favorita (sin eliminarla)
export const toggleFavoriteStatus = async (id, userId, isActive) => {
  const favorite = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { isActive },
    { new: true }
  );

  if (!favorite) throw new Error('Cuenta favorita no encontrada');

  return favorite;
};

// Transferencia rápida a una cuenta favorita via TransactionService
export const transferToFavorite = async (
  favoriteId,
  userId,
  fromAccountNumber,
  amount,
  description,
  token
) => {
  const favorite = await FavoriteAccount.findOne({
    _id: favoriteId,
    userId,
    isDeleted: false,
    isActive: true
  });

  if (!favorite) throw new Error('Cuenta favorita no encontrada o inactiva');

  const response = await axios.post(
    `${process.env.TRANSACTION_SERVICE_URL}/transfer`,
    {
      fromAccountNumber,
      toAccountNumber: favorite.accountNumber,
      amount,
      description
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return response.data;
};