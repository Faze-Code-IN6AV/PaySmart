import { useEffect } from 'react';
import { useProductStore } from '../store/productStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export const useProduct = () => {
    const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN_ROLE');
    const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);

    const {
        products,
        purchases,
        loading,
        purchasesLoading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        disableProduct,
        enableProduct,
        fetchPurchases,
        createPurchase,
        clearError,
    } = useProductStore();

    useEffect(() => {
        if (!isLoadingAuth) {
            fetchProducts(isAdmin);
        }
    }, [isLoadingAuth, isAdmin]);

    return {
        isAdmin,
        products,
        purchases,
        loading,
        purchasesLoading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        disableProduct,
        enableProduct,
        fetchPurchases,
        createPurchase: (purchaseData) => createPurchase(purchaseData, isAdmin),
        clearError,
    };
};