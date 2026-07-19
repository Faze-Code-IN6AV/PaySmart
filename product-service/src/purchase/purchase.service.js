'use strict'

import axios from 'axios';
import Purchase from './purchase.model.js';
import Product from '../product/product.model.js';

const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002/paySmart/v1/transaction';

export const createPurchase = async (data, user, authHeader) => {
  const { product, quantity, fromAccountNumber } = data;

  if (!product || !quantity || quantity <= 0) {
    throw new Error('Datos inválidos');
  }

  // 1) Validar producto
  const productExists = await Product.findById(product);
  if (!productExists || productExists.status !== 'ACTIVO') {
    throw new Error('Producto no disponible');
  }

  // (Opcional recomendado) validar stock
  if (productExists.stock != null && productExists.stock < quantity) {
    throw new Error('Stock insuficiente');
  }

  // 2) Calcular total
  const unitPrice = productExists.price;
  const amount = unitPrice * quantity;

  // 3) Validar que venga cuenta origen
  if (!fromAccountNumber) {
    throw new Error('Debe proporcionar fromAccountNumber para pagar la compra');
  }

  // 4) Ejecutar transferencia (PAGO)
  // Reenvía el token porque /transfer tiene middleware JWT
  const transferResponse = await axios.post(
    `${TRANSACTION_SERVICE_URL}/purchase`,
    {
      accountNumber: fromAccountNumber,
      amount,
      description: `Compra de producto ${productExists.name || productExists._id}`
    },
    {
      headers: { Authorization: authHeader }
    }
  );

  const transaction = transferResponse.data?.transaction;
  if (!transaction) {
    throw new Error('No se pudo generar la transferencia');
  }
  if (transaction.status === 'REVERTIDA') {
    throw new Error('La transferencia fue revertida');
  }

  // 5) (Opcional) descontar stock luego de pagar
  if (productExists.stock != null) {
    productExists.stock -= quantity;
    await productExists.save();
  }

  // 6) Guardar purchase con transactionId real
  const purchase = new Purchase({
    product,
    userId: user.id,
    quantity,
    unitPrice,
    amount,
    currency: productExists.currency,
    status: 'COMPLETED',
    transactionId: transaction._id
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