'use strict';

import axios from 'axios';

// Reporte de cuentas con más movimientos, con orden y límite configurables
export const getAccountsMostMovementsReport = async (order = 'desc', limit = 10, authHeader = '') => {
    const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL;
    const safeOrder = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';
    const parsedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(parsedLimit, 100));

    const response = await axios.get(
        `${TRANSACTION_SERVICE_URL}/internal/stats/accounts-most-movements`,
        {
            params: { order: safeOrder, limit: safeLimit },
            headers: authHeader ? { Authorization: authHeader } : undefined
        }
    );

    return response.data.report;
};

// Reporte de resumen administrativo de cuentas con sus últimos movimientos
export const getAccountsAdminOverviewReport = async (limit = 5, authHeader = '') => {
    const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL;
    const parsedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 5 : Math.max(1, Math.min(parsedLimit, 20));

    const response = await axios.get(
        `${TRANSACTION_SERVICE_URL}/internal/admin/accounts-overview`,
        {
            params: { limit: safeLimit },
            headers: authHeader ? { Authorization: authHeader } : undefined
        }
    );

    return response.data.report;
};