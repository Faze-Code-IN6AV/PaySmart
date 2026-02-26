'use strict'

import * as purchaseService from './purchase.service.js';

export const create = async (req, res, next) => {
  try {

    const purchase = await purchaseService.createPurchase(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      purchase
    });

  } catch (err) {
    next(err);
  }
};

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

export const getMine = async (req, res, next) => {
  try {

    const purchases = await purchaseService.getMyPurchases(req.user.uid);

    return res.json({
      success: true,
      purchases
    });

  } catch (err) {
    next(err);
  }
};

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