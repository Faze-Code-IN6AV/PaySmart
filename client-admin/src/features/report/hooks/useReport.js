import { useEffect } from 'react';
import { useReportStore } from '../store/reportStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export const useReport = () => {
    const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN_ROLE');
    const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);

    const accountsMostMovements = useReportStore((s) => s.accountsMostMovements);
    const accountsAdminOverview = useReportStore((s) => s.accountsAdminOverview);
    const loading = useReportStore((s) => s.loading);
    const error = useReportStore((s) => s.error);

    const fetchAccountsMostMovements = useReportStore((s) => s.fetchAccountsMostMovements);
    const fetchAccountsAdminOverview = useReportStore((s) => s.fetchAccountsAdminOverview);
    const clearError = useReportStore((s) => s.clearError);

    useEffect(() => {
        // TODO: descomentar cuando el backend esté disponible
        // if (!isLoadingAuth && isAdmin) {
        //     fetchAccountsMostMovements();
        //     fetchAccountsAdminOverview();
        // }
    }, [isLoadingAuth, isAdmin]);

    return {
        isAdmin,
        accountsMostMovements,
        accountsAdminOverview,
        loading,
        error,
        fetchAccountsMostMovements,
        fetchAccountsAdminOverview,
        clearError,
    };
};