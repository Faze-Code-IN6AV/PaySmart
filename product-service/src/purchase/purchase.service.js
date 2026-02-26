'use strict'

import Purchase from './purchase.model.js';
import Product from '../product/product.model.js';
import { randomUUID } from 'crypto';

export const createPurchase = async (data, user) => {

  const { product, quantity } = data;

  if (!product || !quantity || quantity <= 0) {
    throw new Error('Datos inválidos');
  }

  const productExists = await Product.findById(product);

  if (!productExists || productExists.status !== 'ACTIVO') {
    throw new Error('Producto no disponible');
  }

  const unitPrice = productExists.price;
  const amount = unitPrice * quantity;

  const purchase = new Purchase({
    product,
    userId: user.id,
    quantity,
    unitPrice,
    amount,
    currency: productExists.currency,
    status: 'COMPLETED',
    transactionId: randomUUID()
  });

  return await purchase.save();
};

export const getPurchases = async () => {
  return await Purchase.find()
    .populate('product')
    .sort({ createdAt: -1 });
};

export const getMyPurchases = async (userId) => {
  return await Purchase.find({ userId })
    .populate('product')
    .sort({ createdAt: -1 });
};

export const getPurchaseById = async (id) => {
  return await Purchase.findById(id)
    .populate('product');
};