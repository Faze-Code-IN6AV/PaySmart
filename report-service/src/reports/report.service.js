'use strict';

import axios from 'axios';

const TRANSACTION_SERVICE_URL = 'http://localhost:3030/paySmart/v1/transaction';

export const getAccountsMostMovementsReport = async (order = 'desc', limit = 10, authHeader = '') => {
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

    // Se espera que transaction-service responda: { success: true, report: [...] }
    return response.data.report;
};

export const getAccountsAdminOverviewReport = async (limit = 5, authHeader = '') => {

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