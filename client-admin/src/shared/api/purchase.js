import { axiosProduct } from './api';

// ADMIN — todas las compras
export const getAllPurchases = async () => {
    return await axiosProduct.get('/purchases/admin/all');
};

// USER — mis compras
export const getMyPurchases = async () => {
    return await axiosProduct.get('/purchases');
};

// POST — crear compra (USER)
export const createPurchase = async (purchaseData) => {
    return await axiosProduct.post('/purchases', purchaseData);
};