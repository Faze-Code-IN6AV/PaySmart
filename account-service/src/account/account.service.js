'use strict';

import Account from './account.model.js'

export const createAccountRecord = async ({ accountData }) => {
    const data = { ...accountData };

    const existing = await Account.findOne({ 
        userId: data.userId, 
        accountType: data.accountType,
        status: { $ne: 'CERRADO' }
    });

    if (existing) {
        throw new Error(`Ya tienes una cuenta de tipo ${data.accountType}`);
    }

    const account = new Account(data);
    await account.save();

    return account;
};

export const getAccountsByUser = async (userId) => {
    return await Account.find({ userId });
};

export const getAccountBalance = async (accountNumber, userId) => {
    const account = await Account.findOne({ accountNumber, userId });

    if (!account) return null;

    return {
        accountNumber: account.accountNumber,
        balance: account.balance
    };
};

// Obtener cuentas por email — uso admin
export const getAccountsByEmail = async (email) => {
    return await Account.find({ email: email });
};

// Eliminar cuenta (marcar como CERRADO) — solo admin
export const deactivateAccountRecord = async (accountNumber) => {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
        throw new Error('Cuenta no encontrada');
    }

    if (account.status === 'CERRADO') {
        throw new Error('La cuenta ya está cerrada');
    }

    account.status = 'CERRADO';
    await account.save();

    return account;
};

// Activar cuenta suspendida — solo admin
export const activateAccountRecord = async (accountNumber) => {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
        throw new Error('Cuenta no encontrada');
    }

    if (account.status === 'ACTIVO') {
        throw new Error('La cuenta ya está activa');
    }

    if (account.status === 'CERRADO') {
        throw new Error('Una cuenta cerrada no puede reactivarse');
    }

    account.status = 'ACTIVO';
    await account.save();

    return account;
};

// suspender cuenta (marcar como SUSPENDIDO) — solo admin
export const suspendAccountRecord = async (accountNumber) => {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
        throw new Error('Cuenta no encontrada');
    }

    if (account.status === 'SUSPENDIDO') {
        throw new Error('La cuenta ya está suspendida');
    }

    account.status = 'SUSPENDIDO';
    await account.save();

    return account;
};