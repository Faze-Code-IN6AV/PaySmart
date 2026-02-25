'use strict';

import { deposit, reverseDeposit } from './transaction.service.js';
import Transaction from './transaction.model.js';

// POST /transaction/deposit
export const depositController = async (req, res) => {
    try {
        const { accountNumber, amount, description } = req.body;

        if (!accountNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios: accountNumber y amount'
            });
        }

        const transaction = await deposit(accountNumber, amount, description);

        return res.status(201).json({
            success: true,
            transaction
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// PUT /transaction/reverse/:transactionId
export const reverseDepositController = async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar el transactionId'
            });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        const result = await reverseDeposit(
            transactionId,
            transaction.accountNumber,
            req.user?.role || 'USER',  // Ajusta según autenticación
            transaction.createdAt
        );

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};