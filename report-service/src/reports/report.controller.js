'use strict';

import { getAccountsMostMovementsReport, getAccountsAdminOverviewReport  } from './report.service.js';

// GET /reports/accounts-most-movements?order=asc|desc&limit=10
export const accountsMostMovementsReportController = async (req, res) => {
    try {
        const { order = 'desc', limit = '10' } = req.query;
        const authHeader = req.headers.authorization;
        const report = await getAccountsMostMovementsReport(order, limit, authHeader);

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.response?.data?.message || error.message
        });
    }
};

export const accountsAdminOverviewController = async (req, res) => {
    try {

        const { limit = '5' } = req.query;
        const authHeader = req.headers.authorization;

        const report = await getAccountsAdminOverviewReport(limit, authHeader);

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.response?.data?.message || error.message
        });
    }
};