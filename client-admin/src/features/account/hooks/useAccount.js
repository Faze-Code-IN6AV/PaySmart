import { useEffect } from 'react';
import { useAccountStore } from '../store/accountStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export const useAccount = () => {
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'ADMIN_ROLE';

    const accounts = useAccountStore((s) => s.accounts);
    const loading = useAccountStore((s) => s.loading);
    const error = useAccountStore((s) => s.error);
    const searchResults = useAccountStore((s) => s.searchResults);
    const searchLoading = useAccountStore((s) => s.searchLoading);

    const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
    const createAccount = useAccountStore((s) => s.createAccount);
    const getAccountBalance = useAccountStore((s) => s.getAccountBalance);
    const getBalanceInternal = useAccountStore((s) => s.getBalanceInternal);
    const searchByEmail = useAccountStore((s) => s.searchByEmail);
    const suspendAccount = useAccountStore((s) => s.suspendAccount);
    const activateAccount = useAccountStore((s) => s.activateAccount);
    const deactivateAccount = useAccountStore((s) => s.deactivateAccount);
    const clearSearch = useAccountStore((s) => s.clearSearch);

    // Solo cargar cuentas propias si es usuario normal
    useEffect(() => {
        if (!isAdmin) fetchAccounts();
    }, []);

    const queryBalance = async (accountNumber) => {
        if (isAdmin) return await getBalanceInternal(accountNumber);
        return await getAccountBalance(accountNumber);
    };

    return {
        accounts,
        loading,
        error,
        isAdmin,
        searchResults,
        searchLoading,
        createAccount,
        queryBalance,
        searchByEmail,
        suspendAccount,
        activateAccount,
        deactivateAccount,
        clearSearch,
    };
};