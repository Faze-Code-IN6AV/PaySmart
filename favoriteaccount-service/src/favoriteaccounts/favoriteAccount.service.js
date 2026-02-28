import axios from 'axios';
import FavoriteAccount from './favoriteAccount.model.js';

export const addFavoriteAccount = async (userId, data, token) => {
  const { accountNumber, alias } = data;

  // Validar cuenta en Account Service
  await axios.get(
    `${process.env.ACCOUNT_SERVICE_URL}/${accountNumber}/balance`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return await FavoriteAccount.create({
    userId,
    accountNumber,
    alias
  });
};

export const getFavoritesByUser = async (userId) => {
  return await FavoriteAccount.find({
    userId,
    isDeleted: false
  });
};

export const updateFavorite = async (id, userId, alias) => {
  const updated = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { alias },
    { new: true }
  );

  if (!updated) {
    throw new Error('Cuenta favorita no encontrada');
  }

  return updated;
};

export const deleteFavorite = async (id, userId) => {
  const deleted = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!deleted) {
    throw new Error('Cuenta favorita no encontrada');
  }

  return deleted;
};

export const toggleFavoriteStatus = async (id, userId, status) => {
  const favorite = await FavoriteAccount.findOneAndUpdate(
    { _id: id, userId },
    { isDeleted: status },
    { new: true }
  );

  if (!favorite) {
    throw new Error('Cuenta favorita no encontrada');
  }

  return favorite;
};