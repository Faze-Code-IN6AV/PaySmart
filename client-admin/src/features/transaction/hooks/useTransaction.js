import { useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export const useTransaction = (accountNumber) => {
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'ADMIN_ROLE';

    const transactions = useTransactionStore((s) => s.transactions);
    const lastTransactions = useTransactionStore((s) => s.lastTransactions);
    const loading = useTransactionStore((s) => s.loading);
    const error = useTransactionStore((s) => s.error);

    const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
    const fetchLastTransactions = useTransactionStore((s) => s.fetchLastTransactions);
    const deposit = useTransactionStore((s) => s.deposit);
    const transfer = useTransactionStore((s) => s.transfer);
    const purchase = useTransactionStore((s) => s.purchase);
    const reverseDeposit = useTransactionStore((s) => s.reverseDeposit);
    const clearError = useTransactionStore((s) => s.clearError);

    useEffect(() => {
        if (accountNumber) fetchLastTransactions(accountNumber);
    }, [accountNumber]);

    return {
        transactions,
        lastTransactions,
        loading,
        error,
        isAdmin,
        fetchTransactions,
        fetchLastTransactions,
        deposit,
        transfer,
        purchase,
        reverseDeposit,
        clearError,
    };
};
