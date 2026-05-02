import { axiosTransaction } from './api';

// POST /paySmart/v1/transaction/deposit
export const deposit = async ({ accountNumber, amount, description }) => {
    return await axiosTransaction.post('/transaction/deposit', { accountNumber, amount, description });
};

// POST /paySmart/v1/transaction/transfer
export const transfer = async ({ fromAccountNumber, toAccountNumber, amount, description }) => {
    return await axiosTransaction.post('/transaction/transfer', { fromAccountNumber, toAccountNumber, amount, description });
};

// POST /paySmart/v1/transaction/purchase
export const purchase = async ({ accountNumber, amount, description }) => {
    return await axiosTransaction.post('/transaction/purchase', { accountNumber, amount, description });
};

// PUT /paySmart/v1/transaction/reverse/:transactionId
export const reverseDeposit = async (transactionId) => {
    return await axiosTransaction.put(`/transaction/reverse/${transactionId}`);
};

// GET /paySmart/v1/transaction/:accountNumber
export const getTransactions = async (accountNumber) => {
    return await axiosTransaction.get(`/transaction/${accountNumber}`);
};

// GET /paySmart/v1/transaction/:accountNumber/last
export const getLastTransactions = async (accountNumber) => {
    return await axiosTransaction.get(`/transaction/${accountNumber}/last`);
};

// GET /paySmart/v1/transaction/internal/stats/accounts-most-movements?order=desc&limit=10
export const getAccountsMostMovements = async ({ order = 'desc', limit = 10 } = {}) => {
    return await axiosTransaction.get('/transaction/internal/stats/accounts-most-movements', {
        params: { order, limit },
    });
};

// GET /paySmart/v1/transaction/internal/admin/accounts-overview?limit=5
export const getAccountsAdminOverview = async ({ limit = 5 } = {}) => {
    return await axiosTransaction.get('/transaction/internal/admin/accounts-overview', {
        params: { limit },
    });
};