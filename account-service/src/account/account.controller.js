import { createAccountRecord } from "./account.service.js";
import { getAccountsByUser } from './account.service.js';
import { getAccountBalance } from './account.service.js';
import Account from './account.model.js';


export const createAccount = async (req, res) => {
    try{
        const account = await createAccountRecord({
            accountData: {
                ...req.body,
                userId: req.user.id  
            }
        });

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente!',
            data: account
        });
    }catch(err){
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta.',
            error: err.message
        });
    }
}


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

export const getBalance = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const userId = req.user.id; // usuario autenticado

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

export const getBalanceInternal = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                message: 'Cuenta no encontrada'
            });
        }

        res.json({
            accountNumber: account.accountNumber,
            balance: account.balance,
            _id: account._id
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const updateBalanceInternal = async (req, res) => {
    try {
        const { amount, type } = req.body;
        const { accountNumber } = req.params;

        const account = await Account.findOne({ accountNumber });
        if (!account) throw new Error('Cuenta no encontrada');

        if (type === 'DEPOSIT') {
            account.balance += amount;
        }

        if (type === 'WITHDRAW') {
            if (account.balance < amount)
                throw new Error('Fondos insuficientes');

            account.balance -= amount;
        }

        await account.save();

        res.json(account);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};