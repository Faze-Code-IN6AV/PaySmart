'use strict';

import axios from 'axios';
import Transaction, { TRANSACTION_TYPES } from './transaction.model.js';
import nodemailer from 'nodemailer';
import { updateAccountBalance } from '../utils/accoutn.client.js';

// URL base de account-service
const ACCOUNT_SERVICE_URL = 'http://localhost:3021/paySmart/v1/account';
const MAX_TRANSFER_PER_TRANSACTION = 2000;
const MAX_DAILY_TRANSFER = 10000;

/* =========================
DEPOSITO
========================= */
export const deposit = async (accountNumber, amount, description = '') => {
    const accountResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;
    if (!account) throw new Error('Cuenta no encontrada');

    const previousBalance = account.balance;
    const newBalance = previousBalance + amount;

    await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
        amount,
        type: TRANSACTION_TYPES.DEPOSIT
    });

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
export const reverseDeposit = async (transactionId, accountNumber, userRole) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transacción no encontrada');
    if (transaction.type !== TRANSACTION_TYPES.DEPOSIT) throw new Error('Solo se pueden revertir depósitos');

    const diffSeconds = (new Date() - new Date(transaction.createdAt)) / 1000;
    if (diffSeconds > 60) throw new Error('Tiempo de reversión expirado');

    const accountResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;
    if (!account) throw new Error('Cuenta no encontrada');

    const previousBalance = account.balance;
    const newBalance = previousBalance - transaction.amount;
    if (newBalance < 0) throw new Error('Saldo insuficiente para revertir');

    await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
        amount: transaction.amount,
        type: TRANSACTION_TYPES.WITHDRAW
    });

    transaction.status = 'REVERTIDA';
    await transaction.save();

    return { message: 'Depósito revertido correctamente' };
};

