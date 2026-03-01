'use strict'

import * as purchaseService from './purchase.service.js';

// POST /purchases - Crear una compra
export const create = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const purchase = await purchaseService.createPurchase(
      req.body,
      req.user,
      authHeader
    );

    return res.status(201).json({
      success: true,
      purchase
    });

  } catch (error) {
    console.log('ERROR PURCHASE:', error?.response?.data || error?.message || error);
    return res.status(400).json({
      success: false,
      message: error?.response?.data?.message || error?.message || 'Error desconocido'
    });
  }
};

// GET /purchases - Obtener todas las compras (Admin)
export const getAll = async (req, res, next) => {
  try {
    const purchases = await purchaseService.getPurchases();

    return res.json({
      success: true,
      purchases
    });

  } catch (err) {
    next(err);
  }
};

// GET /purchases/my - Obtener compras del usuario autenticado
export const getMine = async (req, res, next) => {
  try {
    // req.user.id viene del JWT, no uid
    const purchases = await purchaseService.getMyPurchases(req.user.id);

    return res.json({
      success: true,
      purchases
    });

  } catch (err) {
    next(err);
  }
};

// GET /purchases/:id - Obtener compra por ID (Admin)
export const getById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
    }

    return res.json({
      success: true,
      purchase
    });

  } catch (err) {
    next(err);
  }
};