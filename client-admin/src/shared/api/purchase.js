import { axiosProduct } from './api';

// ADMIN — todas las compras  →  GET /purchases  (requiere ADMIN_ROLE)
export const getAllPurchases = async () => {
    return await axiosProduct.get('/purchases');
};

// USER — mis compras  →  GET /purchases/my
export const getMyPurchases = async () => {
    return await axiosProduct.get('/purchases/my');
};

// POST — crear compra (USER)
export const createPurchase = async (purchaseData) => {
    return await axiosProduct.post('/purchases', purchaseData);
};
