'use strict';

import { deposit, reverseDeposit, transfer, purchaseTransaction, getAllTransactionsByAccount, getLastTransactionsByAccount, sendTransactionEmail } from './transaction.service.js';
import Transaction from './transaction.model.js';
import { getAccountById, updateAccountBalance } from '../utils/accoutn.client.js';

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

        const userEmail = req.user?.email;

        const transaction = await deposit(accountNumber, amount, description);

        // Enviar correo de depósito después de 1 minuto (60.000 ms)
        if (userEmail) {
            setTimeout(async () => {
                try {
                    await sendTransactionEmail(userEmail, transaction);
                } catch (err) {
                    // Puedes loguear el error en un logger de producción sin exponer info sensible
                }
            }, 60000);
        }

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
            req.user?.role || 'USER',
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

// POST /transaction/transfer
export const transferController = async (req, res) => {
    try {
        const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

        if (!fromAccountNumber || !toAccountNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        const userEmail = req.user?.email;

        const transaction = await transfer(fromAccountNumber, toAccountNumber, amount, description);

        // Enviar correo de transferencia de forma inmediata
        if (userEmail) {
            setTimeout(async () => {
                try {
                    await sendTransactionEmail(userEmail, transaction);
                } catch (err) {
                    // Logueo seguro, sin imprimir datos sensibles
                }
            }, 60000); // 1 minuto
        }

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

export const purchaseTransactionController = async (req, res) => {
    try {
        const { accountNumber, amount, description } = req.body;

        if (!accountNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        const transaction = await purchaseTransaction(accountNumber, amount, description);

        return res.status(201).json({
            success: true,
            transaction
        });

    } catch (error) {
        console.log('PURCHASE ERROR:', error?.response?.data || error);

        return res.status(400).json({
            success: false,
            message: error?.response?.data?.message || error?.message || String(error)
        });
    }
};

// GET /transaction/:accountNumber
export const listTransactionsController = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        if (!accountNumber) {
            return res.status(400).json({ success: false, message: 'Debe proporcionar el accountNumber' });
        }

        const transactions = await getAllTransactionsByAccount(accountNumber);

        return res.status(200).json({
            success: true,
            transactions
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /transaction/:accountNumber/last
export const listLastTransactionsController = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        if (!accountNumber) {
            return res.status(400).json({ success: false, message: 'Debe proporcionar el accountNumber' });
        }

        const transactions = await getLastTransactionsByAccount(accountNumber, 5);

        return res.status(200).json({
            success: true,
            transactions
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};