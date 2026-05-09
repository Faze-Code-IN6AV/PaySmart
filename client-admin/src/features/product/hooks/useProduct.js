import { useEffect } from 'react';
import { useProductStore } from '../store/productStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export const useProduct = () => {
    const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN_ROLE');

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
        fetchProducts();
    }, []);

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
        createPurchase,
        clearError,
    };
};