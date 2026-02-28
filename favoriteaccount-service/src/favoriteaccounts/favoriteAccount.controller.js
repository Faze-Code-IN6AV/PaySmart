import {
  addFavoriteAccount,
  getFavoritesByUser,
  updateFavorite,
  deleteFavorite
} from './favoriteAccount.service.js';

import { toggleFavoriteStatus } from './favoriteAccount.service.js';

export const createFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.token;

    const favorite = await addFavoriteAccount(
      userId,
      req.body,
      token
    );

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

export const deactivateFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await toggleFavoriteStatus(id, userId, true);

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

export const activateFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await toggleFavoriteStatus(id, userId, false);

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