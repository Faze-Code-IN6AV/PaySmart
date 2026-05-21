'use strict';

import axios from 'axios';
import Transaction, { TRANSACTION_TYPES } from './transaction.model.js';
import nodemailer from 'nodemailer';

// URL del account-service desde variables de entorno (no hardcodeado)
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3001/paySmart/v1/account';
const MAX_TRANSFER_PER_TRANSACTION = 2000;
const MAX_DAILY_TRANSFER = 10000;

// Axios con API Key interna para comunicación entre servicios
const internalAxios = axios.create();
internalAxios.interceptors.request.use((config) => {
    config.headers['X-Internal-Api-Key'] = process.env.INTERNAL_API_KEY || '';
    return config;
});

/* =========================
DEPOSITO
========================= */
export const deposit = async (accountNumber, amount, description = '') => {

    // Validar monto
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Monto inválido');

    const accountResponse = await internalAxios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;
    if (!account) throw new Error('Cuenta no encontrada');

    if (account.status === 'SUSPENDIDO') throw new Error('La cuenta está suspendida y no puede recibir depósitos');
    if (account.status === 'CERRADO') throw new Error('La cuenta está cerrada y no puede recibir depósitos');

    const previousBalance = account.balance;
    const newBalance = previousBalance + amount;

    await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
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

    // Validar que no esté ya revertida
    if (transaction.status === 'REVERTIDA') throw new Error('Esta transacción ya fue revertida');

    if (transaction.type !== TRANSACTION_TYPES.DEPOSIT) throw new Error('Solo se pueden revertir depósitos');

    // Validar que no haya pasado más de 1 minuto
    const diffSeconds = (new Date() - new Date(transaction.createdAt)) / 1000;
    if (diffSeconds > 60) throw new Error('Tiempo de reversión expirado');

    const accountResponse = await internalAxios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;
    if (!account) throw new Error('Cuenta no encontrada');

    const newBalance = account.balance - transaction.amount;
    if (newBalance < 0) throw new Error('Saldo insuficiente para revertir');

    await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
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
    if (isNaN(amount) || amount <= 0) throw new Error('Monto inválido');

    // Validar que no sea la misma cuenta
    if (fromAccountNumber === toAccountNumber) throw new Error('No puedes transferir a la misma cuenta');

    if (amount > MAX_TRANSFER_PER_TRANSACTION) throw new Error('Excede el límite por transacción');

    const fromResponse = await internalAxios.get(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`);
    const toResponse = await internalAxios.get(`${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`);

    const fromAccount = fromResponse.data;
    const toAccount = toResponse.data;
    if (!fromAccount || !toAccount) throw new Error('Cuenta no encontrada');
    if (fromAccount.status === 'SUSPENDIDO') throw new Error('Tu cuenta está suspendida y no puede realizar transferencias');
    if (fromAccount.status === 'CERRADO') throw new Error('Tu cuenta está cerrada y no puede realizar transferencias');
    if (toAccount.status === 'SUSPENDIDO') throw new Error('La cuenta destino está suspendida y no puede recibir transferencias');
    if (toAccount.status === 'CERRADO') throw new Error('La cuenta destino está cerrada y no puede recibir transferencias');
    if (fromAccount.balance < amount) throw new Error('Saldo insuficiente');

    // Validar límite diario
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyTotal = await Transaction.aggregate([
        { $match: { accountId: fromAccount._id, type: TRANSACTION_TYPES.TRANSFER, createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalToday = dailyTotal[0]?.total || 0;
    if ((totalToday + amount) > MAX_DAILY_TRANSFER) throw new Error('Excede el límite diario');

    // Descontar saldo de la cuenta origen
    await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`, {
        amount,
        type: TRANSACTION_TYPES.WITHDRAW
    });

    try {
        // Acreditar saldo en la cuenta destino
        await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${toAccountNumber}/balance`, {
            amount,
            type: TRANSACTION_TYPES.DEPOSIT
        });

    } catch (err) {
        // Si falla el depósito en destino, revertir el retiro en origen (rollback)
        await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${fromAccountNumber}/balance`, {
            amount,
            type: TRANSACTION_TYPES.DEPOSIT
        });

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
    if (isNaN(amount) || amount <= 0) throw new Error('Monto inválido');

    const accountResponse = await internalAxios.get(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`);
    const account = accountResponse.data;

    if (!account) throw new Error('Cuenta no encontrada');
    if (account.status === 'SUSPENDIDO') throw new Error('Tu cuenta está suspendida y no puede realizar compras');
    if (account.status === 'CERRADO') throw new Error('Tu cuenta está cerrada y no puede realizar compras');
    if (account.balance < amount) throw new Error('Saldo insuficiente');

    const previousBalance = account.balance;
    const newBalance = previousBalance - amount;

    await internalAxios.patch(`${ACCOUNT_SERVICE_URL}/internal/${accountNumber}/balance`, {
        amount,
        type: TRANSACTION_TYPES.WITHDRAW
    });

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

    // Esperar 1 minuto antes de enviar para dar tiempo a posible reversión
    setTimeout(async () => {
        try {
            const freshTransaction = await Transaction.findById(transaction._id);
            if (!freshTransaction || freshTransaction.status === 'REVERTIDA') return;

            await transporter.sendMail(message);
        } catch (err) {
            console.error('Error enviando correo:', err.message);
        }
    }, 60000);
};

/* =========================
REPORTE: CUENTAS CON MÁS MOVIMIENTOS
========================= */
export const getAccountsMostMovements = async (order = 'desc', limit = 10) => {
    const safeOrder = String(order).toLowerCase();
    const sortValue = safeOrder === 'asc' ? 1 : -1;

    const parsedLimit = Number.parseInt(limit, 10);
    const finalLimit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(parsedLimit, 100));

    const report = await Transaction.aggregate([
        { $match: { status: { $ne: 'REVERTIDA' } } },
        {
            $group: {
                _id: '$accountNumber',
                accountId: { $first: '$accountId' },
                totalMovements: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
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
                totalAmount: 1,
                lastMovementAt: 1
            }
        }
    ]);

    return report;
};

/* =========================
REPORTE: OVERVIEW ADMIN
========================= */
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
        // Obtener saldo actual desde account-service (con API Key interna)
        const accountResponse = await internalAxios.get(
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
            status: accountData.status,
            lastMovements
        });
    }

    return result;
};