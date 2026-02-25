'use strict';

import axios from 'axios';
import Transaction, { TRANSACTION_TYPES } from './transaction.model.js';

// URL base de account-service
const ACCOUNT_SERVICE_URL = 'http://localhost:3021/paySmart/v1/account';
const MAX_TRANSFER_PER_TRANSACTION = 2000;
const MAX_DAILY_TRANSFER = 10000;

/* =========================
   DEPOSITO
========================= */
export const deposit = async (accountNumber, amount, description = '') => {
    // 1️⃣ Obtener balance de la cuenta
    const accountResponse = await axios.get(
        `${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`
    );

    const account = accountResponse.data; // directo, como tu internal endpoint devuelve
    if (!account) throw new Error('Cuenta no encontrada');

    const previousBalance = account.balance;
    const newBalance = previousBalance + amount;

    // 2️⃣ Actualizar saldo en account-service
    await axios.patch(
        `${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`,
        { amount, type: TRANSACTION_TYPES.DEPOSIT }
    );

    // 3️⃣ Guardar transacción en transaction DB
    const transaction = await Transaction.create({
        accountId: account._id,
        accountNumber: account.accountNumber,
        type: TRANSACTION_TYPES.DEPOSIT,
        amount,
        previousBalance,
        newBalance,
        description
    });

    return transaction;
};

/* =========================
   REVERSIÓN (< 1 MIN)
========================= */
export const reverseDeposit = async (transactionId, accountNumber, userRole, createdAt) => {
    // Revisar tiempo de reversión
    const diffSeconds = (new Date() - new Date(createdAt)) / 1000;
    if (diffSeconds > 60) throw new Error('Tiempo de reversión expirado');

    // Obtener balance actual
    const accountResponse = await axios.get(
        `${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`
    );

    const account = accountResponse.data;
    if (!account) throw new Error('Cuenta no encontrada');

    const previousBalance = account.balance;
    const newBalance = previousBalance - account.amount;
    if (newBalance < 0) throw new Error('Saldo insuficiente para revertir');

    // Actualizar saldo
    await axios.patch(
        `${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`,
        { amount: -account.amount, type: TRANSACTION_TYPES.WITHDRAW }
    );

    // Actualizar transacción en DB
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transacción no encontrada');

    transaction.status = 'REVERTIDA';
    await transaction.save();

    return { message: 'Depósito revertido correctamente' };
};

export const transfer = async (fromAccountNumber, toAccountNumber, amount, description = '') => {

    if (amount > MAX_TRANSFER_PER_TRANSACTION) {
        throw new Error('Excede el límite por transacción');
    }

    // 1️⃣ Obtener cuentas
    const fromResponse = await axios.get(
        `${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`
    );

    const toResponse = await axios.get(
        `${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`
    );

    const fromAccount = fromResponse.data;
    const toAccount = toResponse.data;

    if (!fromAccount || !toAccount) {
        throw new Error('Cuenta no encontrada');
    }

    if (fromAccount.balance < amount) {
        throw new Error('Saldo insuficiente');
    }

    // 2️⃣ Validar límite diario
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const dailyTotal = await Transaction.aggregate([
        {
            $match: {
                accountId: fromAccount._id,
                type: TRANSACTION_TYPES.TRANSFER,
                createdAt: { $gte: startOfDay }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]);

    const totalToday = dailyTotal[0]?.total || 0;

    if ((totalToday + amount) > MAX_DAILY_TRANSFER) {
        throw new Error('Excede el límite diario');
    }

    // 3️⃣ Actualizar saldos
    await axios.patch(
        `${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`,
        { amount: amount, type: TRANSACTION_TYPES.WITHDRAW }
    );

    await axios.patch(
        `${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`,
        { amount: amount, type: TRANSACTION_TYPES.DEPOSIT }
    );

    // 4️⃣ Guardar transacción
    const transaction = await Transaction.create({
        accountId: fromAccount._id,
        accountNumber: fromAccount.accountNumber,
        toAccountNumber: toAccount.accountNumber,
        type: TRANSACTION_TYPES.TRANSFER,
        amount,
        previousBalance: fromAccount.balance,
        newBalance: fromAccount.balance - amount,
        description
    });

    return transaction;
};