/* =========================
TRANSFERENCIA
========================= */
export const transfer = async (fromAccountNumber, toAccountNumber, amount, description = '') => {
    amount = Number(amount);
    if (!amount || amount <= 0) throw new Error('Monto inválido');

    if (amount > MAX_TRANSFER_PER_TRANSACTION) throw new Error('Excede el límite por transacción');

    const fromResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`);
    const toResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`);

    const fromAccount = fromResponse.data;
    const toAccount = toResponse.data;
    if (!fromAccount || !toAccount) throw new Error('Cuenta no encontrada');
    if (fromAccount.balance < amount) throw new Error('Saldo insuficiente');

    // Validar límite diario
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyTotal = await Transaction.aggregate([
        { $match: { accountId: fromAccount._id, type: TRANSACTION_TYPES.TRANSFER, createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalToday = dailyTotal[0]?.total || 0;
    if ((totalToday + amount) > MAX_DAILY_TRANSFER) throw new Error('Excede el límite diario');

    // Actualizar saldos
    await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`, {
        amount,
        type: TRANSACTION_TYPES.WITHDRAW
    });

    try {
        await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`, {
            amount,
            type: TRANSACTION_TYPES.DEPOSIT
        });

    } catch (err) {

        await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`, {
            amount,
            type: TRANSACTION_TYPES.DEPOSIT
        });

        // Registrar transferencia revertida
        const revertedTransaction = await Transaction.create({
            accountId: fromAccount._id,
            accountNumber: fromAccount.accountNumber,
            toAccountNumber: toAccount.accountNumber,
            type: TRANSACTION_TYPES.TRANSFER,
            amount,
            previousBalance: fromAccount.balance,
            newBalance: fromAccount.balance - amount,
            description: description || 'Transferencia revertida',
            status: 'REVERTIDA'
        });

        return revertedTransaction;
    }
    // Guardar transacción
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

/* =========================
COMPRA (WITHDRAW)
========================= */
export const purchaseTransaction = async (accountNumber, amount, description = 'Compra de producto') => {

    amount = Number(amount);
    if (!amount || amount <= 0) throw new Error('Monto inválido');

    // Obtener cuenta
    const accountResponse = await axios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;

    if (!account) throw new Error('Cuenta no encontrada');
    if (account.balance < amount) throw new Error('Saldo insuficiente');

    const previousBalance = account.balance;
    const newBalance = previousBalance - amount;

    // Descontar saldo en account-service
    await axios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
        amount,
        type: TRANSACTION_TYPES.WITHDRAW
    });

    // Guardar en transaction-PS → transactions
    const transaction = await Transaction.create({
        accountId: account._id,
        accountNumber: account.accountNumber,
        type: TRANSACTION_TYPES.WITHDRAW,
        amount,
        previousBalance,
        newBalance,
        description
    });

    return transaction;
};

/* =========================
LISTAR TRANSACCIONES
========================= */
export const getAllTransactionsByAccount = async (accountNumber) => {
    return await Transaction.find({ accountNumber }).sort({ createdAt: -1 });
};

export const getLastTransactionsByAccount = async (accountNumber, limit = 5) => {
    return await Transaction.find({ accountNumber }).sort({ createdAt: -1 }).limit(limit);
};

/* =========================
ENVÍO DE EMAIL
========================= */
export const sendTransactionEmail = async (to, transaction) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const message = {
        from: `"PaySmart Soporte" <${process.env.SMTP_USER}>`,
        to,
        subject: `Transacción ${transaction.type} realizada`,
        text: `Se ha realizado una transacción por ${transaction.amount} en la cuenta ${transaction.accountNumber}.`,
        html: `<p>Se ha realizado una transacción por <b>${transaction.amount}</b> en la cuenta <b>${transaction.accountNumber}</b>.</p>`
    };

    // Esperar 1 minuto antes de enviar
    setTimeout(async () => {
        try {
            // Chequear estado actual
            const freshTransaction = await Transaction.findById(transaction._id);
            if (!freshTransaction || freshTransaction.status === 'REVERTIDA') return;

            await transporter.sendMail(message);
        } catch (err) {
            console.error('Error enviando correo tras 1 minuto:', err.message);
        }
    }, 60000);
};

/* =========================
REPORTE: CUENTAS CON MÁS MOVIMIENTOS (ASC/DESC)
========================= */
export const getAccountsMostMovements = async (order = 'desc', limit = 10) => {
    const safeOrder = String(order).toLowerCase();
    const sortValue = safeOrder === 'asc' ? 1 : -1;

    const parsedLimit = Number.parseInt(limit, 10);
    const finalLimit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(parsedLimit, 100));

    const report = await Transaction.aggregate([
        // Opcional: ignorar transacciones revertidas
        { $match: { status: { $ne: 'REVERTIDA' } } },

        {
            $group: {
                _id: '$accountNumber',
                accountId: { $first: '$accountId' },
                totalMovements: { $sum: 1 },
                lastMovementAt: { $max: '$createdAt' }
            }
        },
        { $sort: { totalMovements: sortValue, lastMovementAt: -1 } },
        { $limit: finalLimit },
        {
            $project: {
                _id: 0,
                accountNumber: '$_id',
                accountId: 1,
                totalMovements: 1,
                lastMovementAt: 1
            }
        }
    ]);

    return report;
};

export const getAccountsAdminOverview = async (limit = 5) => {

    const parsedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 5 : Math.max(1, Math.min(parsedLimit, 20));

    // Obtener cuentas únicas desde transacciones
    const accounts = await Transaction.aggregate([
        { $match: { status: { $ne: 'REVERTIDA' } } },
        {
            $group: {
                _id: '$accountNumber',
                accountId: { $first: '$accountId' }
            }
        }
    ]);

    const result = [];

    for (const acc of accounts) {

        // Obtener saldo desde account-service
        const accountResponse = await axios.get(
            `${ACCOUNT_SERVICE_URL}/internal/${acc._id}/balance`
        );

        const accountData = accountResponse.data;

        // Obtener últimos movimientos
        const lastMovements = await Transaction.find({
            accountNumber: acc._id,
            status: { $ne: 'REVERTIDA' }
        })
            .select('type amount description status createdAt newBalance -_id')
            .sort({ createdAt: -1 })
            .limit(safeLimit);

        result.push({
            accountNumber: acc._id,
            balance: accountData.balance,
            lastMovements
        });
    }

    return result;
};