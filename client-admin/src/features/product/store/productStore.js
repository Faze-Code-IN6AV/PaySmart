import { create } from 'zustand';
import {
    getAllProducts,
    getAvailableProducts,
    createProduct as createProductRequest,
    updateProduct as updateProductRequest,
    disableProduct as disableProductRequest,
    enableProduct as enableProductRequest,
    getAllPurchases,
    getMyPurchases,
    createPurchase as createPurchaseRequest,
} from '../../../shared/api';
import { showError, showSuccess, showWarning } from '../../../shared/utils/toast.js';

export const useProductStore = create((set) => ({
    products: [],
    purchases: [],
    loading: false,
    purchasesLoading: false,
    error: null,

    // ─── PRODUCTOS ────────────────────────────────────────────────────────────

    fetchProducts: async (isAdmin) => {
        // Esperar a que el authStore rehidrate (isAdmin puede ser undefined el primer tick)
        if (isAdmin === undefined) return;
        try {
            set({ loading: true, error: null });
            // Admin: GET /products (todos, incluye INACTIVO)
            // Usuario: GET /products/available/list (solo ACTIVO)
            const { data } = isAdmin
                ? await getAllProducts()
                : await getAvailableProducts();
            set({ products: data.data ?? [], loading: false });
        } catch (err) {
            console.error('[fetchProducts] error:', err?.response?.status, err?.response?.data || err?.message);
            set({ products: [], loading: false, error: err?.response?.data?.message || 'Error al cargar productos' });
        }
    },

    createProduct: async (productData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createProductRequest(productData);
            set((state) => ({ products: [...state.products, data.data], loading: false }));
            showSuccess('¡Producto creado exitosamente!');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al crear el producto';
            set({ loading: false });
            showWarning(message);
            return { success: false, error: message };
        }
    },

    updateProduct: async (id, productData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateProductRequest(id, productData);
            set((state) => ({
                products: state.products.map((p) =>
                    p._id === id ? { ...p, ...data.data } : p
                ),
                loading: false,
            }));
            showSuccess('Producto actualizado correctamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al actualizar el producto';
            set({ loading: false });
            showError(message);
            return { success: false, error: message };
        }
    },

    disableProduct: async (id) => {
        try {
            await disableProductRequest(id);
            set((state) => ({
                products: state.products.map((p) =>
                    p._id === id ? { ...p, status: 'INACTIVO' } : p
                ),
            }));
            showSuccess('Producto desactivado correctamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al desactivar el producto';
            showError(message);
            return { success: false, error: message };
        }
    },

    enableProduct: async (id) => {
        try {
            await enableProductRequest(id);
            set((state) => ({
                products: state.products.map((p) =>
                    p._id === id ? { ...p, status: 'ACTIVO' } : p
                ),
            }));
            showSuccess('Producto activado correctamente.');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al activar el producto';
            showError(message);
            return { success: false, error: message };
        }
    },

    // ─── COMPRAS ──────────────────────────────────────────────────────────────

    fetchPurchases: async (isAdmin) => {
        try {
            set({ purchasesLoading: true });
            const { data } = isAdmin ? await getAllPurchases() : await getMyPurchases();
            // El backend retorna { success, purchases }
            set({ purchases: data.purchases ?? [], purchasesLoading: false });
        } catch (err) {
            const message = err.response?.data?.message || 'Error al cargar las compras';
            set({ purchases: [], purchasesLoading: false });
            showError(message);
        }
    },

    createPurchase: async (purchaseData, isAdmin) => {
        try {
            const { data } = await createPurchaseRequest(purchaseData);
            // El backend retorna { success, purchase }
            set((state) => ({ purchases: [data.purchase, ...state.purchases] }));
            showSuccess('¡Compra realizada exitosamente!');

            // Refrescar productos para que el stock se actualice en tiempo real
            const { data: productsData } = isAdmin
                ? await getAllProducts()
                : await getAvailableProducts();
            set({ products: productsData.data ?? [] });

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Error al realizar la compra';
            showError(message);
            return { success: false, error: message };
        }
    },

    clearError: () => set({ error: null }),
}));