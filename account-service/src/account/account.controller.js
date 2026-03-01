import { createAccountRecord, getAccountsByUser, getAccountBalance } from './account.service.js';
import Account from './account.model.js';

// Crear una nueva cuenta bancaria asociada al usuario autenticado
export const createAccount = async (req, res) => {
    try {
        const account = await createAccountRecord({
            accountData: {
                ...req.body,
                userId: req.user.id
            }
        });

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente.',
            data: account
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta.',
            error: err.message
        });
    }
};

// Obtener todas las cuentas del usuario autenticado
export const getMyAccounts = async (req, res, next) => {
    try {
        const accounts = await getAccountsByUser(req.user.id);

        res.status(200).json({
            success: true,
            data: accounts
        });
    } catch (err) {
        next(err);
    }
};

// Consultar saldo de una cuenta específica del usuario autenticado
export const getBalance = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const userId = req.user.id;

        const balanceInfo = await getAccountBalance(accountNumber, userId);

        if (!balanceInfo) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada o no pertenece al usuario',
                error: 'ACCOUNT_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            data: balanceInfo
        });
    } catch (err) {
        next(err);
    }
};

// Consultar saldo de una cuenta sin autenticación (uso interno entre microservicios)
export const getBalanceInternal = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            accountNumber: account.accountNumber,
            balance: account.balance,
            _id: account._id
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Actualizar saldo de una cuenta (uso interno entre microservicios)
// Soporta DEPOSIT para sumar y WITHDRAW para restar
export const updateBalanceInternal = async (req, res) => {
    try {
        let { amount, type } = req.body;
        const { accountNumber } = req.params;

        amount = Number(amount);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser un número mayor a 0'
            });
        }

        const account = await Account.findOne({ accountNumber });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (type === 'DEPOSIT') {
            account.balance += amount;
        } else if (type === 'WITHDRAW') {
            if (account.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Fondos insuficientes'
                });
            }
            account.balance -= amount;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de operación inválido. Use DEPOSIT o WITHDRAW'
            });
        }

        await account.save();

        res.status(200).json({
            success: true,
            data: account
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};