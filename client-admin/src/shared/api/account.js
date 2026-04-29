import { axiosAccount } from './api';

// POST /paySmart/v1/account — Crear cuenta
export const createAccount = async ({ accountType, balance }) => {
    return await axiosAccount.post('/account', { accountType, balance });
};

// GET /paySmart/v1/account — Obtener mis cuentas
export const getMyAccounts = async () => {
    return await axiosAccount.get('/account');
};

// GET /paySmart/v1/account/:accountNumber/balance — Consultar saldo propio
export const getAccountBalance = async (accountNumber) => {
    return await axiosAccount.get(`/account/${accountNumber}/balance`);
};

// GET /paySmart/v1/account/internal/:accountNumber/balance — Solo microservicios
export const getBalanceInternal = async (accountNumber) => {
    return await axiosAccount.get(`/account/internal/${accountNumber}/balance`);
};

// PATCH /paySmart/v1/account/internal/:accountNumber/balance — Solo microservicios
export const updateBalanceInternal = async (accountNumber, { amount, type }) => {
    return await axiosAccount.patch(`/account/internal/${accountNumber}/balance`, { amount, type });
};

// GET /paySmart/v1/account/admin/user/:email — Cuentas por email (solo ADMIN_ROLE)
export const getAccountsByEmail = async (email) => {
    return await axiosAccount.get(`/account/admin/user/${encodeURIComponent(email)}`);
};

// PATCH /paySmart/v1/account/admin/:accountNumber/suspend — Suspender (solo ADMIN_ROLE)
export const suspendAccount = async (accountNumber) => {
    return await axiosAccount.patch(`/account/admin/${accountNumber}/suspend`);
};

// PATCH /paySmart/v1/account/admin/:accountNumber/activate — Activar (solo ADMIN_ROLE)
export const activateAccount = async (accountNumber) => {
    return await axiosAccount.patch(`/account/admin/${accountNumber}/activate`);
};

// PATCH /paySmart/v1/account/admin/:accountNumber/deactivate — Cerrar/eliminar (solo ADMIN_ROLE)
export const deactivateAccount = async (accountNumber) => {
    return await axiosAccount.patch(`/account/admin/${accountNumber}/deactivate`);
};