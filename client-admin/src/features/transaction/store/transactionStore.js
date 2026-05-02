import { create } from 'zustand';
import {
    deposit as depositRequest,
    transfer as transferRequest,
    purchase as purchaseRequest,
    reverseDeposit as reverseDepositRequest,
    getTransactions as getTransactionsRequest,
    getLastTransactions as getLastTransactionsRequest,
} from '../../../shared/api/index.js';
import { showError, showSuccess, showWarning } from '../../../shared/utils/toast.js';

export const useTransactionStore = create((set) => ({
    transactions: [],
    lastTransactions: [],
    loading: false,
    error: null,

    fetchTransactions: async (accountNumber) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getTransactionsRequest(accountNumber);
            set({ transactions: data.transactions ?? [], loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener las transacciones';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    fetchLastTransactions: async (accountNumber) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getLastTransactionsRequest(accountNumber);
            set({ lastTransactions: data.transactions ?? [], loading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al obtener las últimas transacciones';
            set({ error: message, loading: false });
            showError(message);
        }
    },

    deposit: async ({ accountNumber, amount, description }) => {
        try {
            set({ loading: true, error: null });
            const { data } = await depositRequest({ accountNumber, amount, description });
            const tx = data.transaction;
            set((state) => ({
                transactions: [tx, ...state.transactions],
                lastTransactions: [tx, ...state.lastTransactions].slice(0, 5),
                loading: false,
            }));
            showSuccess('¡Depósito realizado exitosamente!');
            return { success: true, transaction: tx };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al realizar el depósito';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    transfer: async ({ fromAccountNumber, toAccountNumber, amount, description }) => {
        try {
            set({ loading: true, error: null });
            const { data } = await transferRequest({ fromAccountNumber, toAccountNumber, amount, description });
            const tx = data.transaction;
            set((state) => ({
                transactions: [tx, ...state.transactions],
                lastTransactions: [tx, ...state.lastTransactions].slice(0, 5),
                loading: false,
            }));
            showSuccess('¡Transferencia realizada exitosamente!');
            return { success: true, transaction: tx };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al realizar la transferencia';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    purchase: async ({ accountNumber, amount, description }) => {
        try {
            set({ loading: true, error: null });
            const { data } = await purchaseRequest({ accountNumber, amount, description });
            const tx = data.transaction;
            set((state) => ({
                transactions: [tx, ...state.transactions],
                lastTransactions: [tx, ...state.lastTransactions].slice(0, 5),
                loading: false,
            }));
            showSuccess('¡Compra registrada exitosamente!');
            return { success: true, transaction: tx };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al registrar la compra';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    reverseDeposit: async (transactionId) => {
        try {
            set({ loading: true, error: null });
            await reverseDepositRequest(transactionId);
            set((state) => ({
                transactions: state.transactions.map((tx) =>
                    tx._id === transactionId ? { ...tx, status: 'REVERTIDA' } : tx
                ),
                lastTransactions: state.lastTransactions.map((tx) =>
                    tx._id === transactionId ? { ...tx, status: 'REVERTIDA' } : tx
                ),
                loading: false,
            }));
            showSuccess('Depósito revertido correctamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al revertir el depósito';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    clearError: () => set({ error: null }),
}));
